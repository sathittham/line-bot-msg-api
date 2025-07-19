# linebotlogger
# LINE Webhook Logger

This project contains the source code for a serverless application that logs incoming webhooks from the LINE Messaging API. It is designed to be deployed using the AWS Serverless Application Model (SAM) CLI.
A simple serverless application built with AWS SAM to receive and log webhooks from the LINE Messaging API.

- **`linelogger/`**: Contains the Lambda function source code (TypeScript).
- **`linelogger/tests/`**: Contains unit tests for the function.
- **`template.yaml`**: Defines the AWS resources for the application (API Gateway, Lambda).
- **`samconfig.toml`**: Stores deployment configuration.

## Prerequisites

*   AWS SAM CLI
*   Node.js 22
*   Docker

## Setup & Configuration
### 1. Install Dependencies

Navigate into the function's directory and install the required Node.js packages.
```bash
cd linelogger
npm install
cd ..
```
### 2. Local Environment Variables

For local development, create a `.env` file inside the `linelogger/` directory. This file is ignored by Git.


**File: `linelogger/.env`**
```
LINE_CHANNEL_ACCESS_TOKEN="YOUR_CHANNEL_ACCESS_TOKEN"
LINE_CHANNEL_SECRET="YOUR_CHANNEL_SECRET"
```

## Local Development & Testing

### Run Unit Tests

From the `linelogger` directory, run the Jest tests.

```bash
cd linelogger
npm run test
```