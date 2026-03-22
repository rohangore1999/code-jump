const vscode = require('vscode');
const { copyReference } = require('./commands/copyReference');
const { navigateToReference } = require('./commands/navigateReference');
const { getClipboardReferencePreview } = require('./utils/clipboardMonitor');
const { createStatusBarItem, updateStatusBar } = require('./utils/statusBar');

/**
 * Update command with current clipboard reference in title
 */
async function updateNavigateCommandTitle() {
  const preview = await getClipboardReferencePreview(45);
  
  if (preview) {
    await vscode.commands.executeCommand('setContext', 'codeJump.hasValidReference', true);
    await vscode.commands.executeCommand('setContext', 'codeJump.referenceText', preview);
  } else {
    await vscode.commands.executeCommand('setContext', 'codeJump.hasValidReference', false);
    await vscode.commands.executeCommand('setContext', 'codeJump.referenceText', '');
  }
  
  // Update status bar
  await updateStatusBar();
}

/**
 * Activate extension
 */
async function activate(context) {
  console.log('CodeJump extension is now active!');
  
  // Create status bar item
  await createStatusBarItem(context);
  
  // Register copy command
  const copyCommand = vscode.commands.registerCommand(
    'codeJump.copyReference',
    async () => {
      await copyReference();
      // Update context after copying
      await updateNavigateCommandTitle();
    }
  );
  
  // Register navigate command
  const navigateCommand = vscode.commands.registerCommand(
    'codeJump.navigateToReference',
    navigateToReference
  );
  
  // Update menu visibility when clipboard might change
  context.subscriptions.push(
    vscode.window.onDidChangeWindowState(async (e) => {
      if (e.focused) {
        await updateNavigateCommandTitle();
      }
    })
  );
  
  context.subscriptions.push(
    vscode.window.onDidChangeTextEditorSelection(async () => {
      // Update when selection changes (user might be about to right-click)
      await updateNavigateCommandTitle();
    })
  );
  
  // Check clipboard periodically (every 500ms when window is focused)
  const intervalId = setInterval(async () => {
    if (vscode.window.state.focused) {
      await updateNavigateCommandTitle();
    }
  }, 500);
  
  context.subscriptions.push({
    dispose: () => clearInterval(intervalId)
  });
  
  // Initial context update
  await updateNavigateCommandTitle();
  
  context.subscriptions.push(copyCommand, navigateCommand);
}

/**
 * Deactivate extension
 */
function deactivate() {
  console.log('CodeJump extension is now deactivated');
}

module.exports = {
  activate,
  deactivate
};
