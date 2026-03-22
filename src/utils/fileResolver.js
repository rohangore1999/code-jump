const vscode = require('vscode');
const path = require('path');

/**
 * Find file in workspace by name
 */
async function findFileInWorkspace(fileName) {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  
  if (!workspaceFolders) {
    return null;
  }
  
  // Try to find the file using relative path from workspace root
  for (const folder of workspaceFolders) {
    const filePath = path.join(folder.uri.fsPath, fileName);
    try {
      await vscode.workspace.fs.stat(vscode.Uri.file(filePath));
      return vscode.Uri.file(filePath);
    } catch (error) {
      // File doesn't exist at this path, continue searching
    }
  }
  
  // If not found with relative path, search all files with that name
  const pattern = `**/${path.basename(fileName)}`;
  const files = await vscode.workspace.findFiles(pattern, '**/node_modules/**', 10);
  
  if (files.length === 1) {
    return files[0];
  } else if (files.length > 1) {
    // Multiple matches found - for now return first one
    // (In future, could show quick pick selector)
    return files[0];
  }
  
  return null;
}

module.exports = { findFileInWorkspace };
