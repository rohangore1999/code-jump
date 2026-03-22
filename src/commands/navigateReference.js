const vscode = require('vscode');
const { parseReference } = require('../utils/parser');
const { findFileInWorkspace } = require('../utils/fileResolver');

// Store decoration type globally to reuse
let highlightDecorationType = null;

/**
 * Navigate to code reference from clipboard (direct, no preview)
 */
async function navigateToReference() {
  // Get text from clipboard
  const clipboardText = await vscode.env.clipboard.readText();
  
  if (!clipboardText) {
    vscode.window.showWarningMessage('Clipboard is empty');
    return;
  }
  
  // Parse reference
  const reference = parseReference(clipboardText);
  
  if (!reference) {
    vscode.window.showWarningMessage('No valid code reference found in clipboard');
    return;
  }
  
  const { fileName, startLine, endLine } = reference;
  
  // Find file in workspace
  const fileUri = await findFileInWorkspace(fileName);
  
  if (!fileUri) {
    vscode.window.showErrorMessage(`File not found: ${fileName}`);
    return;
  }
  
  // Open document
  const document = await vscode.workspace.openTextDocument(fileUri);
  const editor = await vscode.window.showTextDocument(document);
  
  // Convert to 0-indexed positions
  const startPos = new vscode.Position(startLine - 1, 0);
  const endPos = new vscode.Position(endLine - 1, document.lineAt(endLine - 1).text.length);
  
  const range = new vscode.Range(startPos, endPos);
  
  // Set selection
  editor.selection = new vscode.Selection(startPos, endPos);
  
  // Reveal range in center of editor
  editor.revealRange(range, vscode.TextEditorRevealType.InCenter);
  
  // Apply highlight decoration
  if (!highlightDecorationType) {
    highlightDecorationType = vscode.window.createTextEditorDecorationType({
      backgroundColor: 'rgba(255, 200, 0, 0.3)',
      isWholeLine: true,
      overviewRulerColor: 'rgba(255, 200, 0, 0.8)',
      overviewRulerLane: vscode.OverviewRulerLane.Center
    });
  }
  
  // Clear previous decorations on all editors
  vscode.window.visibleTextEditors.forEach(e => {
    e.setDecorations(highlightDecorationType, []);
  });
  
  // Apply new decoration
  editor.setDecorations(highlightDecorationType, [range]);
  
  // Clear decoration when user changes selection
  const disposable = vscode.window.onDidChangeTextEditorSelection((e) => {
    if (e.textEditor === editor) {
      editor.setDecorations(highlightDecorationType, []);
      disposable.dispose();
    }
  });
  
  vscode.window.showInformationMessage(`Jumped to: ${fileName} (${startLine}-${endLine})`);
}

module.exports = { navigateToReference };
