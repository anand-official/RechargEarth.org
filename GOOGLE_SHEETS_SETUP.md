# Google Sheets Integration Setup for RechargEarth

## Overview
This guide sets up automatic syncing of pledges and orders from Firestore to Google Sheets using Firebase Cloud Functions and Google Apps Script.

## Step 1: Create a Google Sheet

1. Go to [Google Drive](https://drive.google.com)
2. Click "+ New" → "Google Sheets" → "Blank spreadsheet"
3. Name it: "RechargEarth Data Sync"
4. Create 3 sheets: "Pledges", "Orders", "Archive"

### Sheet 1: Pledges
Add these column headers in row 1:
- A: Date/Time
- B: First Name
- C: Last Name
- D: Full Name
- E: Email
- F: Phone
- G: Birthday
- H: Firestore ID

### Sheet 2: Orders
Add these column headers in row 1:
- A: Date/Time
- B: Order ID
- C: Customer Name
- D: Email
- E: Phone
- F: Items
- G: Subtotal
- H: Tax
- I: Total
- J: Payment Method
- K: Payment Status
- L: Order Status
- M: Firestore ID

### Sheet 3: Archive
Same as Pledges and Orders combined for archival.

## Step 2: Create Google Apps Script

1. In your Google Sheet, click "Tools" → "Script editor"
2. Replace all code with this:

```javascript
// RechargEarth Google Sheets Sync Script
// This receives data from Firebase Cloud Functions and writes to sheets

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    if (payload.type === 'pledge') {
      addPledgeToSheet(ss, payload);
    } else if (payload.type === 'order') {
      addOrderToSheet(ss, payload);
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({ success: true, id: payload.id }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    Logger.log('Error: ' + error);
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function addPledgeToSheet(ss, data) {
  const sheet = ss.getSheetByName('Pledges');
  if (!sheet) return;
  
  sheet.appendRow([
    data.timestamp,
    data.firstName,
    data.lastName,
    data.fullName,
    data.email,
    data.phone,
    data.birthday,
    data.id
  ]);
}

function addOrderToSheet(ss, data) {
  const sheet = ss.getSheetByName('Orders');
  if (!sheet) return;
  
  sheet.appendRow([
    data.timestamp,
    data.orderId,
    data.customerName,
    data.customerEmail,
    data.customerPhone,
    data.items,
    data.subtotal,
    data.tax,
    data.total,
    data.paymentMethod,
    data.paymentStatus,
    data.orderStatus,
    data.id
  ]);
}

function testWebhook() {
  const testData = {
    type: 'pledge',
    id: 'test_' + Date.now(),
    firstName: 'Test',
    lastName: 'User',
    fullName: 'Test User',
    email: 'test@example.com',
    phone: '+91-9876543210',
    birthday: '15-06',
    timestamp: new Date().toISOString()
  };
  
  const url = ScriptApp.getService().getUrl();
  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(testData),
    muteHttpExceptions: true
  };
  
  const response = UrlFetchApp.fetch(url, options);
  Logger.log('Test response: ' + response.getContentText());
}
```

3. Click "Run" → "testWebhook" to test
4. Click "Deploy" → "New Deployment" → "Type: Web app"
5. Set:
   - Execute as: Your account
   - Who has access: Anyone
6. Copy the deployment URL

## Step 3: Set Firebase Cloud Function Environment Variable

```bash
cd /workspaces/RechargEarth.org/functions

# Create or update .env.local file
echo "GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/usercopy" > .env.local

# Deploy functions
firebase deploy --only functions --project rechargearth-d1f7d
```

Replace `YOUR_DEPLOYMENT_ID` with the ID from the deployment URL.

## Step 4: Test the Integration

1. Go to your RechargEarth site
2. Fill out and submit the pledge form
3. Wait 2-3 seconds
4. Check your Google Sheet - the pledge should appear automatically!

## Troubleshooting

### Data not appearing in Google Sheets?

**Check Firebase Cloud Functions logs:**
```bash
firebase functions:log --project rechargearth-d1f7d
```

**Common issues:**
1. **Wrong Webhook URL** - Copy the deployment URL exactly from Apps Script
2. **Script not deployed** - Make sure you clicked "Deploy" in Apps Script editor
3. **Wrong sheet names** - Make sure sheets are named exactly "Pledges" and "Orders"
4. **Permissions** - Make sure the web app is set to "Anyone" in deployment

### Testing the webhook manually:

```bash
curl -X POST https://script.google.com/macros/s/YOUR_ID/usercopy \
  -H "Content-Type: application/json" \
  -d '{
    "type": "pledge",
    "id": "test_123",
    "firstName": "Test",
    "lastName": "User",
    "fullName": "Test User",
    "email": "test@example.com",
    "phone": "+91-9876543210",
    "birthday": "15-06",
    "timestamp": "2025-12-13T10:00:00Z"
  }'
```

## Alternative: Use SheetDB (No Code Required)

If Apps Script is too complex, you can use [SheetDB](https://sheetdb.io):

1. Go to SheetDB.io
2. Connect your Google Sheet
3. Get the API endpoint
4. In Firebase function, instead of webhook, use:

```javascript
const response = await fetch('https://sheetdb.io/api/v1/YOUR_KEY', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
});
```

This is simpler and requires zero coding!

## Monitoring Sheet Updates

To see real-time updates:
1. Keep your Google Sheet open
2. Enable "Notification rules" in the sheet
3. You'll get email alerts when data is added

## Archiving Data

To move old data to Archive sheet:
1. Select rows to archive (e.g., older than 30 days)
2. Cut and paste to "Archive" sheet
3. This keeps active sheets clean and fast

## Production Checklist

- [ ] Google Sheet created and shared with team
- [ ] Apps Script deployed
- [ ] Firebase Cloud Functions deployed with webhook URL
- [ ] Test pledge submitted and appears in sheet
- [ ] Test order submitted and appears in sheet
- [ ] Email alerts configured
- [ ] Backups enabled for Google Sheet
- [ ] Monitored Firebase logs for errors

## Support

If you have issues:
1. Check [Firebase Functions Documentation](https://firebase.google.com/docs/functions)
2. Check [Google Apps Script Documentation](https://developers.google.com/apps-script)
3. View Firebase logs: `firebase functions:log`
4. Check Apps Script logs: Apps Script Editor → "Execution log"
