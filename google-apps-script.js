// ============================================================
// Google Apps Script — Fishy Weekend Order Logger
// ============================================================
// SETUP:
// 1. Create a new Google Sheet
// 2. Go to Extensions > Apps Script
// 3. Paste this entire script, replacing any existing code
// 4. Click Deploy > New deployment
//    - Type: Web app
//    - Execute as: Me
//    - Who has access: Anyone
// 5. Copy the deployed URL and paste it into index.html
//    (replace the GOOGLE_SCRIPT_URL value)
// 6. The first time, Google will ask you to authorize — accept it
// ============================================================

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Support both FormData (payload param) and raw JSON body
    var raw = e.parameter.payload || e.postData.contents;
    var data = JSON.parse(raw);

    // Add headers if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Timestamp',
        'Name',
        'Phone',
        'Postal Code',
        'Door #',
        'Order Items',
        'Grand Total',
        'Fish Head',
        'Spicy Level',
        'Delivery Day',
        'Delivery Time',
        'Special Instructions'
      ]);
      // Bold the header row
      sheet.getRange(1, 1, 1, 12).setFontWeight('bold');
    }

    sheet.appendRow([
      new Date().toLocaleString('nl-NL', { timeZone: 'Europe/Amsterdam' }),
      data.name || '',
      data.phone ? "'" + data.phone : '',
      data.postal || '',
      data.door || '',
      data.orderItems || '',
      data.grandTotal || '',
      data.fishHead || '',
      data.spicyLevel || '',
      data.deliveryDay || '',
      data.deliveryTime || '',
      data.specialInstructions || ''
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Required for CORS preflight (though Apps Script handles this automatically)
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', message: 'Fishy Weekend order endpoint is live' }))
    .setMimeType(ContentService.MimeType.JSON);
}
