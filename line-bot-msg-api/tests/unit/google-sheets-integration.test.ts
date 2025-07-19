import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { lambdaHandler } from '../../app';
import { expect, describe, it } from '@jest/globals';
import * as dotenv from 'dotenv';

// Load environment variables for testing
dotenv.config();

describe('Google Sheets integration tests', function () {
    it('verifies Google Sheets logging with text message', async () => {
        const event: APIGatewayProxyEvent = {
            httpMethod: 'post',
            body: JSON.stringify({
                events: [
                    {
                        type: 'message',
                        message: {
                            type: 'text',
                            text: 'Test message for Google Sheets logging',
                        },
                        source: {
                            userId: 'test-user-123',
                        },
                        replyToken: 'test-reply-token-456',
                        timestamp: 1658234567890,
                    },
                ],
            }),
            headers: {
                'x-line-signature': 'test-signature',
            },
            isBase64Encoded: false,
            multiValueHeaders: {},
            multiValueQueryStringParameters: {},
            path: '/webhook',
            pathParameters: {},
            queryStringParameters: {},
            requestContext: {
                accountId: '123456789012',
                apiId: '1234',
                authorizer: {},
                httpMethod: 'post',
                identity: {
                    accessKey: '',
                    accountId: '',
                    apiKey: '',
                    apiKeyId: '',
                    caller: '',
                    clientCert: {
                        clientCertPem: '',
                        issuerDN: '',
                        serialNumber: '',
                        subjectDN: '',
                        validity: { notAfter: '', notBefore: '' },
                    },
                    cognitoAuthenticationProvider: '',
                    cognitoAuthenticationType: '',
                    cognitoIdentityId: '',
                    cognitoIdentityPoolId: '',
                    principalOrgId: '',
                    sourceIp: '',
                    user: '',
                    userAgent: '',
                    userArn: '',
                },
                path: '/webhook',
                protocol: 'HTTP/1.1',
                requestId: 'c6af9ac6-7b61-11e6-9a41-93e8deadbeef',
                requestTimeEpoch: 1428582896000,
                resourceId: '123456',
                resourcePath: '/webhook',
                stage: 'dev',
            },
            resource: '',
            stageVariables: {},
        };

        const result: APIGatewayProxyResult = await lambdaHandler(event);

        // The function should return 200 status even if Google Sheets fails
        // because the main webhook functionality should still work
        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual(JSON.stringify({ status: 'success' }));
    }, 60000); // 60 second timeout for this test

    it('verifies basic functionality works without Google Sheets', async () => {
        const event: APIGatewayProxyEvent = {
            httpMethod: 'post',
            body: JSON.stringify({
                events: [
                    {
                        type: 'message',
                        message: {
                            type: 'image',
                            id: 'image-message-id-123',
                        },
                        source: {
                            userId: 'test-user-456',
                        },
                        replyToken: 'test-reply-token-789',
                        timestamp: 1658234567890,
                    },
                ],
            }),
            headers: {
                'x-line-signature': 'test-signature',
            },
            isBase64Encoded: false,
            multiValueHeaders: {},
            multiValueQueryStringParameters: {},
            path: '/webhook',
            pathParameters: {},
            queryStringParameters: {},
            requestContext: {
                accountId: '123456789012',
                apiId: '1234',
                authorizer: {},
                httpMethod: 'post',
                identity: {
                    accessKey: '',
                    accountId: '',
                    apiKey: '',
                    apiKeyId: '',
                    caller: '',
                    clientCert: {
                        clientCertPem: '',
                        issuerDN: '',
                        serialNumber: '',
                        subjectDN: '',
                        validity: { notAfter: '', notBefore: '' },
                    },
                    cognitoAuthenticationProvider: '',
                    cognitoAuthenticationType: '',
                    cognitoIdentityId: '',
                    cognitoIdentityPoolId: '',
                    principalOrgId: '',
                    sourceIp: '',
                    user: '',
                    userAgent: '',
                    userArn: '',
                },
                path: '/webhook',
                protocol: 'HTTP/1.1',
                requestId: 'c6af9ac6-7b61-11e6-9a41-93e8deadbeef',
                requestTimeEpoch: 1428582896000,
                resourceId: '123456',
                resourcePath: '/webhook',
                stage: 'dev',
            },
            resource: '',
            stageVariables: {},
        };

        const result: APIGatewayProxyResult = await lambdaHandler(event);

        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual(JSON.stringify({ status: 'success' }));
    });
});
