#!/bin/bash
set -e # Exit immediately if a command exits with a non-zero status.

# A robust way to load environment variables from the .env file.
# This avoids issues with special characters in secret values.
ENV_FILE="line-bot-msg-api/.env"
if [ -f "$ENV_FILE" ]; then
  set -o allexport
  source "$ENV_FILE"
  set +o allexport
else
  echo "Error: Environment file not found at $ENV_FILE"
  echo "Please create it by copying line-bot-msg-api/.env.example"
  exit 1
fi

# Check if the required variables are set
if [ -z "$LINE_CHANNEL_ACCESS_TOKEN" ] || [ -z "$LINE_CHANNEL_SECRET" ] || [ -z "$GOOGLE_SHEET_ID" ]; then
  echo "Error: LINE_CHANNEL_ACCESS_TOKEN, LINE_CHANNEL_SECRET, and GOOGLE_SHEET_ID must be set in $ENV_FILE"
  exit 1
fi

if [ -z "$GOOGLE_CREDENTIALS" ]; then
  echo "Warning: GOOGLE_CREDENTIALS not set. Google Sheets logging will not work."
fi

echo "Building the application..."
sam build

echo "Deploying the application with secrets from the .env file..."

# Base64 encode the Google credentials from the .env file
GOOGLE_CREDENTIALS_BASE64=$(echo "$GOOGLE_CREDENTIALS" | base64 | tr -d '\n')

# Deploy using SAM
sam deploy --parameter-overrides \
  "LineChannelAccessToken=$LINE_CHANNEL_ACCESS_TOKEN" \
  "LineChannelSecret=$LINE_CHANNEL_SECRET" \
  "GoogleSheetId=$GOOGLE_SHEET_ID" \
  "GoogleCredentials=$GOOGLE_CREDENTIALS_BASE64"

