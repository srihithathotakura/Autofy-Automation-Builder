const googleService = require('./googleService');

async function executeWorkflow(workflow, user) {
  const executionLog = {
    executedAt: new Date(),
    status: 'success',
    triggerData: {},
    results: []
  };

  try {
    console.log('🚀 Starting workflow:', workflow.name);

    for (let i = 0; i < workflow.steps.length; i++) {
      const step = workflow.steps[i];
      console.log(`📍 Step ${i + 1}/${workflow.steps.length}:`, step.app, '-', step.event);
      
      const stepResult = await executeStep(step, user, executionLog.triggerData);
      
      executionLog.results.push({
        stepIndex: i,
        success: stepResult.success,
        message: stepResult.message,
        data: stepResult.data
      });

      console.log(stepResult.success ? '✅' : '❌', stepResult.message);

      if (!stepResult.success) {
        executionLog.status = 'failed';
        executionLog.error = stepResult.message;
        break;
      }

      if (stepResult.data) {
        executionLog.triggerData = { ...executionLog.triggerData, ...stepResult.data };
      }
    }

    workflow.executionCount += 1;
    workflow.lastExecuted = new Date();
    
    if (executionLog.status === 'success') {
      workflow.successCount += 1;
      console.log('✅ Workflow completed successfully!');
    } else {
      workflow.failureCount += 1;
      console.log('❌ Workflow failed:', executionLog.error);
    }

    workflow.executionLogs.push(executionLog);
    if (workflow.executionLogs.length > 50) {
      workflow.executionLogs = workflow.executionLogs.slice(-50);
    }

    await workflow.save();
    return executionLog;

  } catch (err) {
    console.error('💥 Workflow error:', err);
    executionLog.status = 'failed';
    executionLog.error = err.message;
    
    workflow.executionCount += 1;
    workflow.failureCount += 1;
    workflow.executionLogs.push(executionLog);
    await workflow.save();

    throw err;
  }
}

async function executeStep(step, user, previousData) {
  const { app, event, accountEmail } = step;

  const connectedApp = user.connectedApps.find(
    ca => ca.appName === app && ca.accountEmail === accountEmail
  );

  if (!connectedApp) {
    return {
      success: false,
      message: `❌ ${app} account (${accountEmail}) not connected. Please reconnect in workspace.`
    };
  }

  try {
    let result;

    switch (app) {
      case 'Gmail':
        result = await executeGmailAction(event, connectedApp, step.config, previousData);
        break;
      case 'Google Sheets':
        result = await executeGoogleSheetsAction(event, connectedApp, step.config, previousData);
        break;
      case 'Google Calendar':
        result = await executeGoogleCalendarAction(event, connectedApp, step.config, previousData);
        break;
      case 'Google Drive':
        result = await executeGoogleDriveAction(event, connectedApp, step.config, previousData);
        break;
      default:
        return { success: false, message: `Unsupported app: ${app}` };
    }

    return result;
  } catch (err) {
    return {
      success: false,
      message: `Error: ${err.message}`
    };
  }
}

async function executeGmailAction(event, connectedApp, config, previousData) {
  switch (event) {
    case 'New Email':
      return await googleService.checkNewEmails(connectedApp);
    
    case 'Send Email':
      const emailConfig = {
        to: config?.to || connectedApp.accountEmail,
        subject: config?.subject || 'Automated Email from Autofy',
        body: config?.body || 'This email was sent by your Autofy workflow.'
      };
      return await googleService.sendEmail(connectedApp, emailConfig);
    
    default:
      return { success: false, message: `Unsupported Gmail event: ${event}` };
  }
}

async function executeGoogleSheetsAction(event, connectedApp, config, previousData) {
  switch (event) {
    case 'Add Row':
      const rowConfig = config || {};
      if (!rowConfig.spreadsheetId || !rowConfig.range) {
        return {
          success: false,
          message: 'Configuration missing: spreadsheetId and range required'
        };
      }
      return await googleService.addSheetRow(connectedApp, rowConfig, previousData);
    
    case 'Update Row':
      return await googleService.updateSheetRow(connectedApp, config);
    
    case 'New Row':
      return await googleService.checkNewRows(connectedApp, config);
    
    default:
      return { success: false, message: `Unsupported Sheets event: ${event}` };
  }
}

async function executeGoogleCalendarAction(event, connectedApp, config, previousData) {
  switch (event) {
    case 'Create Event':
      const eventConfig = {
        summary: config?.summary || 'Autofy Event',
        description: config?.description || 'Created by Autofy workflow',
        startTime: config?.startTime || new Date().toISOString(),
        endTime: config?.endTime || new Date(Date.now() + 3600000).toISOString(),
        attendees: config?.attendees || []
      };
      return await googleService.createCalendarEvent(connectedApp, eventConfig);
    
    case 'New Event':
      return await googleService.checkNewEvents(connectedApp);
    
    default:
      return { success: false, message: `Unsupported Calendar event: ${event}` };
  }
}

async function executeGoogleDriveAction(event, connectedApp, config, previousData) {
  switch (event) {
    case 'Create Folder':
      // CRITICAL: Auto-generate folder name with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const folderName = config?.folderName || `Autofy_Folder_${timestamp}`;
      
      console.log('📁 Creating folder:', folderName);
      return await googleService.createFolder(connectedApp, { folderName });
    
    case 'Upload File':
      if (!config?.fileName || !config?.content) {
        return {
          success: false,
          message: 'Configuration missing: fileName and content required'
        };
      }
      return await googleService.uploadFile(connectedApp, config);
    
    default:
      return { success: false, message: `Unsupported Drive event: ${event}` };
  }
}

module.exports = { executeWorkflow };