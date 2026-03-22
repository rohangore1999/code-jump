const vscode = require('vscode');
const path = require('path');

/**
 * Copy code reference to clipboard
 */
async function copyReference() {
  const editor = vscode.window.activeTextEditor;
  
  if (!editor) {
    vscode.window.showWarningMessage('No active editor');
    return;
  }
  
  const selection = editor.selection;
  const document = editor.document;
  
  // Get workspace-relative path
  const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
  let relativePath;
  
  if (workspaceFolder) {
    relativePath = path.relative(workspaceFolder.uri.fsPath, document.uri.fsPath);
  } else {
    // No workspace, use filename only
    relativePath = path.basename(document.uri.fsPath);
  }
  
  // Get line numbers (1-indexed for display)
  const startLine = selection.start.line + 1;
  const endLine = selection.end.line + 1;
  
  // Format reference
  let reference;
  if (startLine === endLine) {
    reference = `@${relativePath} (${startLine})`;
  } else {
    reference = `@${relativePath} (${startLine}-${endLine})`;
  }
  
  // Copy to clipboard
  await vscode.env.clipboard.writeText(reference);
  
  // Show success message
  vscode.window.showInformationMessage(`Copied: ${reference}`);
}

module.exports = { copyReference };
