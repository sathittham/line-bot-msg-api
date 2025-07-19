import { google } from 'googleapis';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testGoogleSheetsAccess() {
    console.log('🔍 Testing Google Sheets access...\n');

    try {
        // Check environment variables
        console.log('📋 Environment Variables:');
        console.log(`  GOOGLE_SHEET_ID: ${process.env.GOOGLE_SHEET_ID ? '✅ Set' : '❌ Missing'}`);
        console.log(`  GOOGLE_CREDENTIALS: ${process.env.GOOGLE_CREDENTIALS ? '✅ Set' : '❌ Missing'}\n`);

        if (!process.env.GOOGLE_SHEET_ID || !process.env.GOOGLE_CREDENTIALS) {
            console.error('❌ Missing required environment variables');
            return;
        }

        // Parse credentials
        const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
        console.log('📝 Credentials Info:');
        console.log(`  Project ID: ${credentials.project_id}`);
        console.log(`  Client Email: ${credentials.client_email}\n`);

        // Initialize auth
        console.log('🔐 Initializing Google Auth...');
        const auth = new google.auth.GoogleAuth({
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
            credentials: credentials,
        });

        console.log('✅ Auth client created successfully\n');

        // Initialize Sheets API
        console.log('📊 Initializing Sheets API...');
        const sheets = google.sheets({ version: 'v4', auth });
        const spreadsheetId = process.env.GOOGLE_SHEET_ID;

        // Test 1: Read existing data
        console.log('🔍 Test 1: Reading existing data...');
        try {
            const response = await sheets.spreadsheets.values.get({
                spreadsheetId: spreadsheetId,
                range: 'Sheet1!A1:C10',
            });

            console.log(`✅ Read successful! Found ${response.data.values?.length || 0} rows`);
            if (response.data.values && response.data.values.length > 0) {
                console.log('📋 Sample data:');
                response.data.values.slice(0, 3).forEach((row, index) => {
                    console.log(`  Row ${index + 1}: ${row.join(' | ')}`);
                });
            }
        } catch (readError: unknown) {
            const errorMessage = readError instanceof Error ? readError.message : String(readError);
            console.log(`⚠️  Read test failed: ${errorMessage}`);
        }

        console.log('');

        // Test 2: Write test data
        console.log('✏️  Test 2: Writing test data...');
        const timestamp = new Date().toISOString();
        const testData = [[timestamp, 'test-user-local', 'Test message from local test script']];

        try {
            const writeResponse = await sheets.spreadsheets.values.append({
                spreadsheetId: spreadsheetId,
                range: 'Sheet1!A:C',
                valueInputOption: 'RAW',
                requestBody: {
                    values: testData,
                },
            });

            console.log('✅ Write successful!');
            console.log(`📍 Updated range: ${writeResponse.data.updates?.updatedRange}`);
            console.log(`📊 Updated rows: ${writeResponse.data.updates?.updatedRows}`);
            console.log('🔗 Check your Google Sheet:', `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`);
        } catch (writeError: unknown) {
            const errorMessage = writeError instanceof Error ? writeError.message : String(writeError);
            console.log(`❌ Write test failed: ${errorMessage}`);
        }

        console.log('\n🎉 Google Sheets test completed!');
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('❌ Google Sheets test failed:', errorMessage);
        if (error instanceof Error && 'code' in error) {
            console.error(`   Error code: ${(error as { code: string }).code}`);
        }
    }
}

// Run the test
testGoogleSheetsAccess();
