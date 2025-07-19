import { ScheduledEvent } from 'aws-lambda';
import { google } from 'googleapis';
import axios from 'axios';

const sheets = google.sheets('v4');

// Initialize Google Auth (same as main app)
const GOOGLE_CREDENTIALS_BASE64 = process.env.GOOGLE_CREDENTIALS_BASE64;
let auth: any = null;

try {
    if (GOOGLE_CREDENTIALS_BASE64) {
        const credentialsJson = Buffer.from(GOOGLE_CREDENTIALS_BASE64, 'base64').toString('utf-8');
        const credentials = JSON.parse(credentialsJson);
        auth = new google.auth.JWT({
            email: credentials.client_email,
            key: credentials.private_key,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });
    }
} catch (error) {
    console.error('Failed to initialize Google auth:', error);
    auth = null;
}

/**
 * Log outgoing messages from LINE OA to Google Sheet
 */
const logLineOAMessage = async (userId: string, text: string, timestamp: string): Promise<void> => {
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    if (!spreadsheetId || !auth) {
        console.warn('Google Sheets not configured');
        return;
    }

    try {
        const values = [[timestamp, userId, 'outgoing_manual', text]];

        await sheets.spreadsheets.values.append({
            auth,
            spreadsheetId,
            range: 'Sheet1!A:D',
            valueInputOption: 'RAW',
            requestBody: { values },
        });

        console.log(`Successfully logged manual outgoing message to Google Sheet`);
    } catch (error) {
        console.error('Error logging to Google Sheet:', error);
    }
};

/**
 * Fetch recent outgoing messages from LINE using Insight API
 */
const fetchLineOAMessages = async (): Promise<void> => {
    const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
    if (!channelAccessToken) {
        console.error('LINE Channel Access Token not configured');
        return;
    }

    try {
        // Get yesterday's date for API call
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const dateString = yesterday.toISOString().split('T')[0].replace(/-/g, '');

        // LINE Insight API to get message statistics
        const insightUrl = `https://api.line.me/v2/bot/insight/message/delivery?date=${dateString}`;

        const response = await axios.get(insightUrl, {
            headers: {
                Authorization: `Bearer ${channelAccessToken}`,
                'Content-Type': 'application/json',
            },
        });

        console.log('LINE Insight API response:', JSON.stringify(response.data, null, 2));

        // Unfortunately, LINE Insight API doesn't provide individual message content
        // It only provides statistics. We'll need to use a different approach.

        // Alternative: Check for webhook events we might have missed
        // or implement a different tracking mechanism
    } catch (error) {
        console.error('Error fetching LINE OA messages:', error);
        if (axios.isAxiosError(error)) {
            console.error('Response data:', error.response?.data);
            console.error('Response status:', error.response?.status);
        }
    }
};

/**
 * Scheduled Lambda function to sync LINE OA messages
 */
export const scheduledSyncHandler = async (event: ScheduledEvent): Promise<void> => {
    console.log('Starting scheduled sync of LINE OA messages');
    console.log('Event:', JSON.stringify(event, null, 2));

    try {
        await fetchLineOAMessages();
        console.log('Scheduled sync completed successfully');
    } catch (error) {
        console.error('Error in scheduled sync:', error);
    }
};
