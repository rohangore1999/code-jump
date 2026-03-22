const vscode = require('vscode');
const { getClipboardReferencePreview } = require('../utils/clipboardMonitor');

let statusBarItem = null;

/**
 * Create and show status bar item with current reference
 */
async function createStatusBarItem(context) {
  if (!statusBarItem) {
    statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100
    );
    statusBarItem.command = 'codeJump.navigateToReference';
    context.subscriptions.push(statusBarItem);
  }
  
  return statusBarItem;
}

/**
 * Update status bar with current clipboard reference
 */
async function updateStatusBar() {
  if (!statusBarItem) {
    return;
  }
  
  const preview = await getClipboardReferencePreview(40);
  
  if (preview) {
    statusBarItem.text = `$(link) ${preview}`;
    statusBarItem.tooltip = `Click to navigate to: ${preview}\nOr press Cmd+Shift+V`;
    statusBarItem.show();
  } else {
    statusBarItem.hide();
  }
}

/**
 * Hide status bar
 */
function hideStatusBar() {
  if (statusBarItem) {
    statusBarItem.hide();
  }
}

module.exports = {
  createStatusBarItem,
  updateStatusBar,
  hideStatusBar
};
