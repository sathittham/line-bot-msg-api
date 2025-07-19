import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { Client, WebhookEvent } from '@line/bot-sdk';
import * as dotenv from 'dotenv';
dotenv.config();

// Create a new LINE SDK client instance.
// It's best practice to create this outside the handler to allow for connection reuse.
const client = new Client({
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
    channelSecret: process.env.LINE_CHANNEL_SECRET || '',
});

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // Ensure environment variables are loaded, which are required for the client to work.
    if (!process.env.LINE_CHANNEL_ACCESS_TOKEN || !process.env.LINE_CHANNEL_SECRET) {
        console.error('Missing LINE environment variables. Please check your configuration.');
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Server configuration error: Missing credentials' }),
        };
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
                // We only handle message events, and specifically text messages.
                if (webhookEvent.type === 'message' && webhookEvent.message.type === 'text') {
                    const { replyToken } = webhookEvent;
                    const { text } = webhookEvent.message;

                    console.log(`Received text message: "${text}"`);

                    // Echo the received text message back to the user.
                    return client.replyMessage(replyToken, { type: 'text', text });
                }
                // You can add handlers for other event types (e.g., stickers, follows) here.
                console.log('Received non-text event:', webhookEvent.type);
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
