# Outgoing Message Logging Solution

## Problem
Your LINE bot was logging incoming messages from users and bot's automated responses, but it wasn't logging messages that you manually send from the LINE Official Account Manager interface.

## Solution
I've implemented a comprehensive solution that now logs **all three types of messages**:

1. ✅ **Incoming messages** from users (direction: `incoming`)
2. ✅ **Bot automated responses** (direction: `outgoing`) 
3. ✅ **Manual messages from LINE OA Manager** (direction: `outgoing_manual`)

## How It Works

### Automatic Logging (Already Working)
- **Incoming messages**: Automatically logged when users send messages to your bot
- **Bot responses**: Automatically logged when your bot replies to users

### Manual Logging (New Feature)
- **LINE OA messages**: Use the new manual logging system when you send messages through LINE Official Account Manager

## Google Sheet Structure
Your Google Sheet now has these columns:
- **Column A**: Timestamp
- **Column B**: User ID  
- **Column C**: Direction (`incoming`, `outgoing`, or `outgoing_manual`)
- **Column D**: Message content

## Usage Instructions

### Method 1: Using the Simple Script
When you manually send a message through LINE Official Account Manager:

```bash
./log-manual-message.sh "USER_ID" "MESSAGE_TEXT"
```

**Example:**
```bash
./log-manual-message.sh "U1234567890abcdef" "Hello! Thank you for your inquiry. Our team will respond within 24 hours."
```

### Method 2: Using Direct API Call
You can also log manual messages by making a direct API call:

```bash
curl -X POST "https://iosb06hluc.execute-api.ap-southeast-7.amazonaws.com/Prod/log-manual-message" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_ID",
    "message": "MESSAGE_TEXT"
  }'
```

## How to Get User IDs

To log manual messages, you need the user's LINE ID. Here are ways to get it:

1. **From webhook logs**: When users send messages, their user ID appears in CloudWatch logs
2. **From your Google Sheet**: Check previous incoming messages to see user IDs
3. **From LINE Official Account Manager**: Some interfaces show user IDs
4. **From LINE Bot SDK**: If you store user IDs in your database

## Testing the Feature

### Test Script
Run the comprehensive test:
```bash
./test-manual-logging.sh
```

This will:
- Test manual logging with valid data
- Test error handling with invalid data
- Show you the exact API endpoints

### Verify in Google Sheet
Check your Google Sheet at:
https://docs.google.com/spreadsheets/d/1kGl2eK1UDqGB3Um2jhYhduJ38jd0WPfjRsHezMQQRN4/edit

Look for entries with direction `outgoing_manual`.

## Workflow Examples

### Example 1: Customer Support
1. User sends message: "I need help with my order"
   - ✅ Automatically logged as `incoming`
2. Bot responds: "I'll connect you with support"
   - ✅ Automatically logged as `outgoing`  
3. You manually respond from LINE OA Manager: "Hi! I'm here to help. What's your order number?"
   - ✅ Run: `./log-manual-message.sh "U1234567" "Hi! I'm here to help. What's your order number?"`
   - ✅ Logged as `outgoing_manual`

### Example 2: Proactive Messaging
1. You send a promotional message from LINE OA Manager: "Special offer: 20% off today!"
   - ✅ Run: `./log-manual-message.sh "U1234567" "Special offer: 20% off today!"`
   - ✅ Logged as `outgoing_manual`

## Important Notes

### Why Manual Logging is Needed
- LINE doesn't send webhooks for messages sent from the Official Account Manager
- The LINE Messaging API doesn't provide a way to fetch manually sent messages
- Manual logging ensures complete conversation tracking

### Best Practices
1. **Log immediately**: Log manual messages right after sending them
2. **Copy exact text**: Use the exact message text you sent
3. **Use correct User ID**: Make sure you have the right LINE user ID
4. **Check your sheet**: Verify messages appear in your Google Sheet

### Automation Opportunities
You could further automate this by:
1. Creating a simple web interface for logging
2. Integrating with your CRM system
3. Setting up browser bookmarks for quick logging
4. Creating mobile shortcuts for faster access

## API Endpoints

Your deployed bot now has two endpoints:

1. **Webhook Endpoint** (for LINE bot events):
   ```
   https://iosb06hluc.execute-api.ap-southeast-7.amazonaws.com/Prod/webhook
   ```

2. **Manual Logging Endpoint** (for LINE OA messages):
   ```
   https://iosb06hluc.execute-api.ap-southeast-7.amazonaws.com/Prod/log-manual-message
   ```

## Troubleshooting

### Common Issues
1. **HTTP 400 "userId and message are required"**
   - Make sure both parameters are provided in the request

2. **HTTP 500 "Error logging manual message"**
   - Check CloudWatch logs for detailed error information
   - Verify Google Sheets credentials are working

3. **"Could not find API Gateway URL"**
   - Make sure your stack is deployed: `./deploy.sh`
   - Check the correct region is configured

### Checking Logs
View CloudWatch logs:
```bash
aws logs tail /aws/lambda/line-bot-msg-api-LineLoggerFunction-* --region ap-southeast-7 --follow
```

## Summary

✅ **Complete logging solution implemented:**
- Incoming user messages: Automatic
- Bot responses: Automatic  
- Manual LINE OA messages: Manual logging system

✅ **Easy-to-use scripts provided:**
- `./log-manual-message.sh` for individual messages
- `./test-manual-logging.sh` for testing

✅ **All messages appear in your Google Sheet** with clear direction indicators

This solution ensures you have a complete log of all conversations, including messages you send manually from the LINE Official Account Manager!
