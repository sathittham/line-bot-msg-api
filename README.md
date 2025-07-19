# LINE Bot Message API with Google Sheets Logging

A comprehensive serverless application built with AWS SAM (Serverless Application Model) to receive, process, and log LINE webhook messages to Google Sheets. Features include bidirectional message logging, echo control functionality, comprehensive message type detection, and Bangkok timezone support. Deployed to AWS Lambda and API Gateway in the AWS Asia Pacific (Thailand) region.

## ✨ Features

- **📊 Google Sheets Integration**: Automatic logging of all messages to Google Sheets with 7-column structure
- **🔄 Bidirectional Logging**: Tracks both incoming user messages and outgoing bot responses
- **🕒 Bangkok Timezone**: All timestamps converted to Bangkok time (UTC+7)
- **🎯 Message Type Detection**: Supports text, sticker, image, video, audio, location, file, and system messages
- **🔊 Echo Control**: Users can enable/disable message echoing with "start echo" and "stop echo" commands
- **🤖 BOT Identification**: Clear identification of bot messages vs user messages in logs
- **📝 Manual Logging**: Endpoint for logging LINE OA messages sent outside webhook events
- **⚡ Real-time Processing**: Immediate logging and response to LINE webhook events

### Google Sheets Column Structure

| Column | Field | Description |
|--------|-------|-------------|
| A | Timestamp | Bangkok time (YYYY-MM-DD HH:mm:ss) |
| B | Direction | `incoming` or `outgoing` |
| C | UserID | LINE user ID or `BOT` for bot messages |
| D | DisplayName | User's display name or `BOT` for bot messages |
| E | MessageType | `text`, `sticker`, `image`, `video`, `audio`, `location`, `file`, `system` |
| F | MessageContent | Message text or description |
| G | MessageID | LINE message ID (when available) |

## 🏗️ Project Structure

```
linebot/
├── line-bot-msg-api/          # Lambda function source code (TypeScript)
│   ├── app.ts                 # Main Lambda handler with Google Sheets integration
│   ├── docs/                  # Documentation
│   │   └── OUTGOING_LOGGING_GUIDE.md  # Guide for logging outgoing messages
│   ├── tests/                 # Comprehensive test suite
│   │   ├── script/            # Test scripts for all functionality
│   │   │   ├── test-echo-control.sh        # Echo functionality tests
│   │   │   ├── test-bot-identification.sh  # BOT identification tests
│   │   │   ├── test-new-direction-column.sh # Column structure tests
│   │   │   ├── log-manual-message.sh       # Manual logging tests
│   │   │   └── line-oa-sync.ts            # LINE OA sync utility
│   │   └── unit/              # Unit tests
│   ├── package.json           # Function dependencies
│   ├── .env                   # Environment variables (LINE + Google credentials)
│   └── .env.example           # Environment variables template
├── template.yaml              # SAM template (AWS resources + manual logging endpoint)
├── samconfig.toml            # SAM deployment configuration
├── deploy.sh                 # Enhanced deployment script with Google credentials
├── package.json              # Root package for build scripts
└── README.md                 # This file
```

## 📋 Prerequisites

- **AWS CLI** - configured with appropriate credentials
- **AWS SAM CLI** - for building and deploying serverless applications
- **Node.js 22.x** - runtime for the Lambda function
- **Docker** - required by SAM for local testing
- **LINE Developer Account** - for obtaining channel credentials
- **Google Cloud Project** - with Sheets API enabled and service account credentials
- **Google Sheet** - where messages will be logged

## 🔧 Setup & Configuration

### 1. Install Dependencies

Install dependencies for both the root project and the Lambda function:

```bash
# Install root dependencies
npm install

# Install Lambda function dependencies
cd line-bot-msg-api
npm install
cd ..
```

### 2. Configure LINE Credentials

Create environment variables file with your LINE channel credentials:

```bash
cp line-bot-msg-api/.env.example line-bot-msg-api/.env
```

Edit `line-bot-msg-api/.env` with your actual LINE credentials:

```env
# LINE Messaging API Configuration
LINE_CHANNEL_SECRET=your_channel_secret_here
LINE_CHANNEL_ACCESS_TOKEN=your_channel_access_token_here

# Google Sheets Configuration
GOOGLE_SHEET_ID=your_google_sheet_id_here
GOOGLE_CREDENTIALS_BASE64=your_base64_encoded_service_account_json_here
```

### 3. Setup Google Sheets Integration

#### Step 1: Create Google Cloud Service Account
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google Sheets API
4. Create a Service Account
5. Download the JSON credentials file

#### Step 2: Prepare Credentials
```bash
# Convert your Google service account JSON to base64
base64 -i path/to/your/service-account.json | tr -d '\n'
```

#### Step 3: Create Google Sheet
1. Create a new Google Sheet
2. Share it with your service account email (from the JSON file)
3. Copy the Sheet ID from the URL
4. Add the Sheet ID to your `.env` file

#### Step 4: Test Scripts
Use the provided test scripts to verify your setup:

```bash
# Test Google Sheets connection
cd line-bot-msg-api
./tests/script/test-new-direction-column.sh

# Test echo functionality
./tests/script/test-echo-control.sh

# Test BOT identification
./tests/script/test-bot-identification.sh
```

> ⚠️ **Security Note**: Never commit the `.env` file to version control. It's already included in `.gitignore`.

## 🧪 Local Development & Testing

### Run Unit Tests

```bash
cd line-bot-msg-api
npm run test
```

### Test Individual Features

```bash
# Test echo control functionality
./tests/script/test-echo-control.sh

# Test BOT identification
./tests/script/test-bot-identification.sh

# Test Google Sheets logging with new column structure
./tests/script/test-new-direction-column.sh

# Test manual message logging
./tests/script/test-manual-logging.sh
```

### Local API Testing

Start the API locally for testing:

```bash
sam local start-api
```

The API will be available at:
- `http://localhost:3000/webhook` - LINE webhook endpoint
- `http://localhost:3000/log-manual-message` - Manual logging endpoint

### Test Endpoints

```bash
# Test webhook endpoint
curl -X POST http://localhost:3000/webhook \
  -H "Content-Type: application/json" \
  -d '{"events":[{"type":"message","message":{"type":"text","text":"hello"},"source":{"userId":"test"},"replyToken":"test"}]}'

# Test manual logging endpoint
curl -X POST http://localhost:3000/log-manual-message \
  -H "Content-Type: application/json" \
  -d '{"userId":"admin","message":"Manual test message"}'
```

### Local Function Invocation

```bash
sam local invoke LineLoggerFunction --event events/line-webhook-event.json
```

## 🚀 Deployment

### Quick Deployment

Use the deployment script (recommended):

```bash
./deploy.sh
```

This script:
- Loads environment variables from `.env` file
- Validates required LINE and Google credentials
- Encodes Google credentials as base64 for secure deployment
- Builds and deploys the application with proper parameter overrides

### Manual Deployment

If you prefer manual deployment:

```bash
# Build the application
npm run build

# Deploy with parameters
sam deploy --parameter-overrides \
  "LineChannelAccessToken=YOUR_ACCESS_TOKEN" \
  "LineChannelSecret=YOUR_CHANNEL_SECRET" \
  "GoogleSheetId=YOUR_GOOGLE_SHEET_ID" \
  "GoogleCredentials=YOUR_BASE64_GOOGLE_CREDENTIALS"
```

### Alternative: Use npm scripts

```bash
# Clean, build, and deploy in one command
npm run deploy
```

## 🌐 Deployed Resources

After successful deployment, you'll receive:

### Example Deployment Outputs
- **API Gateway Endpoint**: The `LineLoggerApi` value from the `sam deploy` output
- **Lambda Function**: The `LineLoggerFunction` value from the `sam deploy` output  
- **Region**: `ap-southeast-7` (Asia Pacific - Thailand)
- **Stack Name**: `line-bot-msg-api`

### Available Endpoints
- `{API_URL}/webhook` - LINE webhook endpoint for receiving messages
- `{API_URL}/log-manual-message` - Manual logging endpoint for LINE OA messages

## 🎯 Bot Functionality

### Echo Control Commands
Users can control echo functionality by sending these commands:
- **"start echo"** - Enable echo mode (bot will repeat user messages)
- **"stop echo"** - Disable echo mode (bot will send default responses)

### Message Types Supported
- **Text messages** - Full text content logged
- **Sticker messages** - Package and sticker ID logged
- **Image/Video/Audio** - Message type indicator logged
- **Location messages** - Coordinates and title logged
- **File messages** - File type indicator logged
- **System events** - Follow/unfollow events logged

### Google Sheets Logging
All messages are automatically logged to your configured Google Sheet with:
- Real-time Bangkok timezone timestamps
- Clear direction indicators (incoming/outgoing)
- BOT identification for all automated responses
- Comprehensive message type classification

## 🔗 LINE Bot Configuration

Configure your LINE bot to use the deployed webhook URL:

1. Go to [LINE Developers Console](https://developers.line.biz/)
2. Select your channel
3. Go to "Messaging API" tab
4. Set **Webhook URL** to: `{LineLoggerApi}/webhook` (from your deployment output)
5. Enable "Use webhook"
6. Verify the webhook connection

### Testing Your Bot
After configuration, test your bot:
1. Add your LINE bot as a friend
2. Send a message - it should be logged to Google Sheets
3. Try "start echo" command to enable echo mode
4. Send another message - bot should echo it back
5. Try "stop echo" to disable echo mode
6. Check your Google Sheet for all logged interactions

## 📊 Monitoring & Logs

### CloudWatch Logs
- **Log Group**: The name will be based on your function name, e.g., `/aws/lambda/line-bot-msg-api-LineLoggerFunction-xxxxxx`

- View logs in AWS CloudWatch console

### Local Logs
```bash
sam logs -n LineLoggerFunction --stack-name line-bot-msg-api --tail
```

## 🔧 Configuration

### Environment Variables (Lambda)
- `LINE_CHANNEL_ACCESS_TOKEN`: Your LINE channel access token
- `LINE_CHANNEL_SECRET`: Your LINE channel secret
- `GOOGLE_SHEET_ID`: Your Google Sheet ID for logging messages
- `GOOGLE_CREDENTIALS_BASE64`: Base64-encoded Google service account credentials

### SAM Configuration (`samconfig.toml`)
- **Region**: `ap-southeast-7` (Thailand)
- **Stack Name**: `line-bot-msg-api`
- **Capabilities**: `CAPABILITY_IAM`

## 🛠️ Development Commands

```bash
# Clean build artifacts
npm run clean

# Build application
npm run build

# Deploy application
npm run deploy

# Run tests
cd line-bot-msg-api && npm run test

# Local development
sam local start-api

# Test specific functionality
./line-bot-msg-api/tests/script/test-echo-control.sh
./line-bot-msg-api/tests/script/test-bot-identification.sh
./line-bot-msg-api/tests/script/test-new-direction-column.sh
```

## 🔒 Security Considerations

- Environment variables are stored securely in AWS Lambda
- LINE and Google credentials are passed as CloudFormation parameters (masked in logs)
- Google service account credentials are base64-encoded for secure transmission
- API Gateway endpoint validates LINE webhook signatures
- Google Sheets access limited to service account with minimal permissions
- Consider implementing additional authentication for production use

## 📝 Notes

- The application is optimized for AWS Lambda with ARM64 architecture
- Source maps are enabled for better debugging (can be disabled for performance)
- Built with esbuild for fast compilation and smaller bundle size
- Supports incremental builds for faster development

## 🐛 Troubleshooting

### Common Issues

1. **Parameter validation error**: Ensure `.env` file exists and contains valid LINE and Google credentials
2. **Google Sheets access denied**: Verify service account has edit access to your Google Sheet
3. **Base64 encoding issues**: Ensure Google credentials are properly base64-encoded without line breaks
4. **Region not found**: Verify AWS region availability in your account
5. **Build failures**: Check Node.js version (requires 22.x)
6. **Deployment issues**: Ensure AWS credentials are properly configured
7. **Echo commands not working**: Check CloudWatch logs for user state management
8. **Messages not logging**: Verify Google Sheet ID and credentials are correct

### Debugging Steps

1. **Check CloudWatch Logs**:
   ```bash
   sam logs -n LineLoggerFunction --stack-name line-bot-msg-api --tail
   ```

2. **Test Google Sheets Connection**:
   ```bash
   ./line-bot-msg-api/tests/script/test-new-direction-column.sh
   ```

3. **Verify LINE Webhook**:
   ```bash
   ./line-bot-msg-api/tests/script/test-webhook.sh
   ```

4. **Test Manual Logging**:
   ```bash
   ./line-bot-msg-api/tests/script/test-manual-logging.sh
   ```

### Getting Help

- Check CloudWatch logs for runtime errors
- Use `sam validate` to check template syntax
- Run `sam local invoke` for local debugging
- Review Google Sheets API quotas and limits
- Verify LINE webhook signature validation

## 🆕 Recent Updates

### v2.0.0 - Comprehensive Logging System
- ✅ **Google Sheets Integration**: Full bidirectional message logging
- ✅ **Direction Column**: Moved to column B for better organization
- ✅ **Bangkok Timezone**: All timestamps in UTC+7
- ✅ **BOT Identification**: Clear distinction between user and bot messages
- ✅ **Echo Control**: Interactive echo enable/disable functionality
- ✅ **Manual Logging**: Endpoint for logging LINE OA messages
- ✅ **Comprehensive Testing**: Full test suite for all functionality
- ✅ **Enhanced Documentation**: Complete guides and troubleshooting

### Column Structure Evolution
The Google Sheets logging now uses an optimized 7-column structure:
- **Column A**: Timestamp (Bangkok time)
- **Column B**: Direction (incoming/outgoing) - **New position for better filtering**
- **Column C**: UserID
- **Column D**: DisplayName  
- **Column E**: MessageType
- **Column F**: MessageContent
- **Column G**: MessageID

This structure provides better organization and easier analysis of message flows.
```