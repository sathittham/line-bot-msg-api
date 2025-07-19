#!/bin/bash

# Test script specifically for BOT identification in outgoing messages
echo "Testing BOT Identification for Outgoing Messages"
echo "=============================================="

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

echo "Testing manual message logging (should use BOT as UserID and DisplayName)..."
echo

# Test manual logging with different user ID
curl -X POST "$MANUAL_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "U123456789_test_user",
    "message": "🤖 TESTING: This manual message should appear in Google Sheet with UserID=BOT and DisplayName=BOT (not the original userId)"
  }' \
  -w "\nHTTP Status: %{http_code}\n"

echo
echo "Testing completed!"
echo
echo "Expected Results in Google Sheet:"
echo "================================="
echo "✅ Manual message should show:"
echo "   - Column A: Bangkok timestamp"
echo "   - Column B: UserID = 'BOT' (NOT 'U123456789_test_user')"
echo "   - Column C: DisplayName = 'BOT'"
echo "   - Column D: MessageType = 'text'"
echo "   - Column E: MessageContent = '🤖 TESTING: This manual message...'"
echo "   - Column F: MessageID = '' (empty)"
echo "   - Column G: MessageSource = 'outgoing'"
echo
echo "Check your Google Sheet at:"
echo "https://docs.google.com/spreadsheets/d/$GOOGLE_SHEET_ID/edit"
echo
echo "Note: The original userId parameter ('U123456789_test_user') is ignored."
echo "All bot outgoing messages now use 'BOT' for identification purposes."
