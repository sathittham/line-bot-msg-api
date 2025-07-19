import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { Client, WebhookEvent } from '@line/bot-sdk';
import * as dotenv from 'dotenv';
import { google } from 'googleapis';

dotenv.config();

const sheets = google.sheets('v4');

// Initialize Google Auth
const GOOGLE_CREDENTIALS_BASE64 = process.env.GOOGLE_CREDENTIALS_BASE64;
let auth: any = null;

try {
    if (GOOGLE_CREDENTIALS_BASE64) {
        console.log('Google credentials (base64) found, length:', GOOGLE_CREDENTIALS_BASE64.length);

        // Decode base64 credentials
        const credentialsJson = Buffer.from(GOOGLE_CREDENTIALS_BASE64, 'base64').toString('utf-8');
        console.log('Decoded credentials length:', credentialsJson.length);

        const credentials = JSON.parse(credentialsJson);
        auth = new google.auth.JWT({
            email: credentials.client_email,
            key: credentials.private_key,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });
        console.log('Google auth initialized successfully');
    } else {
        console.log('No Google credentials found in environment');
    }
} catch (error) {
    console.error('Failed to initialize Google auth:', error);
    auth = null;
}

// Create a new LINE SDK client instance.
// It's best practice to create this outside the handler to allow for connection reuse.
const client = new Client({
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
    channelSecret: process.env.LINE_CHANNEL_SECRET || '',
});

// Simple in-memory storage for echo state per user
// In production, you might want to use a database like DynamoDB
const userEchoState: Map<string, boolean> = new Map();

/**
 * Appends a new row to the configured Google Sheet.
 * @param userId The ID of the user who sent the message.
 * @param displayName The display name of the user (if available).
 * @param messageType The type of message (text, image, sticker, video, audio, location, etc.).
 * @param messageContent The content of the message.
 * @param messageId The unique message ID from LINE.
 * @param direction Whether the message is incoming or outgoing.
 */
const logToGoogleSheet = async (
    userId: string,
    displayName: string = '',
    messageType: string = 'text',
    messageContent: string,
    messageId: string = '',
    direction: 'incoming' | 'outgoing' = 'incoming',
): Promise<void> => {
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    if (!spreadsheetId) {
        console.warn('Google Sheet ID not configured');
        return;
    }

    if (!auth) {
        console.warn('Google Auth not configured, skipping Google Sheets logging');
        return;
    }

    console.log(`Attempting to log ${direction} ${messageType} message to Google Sheet: ${spreadsheetId}`);

    try {
        // Convert to Bangkok time (UTC+7)
        const now = new Date();
        const bkkTime = new Date(now.getTime() + 7 * 60 * 60 * 1000);
        const timestamp = bkkTime.toISOString().replace('T', ' ').substring(0, 19);

        // A: Timestamp (BKK), B: Direction, C: UserID, D: DisplayName, E: MessageType, F: MessageContent, G: MessageID
        const values = [[timestamp, direction, userId, displayName, messageType, messageContent, messageId]];

        await sheets.spreadsheets.values.append({
            auth,
            spreadsheetId,
            range: 'Sheet1!A:G',
            valueInputOption: 'RAW',
            requestBody: { values },
        });

        console.log(`Successfully logged ${direction} ${messageType} message from ${userId} to Google Sheet`);
    } catch (error) {
        console.error('Error logging to Google Sheet:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Error details:', errorMessage);
        // Don't throw the error - just log it so the LINE webhook still works
    }
};

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // Check if this is a manual logging request
    if (event.path === '/log-manual-message' && event.httpMethod === 'POST') {
        return await handleManualMessageLogging(event);
    }

    // Otherwise, handle as normal LINE webhook
    return await handleLineWebhook(event);
};

/**
 * Handle manual message logging for LINE OA messages sent from the official account manager
 */
const handleManualMessageLogging = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        if (!event.body) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'No request body' }),
            };
        }

        const { userId, message } = JSON.parse(event.body);

        if (!userId || !message) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'userId and message are required' }),
            };
        }

        // Log the manual message as outgoing from LINE OA
        await logToGoogleSheet('BOT', 'BOT', 'text', message, '', 'outgoing');

        return {
            statusCode: 200,
            body: JSON.stringify({
                status: 'success',
                message: 'Manual message logged successfully',
            }),
        };
    } catch (error) {
        console.error('Error in manual message logging:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error logging manual message' }),
        };
    }
};

/**
 * Handle normal LINE webhook events
 */
const handleLineWebhook = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // Ensure environment variables are loaded, which are required for the client to work.
    if (!process.env.LINE_CHANNEL_ACCESS_TOKEN || !process.env.LINE_CHANNEL_SECRET) {
        console.error('Missing LINE environment variables. Please check your configuration.');
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Server configuration error: Missing credentials' }),
        };
    }

    // Check Google Sheets configuration
    if (!process.env.GOOGLE_SHEET_ID || !process.env.GOOGLE_CREDENTIALS) {
        console.warn('Google Sheets configuration missing. Messages will not be logged to sheets.');
    }

    // The request body from API Gateway is a string.
    if (!event.body) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: 'No request body' }),
        };
    }

    // Log the raw event for debugging
    console.log('Received raw event:', JSON.stringify(event, null, 2));

    try {
        const webhookEvents: WebhookEvent[] = JSON.parse(event.body).events;

        // Process all webhook events. Promise.all() ensures we wait for all replies to complete.
        await Promise.all(
            webhookEvents.map(async (webhookEvent) => {
                console.log(`Processing webhook event type: ${webhookEvent.type}`);

                // Handle message events (incoming messages from users)
                if (webhookEvent.type === 'message' && webhookEvent.message.type === 'text') {
                    const { replyToken } = webhookEvent;
                    const { text } = webhookEvent.message;

                    console.log(`Received text message: "${text}"`);

                    // Log incoming message to Google Sheet
                    if (webhookEvent.source.userId) {
                        try {
                            // Get display name if available from the profile
                            let displayName = '';
                            try {
                                const profile = await client.getProfile(webhookEvent.source.userId);
                                displayName = profile.displayName || '';
                            } catch (profileError) {
                                console.warn('Could not fetch user profile:', profileError);
                            }

                            await logToGoogleSheet(
                                webhookEvent.source.userId,
                                displayName,
                                'text',
                                text,
                                webhookEvent.message.id || '',
                                'incoming',
                            );
                        } catch (error) {
                            console.error('Failed to log incoming message to Google Sheet:', error);
                        }
                    } else {
                        console.warn('No userId available for logging incoming message');
                    }

                    // Handle echo control commands
                    let replyText: string;
                    const userId = webhookEvent.source.userId;

                    if (text.toLowerCase() === 'start echo') {
                        if (userId) {
                            userEchoState.set(userId, true);
                            replyText = '✅ Echo mode enabled! I will now repeat your messages.';
                        } else {
                            replyText = '❌ Unable to enable echo mode - no user ID available.';
                        }
                    } else if (text.toLowerCase() === 'stop echo') {
                        if (userId) {
                            userEchoState.set(userId, false);
                            replyText = '⏹️ Echo mode disabled! I will no longer repeat your messages.';
                        } else {
                            replyText = '❌ Unable to disable echo mode - no user ID available.';
                        }
                    } else {
                        // Check if echo is enabled for this user (default to false)
                        const isEchoEnabled = userId ? userEchoState.get(userId) || false : false;

                        if (isEchoEnabled) {
                            replyText = text; // Echo the message back
                        } else {
                            replyText = '🤖 Message received! Send "start echo" to enable echo mode.';
                        }
                    }

                    // Send the reply message
                    const replyResult = await client.replyMessage(replyToken, { type: 'text', text: replyText });

                    // Log outgoing message to Google Sheet
                    if (webhookEvent.source.userId) {
                        try {
                            await logToGoogleSheet('BOT', 'BOT', 'text', replyText, '', 'outgoing');
                            console.log(
                                `Logged both incoming and outgoing messages for user: ${webhookEvent.source.userId}`,
                            );
                        } catch (error) {
                            console.error('Failed to log outgoing message to Google Sheet:', error);
                        }
                    }

                    return replyResult;
                }

                // Handle delivery events (when messages are delivered to users)
                else if (webhookEvent.type === 'delivery') {
                    console.log('Delivery event received:', JSON.stringify(webhookEvent, null, 2));
                    // Note: Delivery events don't contain message content, only delivery confirmation
                    return Promise.resolve();
                }

                // Handle other message types (stickers, images, etc.)
                else if (webhookEvent.type === 'message') {
                    console.log(`Received ${webhookEvent.message.type} message from user`);

                    // Log non-text messages
                    if (webhookEvent.source.userId) {
                        const messageType = webhookEvent.message.type;
                        let messageContent = '';

                        // Extract content based on message type
                        switch (messageType) {
                            case 'image':
                                messageContent = 'Image message';
                                break;
                            case 'video':
                                messageContent = 'Video message';
                                break;
                            case 'audio':
                                messageContent = 'Audio message';
                                break;
                            case 'file':
                                messageContent = 'File message';
                                break;
                            case 'location':
                                const location = webhookEvent.message as any;
                                messageContent = `Location: ${location.title || 'Unknown'} (${location.latitude}, ${
                                    location.longitude
                                })`;
                                break;
                            case 'sticker':
                                const sticker = webhookEvent.message as any;
                                messageContent = `Sticker: Package ${sticker.packageId}, Sticker ${sticker.stickerId}`;
                                break;
                            default:
                                messageContent = `${messageType} message`;
                        }

                        try {
                            // Get display name if available
                            let displayName = '';
                            try {
                                const profile = await client.getProfile(webhookEvent.source.userId);
                                displayName = profile.displayName || '';
                            } catch (profileError) {
                                console.warn('Could not fetch user profile for non-text message:', profileError);
                            }

                            await logToGoogleSheet(
                                webhookEvent.source.userId,
                                displayName,
                                messageType,
                                messageContent,
                                webhookEvent.message.id || '',
                                'incoming',
                            );
                            console.log(`Logged ${messageType} message from user: ${webhookEvent.source.userId}`);
                        } catch (error) {
                            console.error(`Failed to log ${messageType} message:`, error);
                        }
                    }

                    // Send acknowledgment reply
                    if (webhookEvent.replyToken) {
                        const replyText = `🤖 I received your ${webhookEvent.message.type} message!`;
                        const replyResult = await client.replyMessage(webhookEvent.replyToken, {
                            type: 'text',
                            text: replyText,
                        });

                        // Log the bot's reply
                        if (webhookEvent.source.userId) {
                            try {
                                await logToGoogleSheet('BOT', 'BOT', 'text', replyText, '', 'outgoing');
                            } catch (error) {
                                console.error('Failed to log reply to non-text message:', error);
                            }
                        }

                        return replyResult;
                    }
                }

                // Handle follow/unfollow events
                else if (webhookEvent.type === 'follow') {
                    console.log('User followed the bot');
                    if (webhookEvent.source.userId) {
                        try {
                            // Get display name if available
                            let displayName = '';
                            try {
                                const profile = await client.getProfile(webhookEvent.source.userId);
                                displayName = profile.displayName || '';
                            } catch (profileError) {
                                console.warn('Could not fetch user profile for follow event:', profileError);
                            }

                            await logToGoogleSheet(
                                webhookEvent.source.userId,
                                displayName,
                                'system',
                                'User followed the bot',
                                '',
                                'incoming',
                            );
                        } catch (error) {
                            console.error('Failed to log follow event:', error);
                        }
                    }
                    return Promise.resolve();
                } else if (webhookEvent.type === 'unfollow') {
                    console.log('User unfollowed the bot');
                    if (webhookEvent.source.userId) {
                        try {
                            await logToGoogleSheet(
                                webhookEvent.source.userId,
                                '',
                                'system',
                                'User unfollowed the bot',
                                '',
                                'incoming',
                            );
                        } catch (error) {
                            console.error('Failed to log unfollow event:', error);
                        }
                    }
                    return Promise.resolve();
                }

                // You can add handlers for other event types (e.g., stickers, follows) here.
                console.log('Received unhandled event type:', webhookEvent.type);
            }),
        );

        // LINE webhook requires a 200 OK response to acknowledge receipt.
        return {
            statusCode: 200,
            body: JSON.stringify({ status: 'success' }),
        };
    } catch (err) {
        console.error('Error processing webhook:', err instanceof Error ? err.message : err);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error processing webhook' }),
        };
    }
};
