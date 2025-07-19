#!/bin/bash

echo "Testing new Google Sheet column structure with Direction in column B"
echo "New structure: A: Timestamp (BKK), B: Direction, C: UserID, D: DisplayName, E: MessageType, F: MessageContent, G: MessageID"
echo ""

# Test outgoing message
echo "1. Testing outgoing message..."
curl -X POST "https://iosb06hluc.execute-api.ap-southeast-7.amazonaws.com/Prod/log-manual-message" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-456",
    "message": "Outgoing test message with Direction in column B"
  }'

echo -e "\n\n2. Testing another outgoing message..."
curl -X POST "https://iosb06hluc.execute-api.ap-southeast-7.amazonaws.com/Prod/log-manual-message" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "admin-789",
    "message": "Admin message testing column B for Direction"
  }'

echo -e "\n\nExpected Google Sheet results:"
echo "Column A: Bangkok timestamp"
echo "Column B: outgoing (Direction)"
echo "Column C: BOT (UserID)" 
echo "Column D: BOT (DisplayName)"
echo "Column E: text (MessageType)"
echo "Column F: Message content"
echo "Column G: Empty (MessageID)"
echo ""
echo "Check your Google Sheet to verify the new column structure!"
