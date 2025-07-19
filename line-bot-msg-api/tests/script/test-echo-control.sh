#!/bin/bash

# Test script for echo control functionality
WEBHOOK_URL="https://iosb06hluc.execute-api.ap-southeast-7.amazonaws.com/Prod/webhook"

echo "Testing echo control functionality..."

# Test 1: Send a regular message (should get default response)
echo "1. Testing regular message (echo disabled by default)..."
curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -H "x-line-signature: test-signature" \
  -d '{
    "events": [
      {
        "type": "message",
        "message": {
          "type": "text",
          "text": "Hello, this is a test message"
        },
        "source": {
          "userId": "test-user-echo-control"
        },
        "replyToken": "test-reply-token-1",
        "timestamp": '$(date +%s000)'
      }
    ]
  }'

echo -e "\n\n2. Testing 'start echo' command..."
curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -H "x-line-signature: test-signature" \
  -d '{
    "events": [
      {
        "type": "message",
        "message": {
          "type": "text",
          "text": "start echo"
        },
        "source": {
          "userId": "test-user-echo-control"
        },
        "replyToken": "test-reply-token-2",
        "timestamp": '$(date +%s000)'
      }
    ]
  }'

echo -e "\n\n3. Testing message with echo enabled..."
curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -H "x-line-signature: test-signature" \
  -d '{
    "events": [
      {
        "type": "message",
        "message": {
          "type": "text",
          "text": "This should be echoed back!"
        },
        "source": {
          "userId": "test-user-echo-control"
        },
        "replyToken": "test-reply-token-3",
        "timestamp": '$(date +%s000)'
      }
    ]
  }'

echo -e "\n\n4. Testing 'stop echo' command..."
curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -H "x-line-signature: test-signature" \
  -d '{
    "events": [
      {
        "type": "message",
        "message": {
          "type": "text",
          "text": "stop echo"
        },
        "source": {
          "userId": "test-user-echo-control"
        },
        "replyToken": "test-reply-token-4",
        "timestamp": '$(date +%s000)'
      }
    ]
  }'

echo -e "\n\n5. Testing message with echo disabled..."
curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -H "x-line-signature: test-signature" \
  -d '{
    "events": [
      {
        "type": "message",
        "message": {
          "type": "text",
          "text": "This should NOT be echoed back!"
        },
        "source": {
          "userId": "test-user-echo-control"
        },
        "replyToken": "test-reply-token-5",
        "timestamp": '$(date +%s000)'
      }
    ]
  }'

echo -e "\n\nTesting complete! Check your Google Sheet and CloudWatch logs for results."
