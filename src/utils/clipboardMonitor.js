const vscode = require('vscode');
const { parseReference } = require('./parser');

/**
 * Get truncated reference preview from clipboard
 * Returns null if no valid reference found
 */
async function getClipboardReferencePreview(maxLength = 50) {
  try {
    const clipboardText = await vscode.env.clipboard.readText();
    
    if (!clipboardText) {
      return null;
    }
    
    const reference = parseReference(clipboardText);
    
    if (!reference) {
      return null;
    }
    
    // Format: @filename (lines)
    const { fileName, startLine, endLine } = reference;
    let preview;
    
    if (startLine === endLine) {
      preview = `@${fileName} (${startLine})`;
    } else {
      preview = `@${fileName} (${startLine}-${endLine})`;
    }
    
    // Truncate if too long
    if (preview.length > maxLength) {
      preview = preview.substring(0, maxLength - 3) + '...';
    }
    
    return preview;
  } catch (error) {
    return null;
  }
}

/**
 * Update context key for menu visibility
 */
async function updateNavigateMenuContext() {
  const hasValidReference = await getClipboardReferencePreview() !== null;
  await vscode.commands.executeCommand(
    'setContext',
    'codeJump.hasValidReference',
    hasValidReference
  );
  return hasValidReference;
}

module.exports = {
  getClipboardReferencePreview,
  updateNavigateMenuContext
};
