#!/bin/bash

# Test script for the new manual message logging functionality
echo "Testing Manual Message Logging Feature"
echo "====================================="

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

if [ -z "$API_URL" ]; then
    echo "Error: Could not find API Gateway URL"
    exit 1
fi

MANUAL_ENDPOINT="$API_URL/log-manual-message"

echo "API Gateway URL: $API_URL"
echo "Manual Logging Endpoint: $MANUAL_ENDPOINT"
echo

# Test 1: Log a manual message from LINE OA
echo "1. Testing manual message logging..."
curl -X POST "$MANUAL_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "demo-user-123",
    "message": "Hello! This is a message I sent manually from LINE Official Account Manager. How can I help you today?"
  }' \
  -w "\nHTTP Status: %{http_code}\n"

echo

# Test 2: Log another manual message with different content
echo "2. Testing another manual message..."
curl -X POST "$MANUAL_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "demo-user-456", 
    "message": "Thank you for your inquiry! Our team will get back to you within 24 hours. 📧"
  }' \
  -w "\nHTTP Status: %{http_code}\n"

echo

# Test 3: Test with missing parameters (should fail)
echo "3. Testing with missing parameters (should return 400)..."
curl -X POST "$MANUAL_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "demo-user-789"
  }' \
  -w "\nHTTP Status: %{http_code}\n"

echo
echo "Manual logging tests completed!"
echo
echo "Summary:"
echo "- ✅ Two manual messages should be logged to your Google Sheet with direction 'outgoing_manual'"
echo "- ✅ One request should have failed with HTTP 400 due to missing message parameter"
echo
echo "Check your Google Sheet at:"
echo "https://docs.google.com/spreadsheets/d/$GOOGLE_SHEET_ID/edit"
echo
echo "Usage Instructions:"
echo "=================="
echo "To log messages manually sent from LINE Official Account Manager:"
echo "1. Send the message to a user through LINE OA Manager"
echo "2. Copy the user's LINE ID and the message text"
echo "3. Run: ./log-manual-message.sh \"USER_ID\" \"MESSAGE_TEXT\""
echo "4. The message will be logged to your Google Sheet with direction 'outgoing_manual'"
