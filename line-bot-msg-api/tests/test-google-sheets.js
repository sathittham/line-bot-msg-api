"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var googleapis_1 = require("googleapis");
var dotenv = require("dotenv");
// Load environment variables
dotenv.config();
function testGoogleSheetsAccess() {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function () {
        var credentials, auth, sheets, spreadsheetId, response, readError_1, errorMessage, timestamp, testData, writeResponse, writeError_1, errorMessage, error_1, errorMessage;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    console.log('🔍 Testing Google Sheets access...\n');
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 10, , 11]);
                    // Check environment variables
                    console.log('📋 Environment Variables:');
                    console.log("  GOOGLE_SHEET_ID: ".concat(process.env.GOOGLE_SHEET_ID ? '✅ Set' : '❌ Missing'));
                    console.log("  GOOGLE_CREDENTIALS: ".concat(process.env.GOOGLE_CREDENTIALS ? '✅ Set' : '❌ Missing', "\n"));
                    if (!process.env.GOOGLE_SHEET_ID || !process.env.GOOGLE_CREDENTIALS) {
                        console.error('❌ Missing required environment variables');
                        return [2 /*return*/];
                    }
                    credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
                    console.log('📝 Credentials Info:');
                    console.log("  Project ID: ".concat(credentials.project_id));
                    console.log("  Client Email: ".concat(credentials.client_email, "\n"));
                    // Initialize auth
                    console.log('🔐 Initializing Google Auth...');
                    auth = new googleapis_1.google.auth.GoogleAuth({
                        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
                        credentials: credentials
                    });
                    console.log('✅ Auth client created successfully\n');
                    // Initialize Sheets API
                    console.log('📊 Initializing Sheets API...');
                    sheets = googleapis_1.google.sheets({ version: 'v4', auth: auth });
                    spreadsheetId = process.env.GOOGLE_SHEET_ID;
                    // Test 1: Read existing data
                    console.log('🔍 Test 1: Reading existing data...');
                    _d.label = 2;
                case 2:
                    _d.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, sheets.spreadsheets.values.get({
                            spreadsheetId: spreadsheetId,
                            range: 'Sheet1!A1:C10'
                        })];
                case 3:
                    response = _d.sent();
                    console.log("\u2705 Read successful! Found ".concat(((_a = response.data.values) === null || _a === void 0 ? void 0 : _a.length) || 0, " rows"));
                    if (response.data.values && response.data.values.length > 0) {
                        console.log('📋 Sample data:');
                        response.data.values.slice(0, 3).forEach(function (row, index) {
                            console.log("  Row ".concat(index + 1, ": ").concat(row.join(' | ')));
                        });
                    }
                    return [3 /*break*/, 5];
                case 4:
                    readError_1 = _d.sent();
                    errorMessage = readError_1 instanceof Error ? readError_1.message : String(readError_1);
                    console.log("\u26A0\uFE0F  Read test failed: ".concat(errorMessage));
                    return [3 /*break*/, 5];
                case 5:
                    console.log('');
                    // Test 2: Write test data
                    console.log('✏️  Test 2: Writing test data...');
                    timestamp = new Date().toISOString();
                    testData = [[timestamp, 'test-user-local', 'Test message from local test script']];
                    _d.label = 6;
                case 6:
                    _d.trys.push([6, 8, , 9]);
                    return [4 /*yield*/, sheets.spreadsheets.values.append({
                            spreadsheetId: spreadsheetId,
                            range: 'Sheet1!A:C',
                            valueInputOption: 'RAW',
                            requestBody: {
                                values: testData
                            }
                        })];
                case 7:
                    writeResponse = _d.sent();
                    console.log('✅ Write successful!');
                    console.log("\uD83D\uDCCD Updated range: ".concat((_b = writeResponse.data.updates) === null || _b === void 0 ? void 0 : _b.updatedRange));
                    console.log("\uD83D\uDCCA Updated rows: ".concat((_c = writeResponse.data.updates) === null || _c === void 0 ? void 0 : _c.updatedRows));
                    console.log('🔗 Check your Google Sheet:', "https://docs.google.com/spreadsheets/d/".concat(spreadsheetId, "/edit"));
                    return [3 /*break*/, 9];
                case 8:
                    writeError_1 = _d.sent();
                    errorMessage = writeError_1 instanceof Error ? writeError_1.message : String(writeError_1);
                    console.log("\u274C Write test failed: ".concat(errorMessage));
                    return [3 /*break*/, 9];
                case 9:
                    console.log('\n🎉 Google Sheets test completed!');
                    return [3 /*break*/, 11];
                case 10:
                    error_1 = _d.sent();
                    errorMessage = error_1 instanceof Error ? error_1.message : String(error_1);
                    console.error('❌ Google Sheets test failed:', errorMessage);
                    if (error_1 instanceof Error && 'code' in error_1) {
                        console.error("   Error code: ".concat(error_1.code));
                    }
                    return [3 /*break*/, 11];
                case 11: return [2 /*return*/];
            }
        });
    });
}
// Run the test
testGoogleSheetsAccess();
