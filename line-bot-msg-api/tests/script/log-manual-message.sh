#!/bin/bash

# Script to m# Get the API Gateway URL from SAM stack outputs
API_URL=$(aws cloudformation describe-stacks \
  --stack-name line-bot-msg-api \
  --region ap-southeast-7 \
  --query 'Stacks[0].Outputs[?OutputKey==`LineLoggerApi`].OutputValue' \
  --output text 2>/dev/null | sed 's|/webhook$||')ly log messages sent from LINE Official Account Manager
# Usage: ./log-manual-message.sh "USER_ID" "MESSAGE_TEXT"

# Check if the correct number of arguments are provided
if [ $# -ne 2 ]; then
    echo "Usage: $0 \"USER_ID\" \"MESSAGE_TEXT\""
    echo "Example: $0 \"U1234567890abcdef\" \"Hello! How can I help you today?\""
    exit 1
fi

USER_ID="$1"
MESSAGE_TEXT="$2"

# Load environment variables
ENV_FILE="line-bot-msg-api/.env"
if [ -f "$ENV_FILE" ]; then
  set -o allexport
  source "$ENV_FILE"
  set +o allexport
else
  echo "Error: Environment file not found at $ENV_FILE"
  exit 1
fi

# Get the API Gateway URL from SAM stack outputs
API_URL=$(aws cloudformation describe-stacks \
  --stack-name line-bot-msg-api \
  --region ap-southeast-7 \
  --query 'Stacks[0].Outputs[?OutputKey==`LineLoggerApi`].OutputValue' \
  --output text 2>/dev/null | sed 's|/webhook$||')

if [ -z "$API_URL" ]; then
    echo "Error: Could not find API Gateway URL from CloudFormation stack"
    echo "Make sure your stack is deployed and try again"
    exit 1
fi

ENDPOINT="$API_URL/log-manual-message"

echo "Logging manual message..."
echo "User ID: $USER_ID"
echo "Message: $MESSAGE_TEXT"
echo "Endpoint: $ENDPOINT"
echo

# Send the manual logging request
curl -X POST "$ENDPOINT" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"$USER_ID\",
    \"message\": \"$MESSAGE_TEXT\"
  }" \
  -w "\nHTTP Status: %{http_code}\n"

echo
echo "Manual message logging completed!"
echo "Check your Google Sheet to verify the message was logged."
