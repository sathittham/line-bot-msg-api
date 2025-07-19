import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { WebhookEvent } from '@line/bot-sdk';
import * as dotenv from 'dotenv';
dotenv.config();

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // For demonstration, you can log to confirm variables are loaded.
    // In production, avoid logging sensitive secrets directly.
    console.log('Channel Access Token:', process.env.LINE_CHANNEL_ACCESS_TOKEN ? 'Loaded' : 'Not Loaded');
    console.log('Channel Secret:', process.env.LINE_CHANNEL_SECRET ? 'Loaded' : 'Not Loaded');

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

        // Log each event from the webhook
        if (webhookEvents && webhookEvents.length > 0) {
            for (const webhookEvent of webhookEvents) {
                console.log('Parsed LINE Webhook Event:', JSON.stringify(webhookEvent, null, 2));
                // In a real application, you might store this in DynamoDB, S3, or another database.
            }
        }

        // LINE webhook requires a 200 OK response to acknowledge receipt.
        return {
            statusCode: 200,
            body: JSON.stringify({ status: 'success' }),
        };
    } catch (err) {
        console.error('Error processing webhook:', err);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error processing webhook' }),
        };
    }
};
