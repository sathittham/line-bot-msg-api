#!/bin/bash

# Test script for the new Google Sheet column structure
echo "Testing New Google Sheet Column Structure"
echo "========================================"
echo "A: Timestamp (BKK time)"
echo "B: UserID"  
echo "C: DisplayName"
echo "D: MessageType"
echo "E: MessageContent"
echo "F: MessageID"
echo "G: MessageSource"
echo

# Load environment variables
ENV_FILE="line-bot-msg-api/.env"
if [ -f "$ENV_FILE" ]; then
  set -o allexport
  source "$ENV_FILE"
  set +o allexport
fi

# Get the API Gateway URL
API_URL=$(aws cloudformation describe-stacks \
  --stack-name line-bot-msg-api \
  --region ap-southeast-7 \
  --query 'Stacks[0].Outputs[?OutputKey==`LineLoggerApi`].OutputValue' \
  --output text | sed 's|/webhook$||')

MANUAL_ENDPOINT="$API_URL/log-manual-message"
WEBHOOK_ENDPOINT="$API_URL/webhook"

echo "Testing manual message logging with new structure..."
echo

# Test manual logging
echo "1. Testing manual message from LINE OA Manager..."
curl -X POST "$MANUAL_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "U123456789_test",
    "message": "Hello! I sent this message manually from LINE Official Account Manager. This should appear with BKK timestamp! 🇹🇭"
  }' \
  -w "\nHTTP Status: %{http_code}\n"

echo

# Test webhook simulation (text message)
echo "2. Testing webhook with text message..."
curl -X POST "$WEBHOOK_ENDPOINT" \
  -H "Content-Type: application/json" \
  -H "x-line-signature: test-signature" \
  -d '{
    "events": [{
      "type": "message",
      "message": {
        "type": "text",
        "text": "Test message with new column structure",
        "id": "msg_12345"
      },
      "source": {
        "userId": "U123456789_test"
      },
      "replyToken": "reply_token_test",
      "timestamp": '$(date +%s000)'
    }]
  }' \
  -w "\nHTTP Status: %{http_code}\n"

echo

# Test webhook simulation (sticker message)
echo "3. Testing webhook with sticker message..."
curl -X POST "$WEBHOOK_ENDPOINT" \
  -H "Content-Type: application/json" \
  -H "x-line-signature: test-signature" \
  -d '{
    "events": [{
      "type": "message",
      "message": {
        "type": "sticker",
        "packageId": "1",
        "stickerId": "1",
        "id": "msg_sticker_123"
      },
      "source": {
        "userId": "U123456789_test"
      },
      "replyToken": "reply_token_sticker",
      "timestamp": '$(date +%s000)'
    }]
  }' \
  -w "\nHTTP Status: %{http_code}\n"

echo

# Test follow event
echo "4. Testing follow event..."
curl -X POST "$WEBHOOK_ENDPOINT" \
  -H "Content-Type: application/json" \
  -H "x-line-signature: test-signature" \
  -d '{
    "events": [{
      "type": "follow",
      "source": {
        "userId": "U123456789_test"
      },
      "timestamp": '$(date +%s000)'
    }]
  }' \
  -w "\nHTTP Status: %{http_code}\n"

echo
echo "Testing completed!"
echo
echo "Expected Results in Google Sheet:"
echo "================================="
echo "Column A: Timestamps should be in Bangkok time (UTC+7)"
echo "Column B: User ID should be 'U123456789_test'"
echo "Column C: Display name (may be empty for test calls)"
echo "Column D: Message types: 'text', 'sticker', 'system'"
echo "Column E: Message content with proper formatting"
echo "Column F: Message IDs where available"
echo "Column G: 'incoming' or 'outgoing' source"
echo
echo "Check your Google Sheet at:"
echo "https://docs.google.com/spreadsheets/d/$GOOGLE_SHEET_ID/edit"
echo
echo "Note: The actual user display names may be empty since these are test calls."
echo "Real LINE messages will include display names when profiles are accessible."
