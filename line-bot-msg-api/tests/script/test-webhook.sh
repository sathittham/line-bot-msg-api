#!/bin/bash

# Test webhook for LINE bot
curl -X POST https://iosb06hluc.execute-api.ap-southeast-7.amazonaws.com/Prod/webhook \
  -H "Content-Type: application/json" \
  -H "x-line-signature: test-signature" \
  -d '{
    "events": [
      {
        "type": "message",
        "message": {
          "type": "text",
          "text": "Test message from curl script - Google Sheets logging test"
        },
        "source": {
          "userId": "test-user-curl"
        },
        "replyToken": "test-reply-token-curl",
        "timestamp": '$(date +%s000)'
      }
    ]
  }'

echo ""
echo "Test webhook sent! Check your Google Sheet for new entries."
