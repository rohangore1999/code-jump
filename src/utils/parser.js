/**
 * Parse code reference format: @filename (startLine-endLine) or @filename (line)
 */
function parseReference(text) {
  const pattern = /@([^\s(]+)\s*\((\d+)(?:-(\d+))?\)/;
  const match = text.match(pattern);
  
  if (!match) {
    return null;
  }
  
  const fileName = match[1];
  const startLine = parseInt(match[2], 10);
  const endLine = match[3] ? parseInt(match[3], 10) : startLine;
  
  return {
    fileName,
    startLine,
    endLine
  };
}

module.exports = { parseReference };
