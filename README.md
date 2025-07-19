# LINE Bot Message API Logger

A serverless application built with AWS SAM (Serverless Application Model) to receive and log webhooks from the LINE Messaging API. This application is deployed to AWS Lambda and API Gateway in the AWS Asia Pacific (Thailand) region.

## 🏗️ Project Structure

```
linebotlogger/
├── line-bot-msg-api/          # Lambda function source code (TypeScript)
│   ├── app.ts                 # Main Lambda handler
│   ├── tests/                 # Unit tests
│   ├── package.json           # Function dependencies
│   ├── .env                   # Environment variables (LINE credentials)
│   └── .env.example           # Environment variables template
├── template.yaml              # SAM template (AWS resources)
├── samconfig.toml            # SAM deployment configuration
├── deploy.sh                 # Deployment script with environment handling
├── package.json              # Root package for build scripts
└── README.md                 # This file
```

## 📋 Prerequisites

- **AWS CLI** - configured with appropriate credentials
- **AWS SAM CLI** - for building and deploying serverless applications
- **Node.js 22.x** - runtime for the Lambda function
- **Docker** - required by SAM for local testing
- **LINE Developer Account** - for obtaining channel credentials

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
```

> ⚠️ **Security Note**: Never commit the `.env` file to version control. It's already included in `.gitignore`.

## 🧪 Local Development & Testing

### Run Unit Tests

```bash
cd line-bot-msg-api
npm run test
```

### Local API Testing

Start the API locally for testing:

```bash
sam local start-api
```

The API will be available at `http://localhost:3000/webhook`

### Test with Local Invocation

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
- Validates required LINE credentials
- Builds and deploys the application with proper parameter overrides

### Manual Deployment

If you prefer manual deployment:

```bash
# Build the application
npm run build

# Deploy with parameters
sam deploy --parameter-overrides \
  "LineChannelAccessToken=YOUR_ACCESS_TOKEN" \
  "LineChannelSecret=YOUR_CHANNEL_SECRET"
```

### Alternative: Use npm scripts

```bash
# Clean, build, and deploy in one command
npm run deploy
```

## 🌐 Deployed Resources

After successful deployment, you'll receive:

### Example Deployment Outputs
- **API Gateway Endpoint**: The `LineLoggerApi` value from the `sam deploy` output.
- **Lambda Function**: The `LineLoggerFunction` value from the `sam deploy` output
- **Region**: `ap-southeast-7` (Asia Pacific - Thailand)
- **Stack Name**: `line-bot-msg-api`

## 🔗 LINE Bot Configuration

Configure your LINE bot to use the deployed webhook URL:

1. Go to [LINE Developers Console](https://developers.line.biz/)
2. Select your channel
3. Go to "Messaging API" tab
4. Set **Webhook URL** to the `LineLoggerApi` value from the `sam deploy` output.
Prod/webhook`
5. Enable "Use webhook"
6. Verify the webhook connection

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
```

## 🔒 Security Considerations

- Environment variables are stored securely in AWS Lambda
- LINE credentials are passed as CloudFormation parameters (masked in logs)
- API Gateway endpoint is public but validates LINE webhook signatures
- Consider implementing additional authentication for production use

## 📝 Notes

- The application is optimized for AWS Lambda with ARM64 architecture
- Source maps are enabled for better debugging (can be disabled for performance)
- Built with esbuild for fast compilation and smaller bundle size
- Supports incremental builds for faster development

## 🐛 Troubleshooting

### Common Issues

1. **Parameter validation error**: Ensure `.env` file exists and contains valid LINE credentials
2. **Region not found**: Verify AWS region availability in your account
3. **Build failures**: Check Node.js version (requires 22.x)
4. **Deployment issues**: Ensure AWS credentials are properly configured

### Getting Help

- Check CloudWatch logs for runtime errors
- Use `sam validate` to check template syntax
- Run `sam local invoke` for local debugging
```