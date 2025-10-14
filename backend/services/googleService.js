const { google } = require('googleapis');

function getOAuth2Client(connectedApp) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  oauth2Client.setCredentials({
    access_token: connectedApp.accessToken,
    refresh_token: connectedApp.refreshToken,
    expiry_date: connectedApp.expiryDate
  });

  return oauth2Client;
}

// Gmail Functions
async function sendEmail(connectedApp, config) {
  try {
    const oauth2Client = getOAuth2Client(connectedApp);
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    const { to, subject, body } = config;

    const message = [
      `To: ${to}`,
      `Subject: ${subject}`,
      '',
      body
    ].join('\n');

    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const result = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage
      }
    });

    return {
      success: true,
      message: 'Email sent successfully',
      data: { messageId: result.data.id }
    };
  } catch (err) {
    return {
      success: false,
      message: `Failed to send email: ${err.message}`
    };
  }
}

async function checkNewEmails(connectedApp) {
  try {
    const oauth2Client = getOAuth2Client(connectedApp);
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    const result = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 5,
      q: 'is:unread'
    });

    return {
      success: true,
      message: `Found ${result.data.messages?.length || 0} unread emails`,
      data: { emails: result.data.messages || [] }
    };
  } catch (err) {
    return {
      success: false,
      message: `Failed to check emails: ${err.message}`
    };
  }
}

// Google Sheets Functions
async function addSheetRow(connectedApp, config, previousData) {
  try {
    const oauth2Client = getOAuth2Client(connectedApp);
    const sheets = google.sheets({ version: 'v4', auth: oauth2Client });

    const { spreadsheetId, range, values } = config;

    const result = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: values || [[new Date().toISOString(), JSON.stringify(previousData)]]
      }
    });

    return {
      success: true,
      message: 'Row added to spreadsheet',
      data: { updates: result.data.updates }
    };
  } catch (err) {
    return {
      success: false,
      message: `Failed to add row: ${err.message}`
    };
  }
}

async function updateSheetRow(connectedApp, config) {
  try {
    const oauth2Client = getOAuth2Client(connectedApp);
    const sheets = google.sheets({ version: 'v4', auth: oauth2Client });

    const { spreadsheetId, range, values } = config;

    const result = await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values
      }
    });

    return {
      success: true,
      message: 'Row updated in spreadsheet',
      data: { updates: result.data }
    };
  } catch (err) {
    return {
      success: false,
      message: `Failed to update row: ${err.message}`
    };
  }
}

async function checkNewRows(connectedApp, config) {
  try {
    const oauth2Client = getOAuth2Client(connectedApp);
    const sheets = google.sheets({ version: 'v4', auth: oauth2Client });

    const { spreadsheetId, range } = config;

    const result = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range
    });

    return {
      success: true,
      message: `Retrieved ${result.data.values?.length || 0} rows`,
      data: { rows: result.data.values || [] }
    };
  } catch (err) {
    return {
      success: false,
      message: `Failed to check rows: ${err.message}`
    };
  }
}

// Google Calendar Functions
async function createCalendarEvent(connectedApp, config) {
  try {
    const oauth2Client = getOAuth2Client(connectedApp);
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const { summary, description, startTime, endTime, attendees } = config;

    const event = {
      summary,
      description,
      start: {
        dateTime: startTime,
        timeZone: 'UTC'
      },
      end: {
        dateTime: endTime,
        timeZone: 'UTC'
      },
      attendees: attendees ? attendees.map(email => ({ email })) : []
    };

    const result = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event
    });

    return {
      success: true,
      message: 'Calendar event created',
      data: { eventId: result.data.id, link: result.data.htmlLink }
    };
  } catch (err) {
    return {
      success: false,
      message: `Failed to create event: ${err.message}`
    };
  }
}

async function checkNewEvents(connectedApp) {
  try {
    const oauth2Client = getOAuth2Client(connectedApp);
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const result = await calendar.events.list({
      calendarId: 'primary',
      timeMin: (new Date()).toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime'
    });

    return {
      success: true,
      message: `Found ${result.data.items?.length || 0} upcoming events`,
      data: { events: result.data.items || [] }
    };
  } catch (err) {
    return {
      success: false,
      message: `Failed to check events: ${err.message}`
    };
  }
}

// Google Drive Functions
async function uploadFile(connectedApp, config) {
  try {
    const oauth2Client = getOAuth2Client(connectedApp);
    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    const { fileName, mimeType, content } = config;

    const fileMetadata = {
      name: fileName
    };

    const media = {
      mimeType,
      body: content
    };

    const result = await drive.files.create({
      requestBody: fileMetadata,
      media,
      fields: 'id, name, webViewLink'
    });

    return {
      success: true,
      message: 'File uploaded to Drive',
      data: { fileId: result.data.id, link: result.data.webViewLink }
    };
  } catch (err) {
    return {
      success: false,
      message: `Failed to upload file: ${err.message}`
    };
  }
}

async function createFolder(connectedApp, config) {
  try {
    const oauth2Client = getOAuth2Client(connectedApp);
    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    const { folderName } = config;

    const fileMetadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder'
    };

    const result = await drive.files.create({
      requestBody: fileMetadata,
      fields: 'id, name, webViewLink'
    });

    return {
      success: true,
      message: 'Folder created in Drive',
      data: { folderId: result.data.id, link: result.data.webViewLink }
    };
  } catch (err) {
    return {
      success: false,
      message: `Failed to create folder: ${err.message}`
    };
  }
}

module.exports = {
  sendEmail,
  checkNewEmails,
  addSheetRow,
  updateSheetRow,
  checkNewRows,
  createCalendarEvent,
  checkNewEvents,
  uploadFile,
  createFolder
};