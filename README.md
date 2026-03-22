# CodeJump ⚡ - Technical Documentation

## Overview

CodeJump is a VS Code extension that enables instant code navigation through copyable references. Users can copy code locations as references (e.g., `@filename.js (10-20)`) and navigate to them instantly from anywhere.

---

## Installation

### Method 1: Install from VSIX (Recommended for now)

1. **Download the extension**
   - Go to [Releases](https://github.com/rohangore1999/code-jump/releases)
   - Download `codejump-navigator-1.2.0.vsix`

2. **Install in VS Code or Cursor**
   - Open VS Code or Cursor
   - Go to Extensions (`Cmd+Shift+X` or `Ctrl+Shift+X`)
   - Click the `...` menu (three dots at top-right)
   - Select **"Install from VSIX..."**
   - Choose the downloaded `codejump-navigator-1.2.0.vsix` file
   - Restart the editor if prompted

3. **Verify installation**
   - You should see "CodeJump ⚡" in your extensions list
   - Try the shortcuts: `Cmd+Shift+C` (copy) and `Cmd+Shift+V` (navigate)

### Method 2: VS Code Marketplace (Coming Soon)
Extension will be available on VS Code Marketplace soon!

---

## Features

### 1. Copy Code Reference
- Select code in editor
- Copy as formatted reference: `@filename (startLine-endLine)`
- Works with single lines: `@filename (42)`
- Works with line ranges: `@filename (10-20)`
- Uses workspace-relative paths for cross-machine compatibility

### 2. Navigate to Reference
- Paste reference anywhere (chat, docs, notes)
- Navigate instantly to the code
- Automatic file opening and line highlighting
- Yellow highlight persists until cursor moves

### 3. Smart Context Menu
- **Copy**: Only appears when text is selected
- **Navigate**: Only appears when clipboard has valid reference
- Both menus use consistent "CodeJump:" branding

### 4. Status Bar Indicator
- Shows current clipboard reference in status bar (bottom-right)
- Format: `🔗 @filename (lines)`
- Click to navigate instantly
- Auto-updates every 500ms
- Hides when no valid reference

### 5. Keyboard Shortcuts
- **Copy**: `Cmd+Shift+C` (Mac) / `Ctrl+Shift+C` (Win/Linux)
- **Navigate**: `Cmd+Shift+V` (Mac) / `Ctrl+Shift+V` (Win/Linux)

---

## How It Works

### Architecture

```
User Action → Extension → Parser → File Resolver → Navigation → Highlight
```

### Core Components

#### 1. Extension Entry Point (`src/extension.js`)
- Registers commands and event listeners
- Monitors clipboard changes every 500ms
- Updates context variables for menu visibility
- Manages status bar display

#### 2. Copy Command (`src/commands/copyReference.js`)
**Flow:**
```
1. Get active editor and selection
2. Calculate workspace-relative file path
3. Get line numbers (start and end)
4. Format: @{path} ({start}-{end})
5. Copy to clipboard
6. Show notification
7. Update clipboard monitor
```

**Example:**
```javascript
// User selects lines 10-20 in src/utils/helper.js
// Output: @src/utils/helper.js (10-20)
```

#### 3. Navigate Command (`src/commands/navigateReference.js`)
**Flow:**
```
1. Read clipboard text
2. Parse reference using regex
3. Find file in workspace
4. Open document
5. Create selection range
6. Scroll to center view
7. Apply yellow highlight decoration
8. Set up auto-clear on cursor move
```

**Example:**
```javascript
// Clipboard: @src/utils/helper.js (10-20)
// Result: Opens file, highlights lines 10-20 in yellow
```

#### 4. Reference Parser (`src/utils/parser.js`)
**Pattern:** `/@([^\s(]+)\s*\((\d+)(?:-(\d+))?\)/`

**Matches:**
- `@test.js (42)` → Single line
- `@test.js (10-20)` → Line range
- `@src/path/file.js (100-150)` → Nested paths

**Returns:**
```javascript
{
  fileName: "src/path/file.js",
  startLine: 100,
  endLine: 150
}
```

#### 5. File Resolver (`src/utils/fileResolver.js`)
**Strategy:**
```
1. Try exact workspace-relative path
2. If not found, search all workspace folders
3. Use VS Code's findFiles API with pattern
4. Return first match (or null if not found)
```

#### 6. Clipboard Monitor (`src/utils/clipboardMonitor.js`)
**Function:**
- Checks clipboard every 500ms when window focused
- Parses clipboard text for valid reference
- Updates VS Code context: `codeJump.hasValidReference`
- Returns truncated preview (max 50 chars)

**Context Update:**
```javascript
// Valid reference found
setContext('codeJump.hasValidReference', true)
→ Context menu "Navigate" appears

// No valid reference
setContext('codeJump.hasValidReference', false)
→ Context menu "Navigate" hidden
```

#### 7. Status Bar (`src/utils/statusBar.js`)
**Function:**
- Creates status bar item (right-aligned)
- Updates text with clipboard reference
- Truncates to 40 characters if too long
- Shows link icon: `🔗 @filename (lines)`
- Clicking triggers navigate command
- Automatically hides when no valid reference

---

## Clipboard Monitoring System

### How It Works

**Periodic Check:**
```javascript
// Every 500ms when window is focused
setInterval(() => {
  if (window.focused) {
    checkClipboard()
    updateContextMenu()
    updateStatusBar()
  }
}, 500)
```

**Context Menu Visibility:**
```
Clipboard State → Parser → Context Variable → Menu Visibility

Empty             → null    → false         → Hidden
"random text"     → null    → false         → Hidden
@test.js (3-5)    → valid   → true          → Visible ✅
```

**Event Triggers:**
- Window focus change
- Text editor selection change
- Copy command execution
- 500ms interval timer

---

## Reference Format

### Pattern Structure
```
@{filename} ({line})           // Single line
@{filename} ({start}-{end})    // Line range
```

### Examples
```
@test.js (42)
@test.js (10-20)
@src/utils/helper.js (100-150)
@components/Button.tsx (23-45)
```

### Regex Explanation
```javascript
/@([^\s(]+)\s*\((\d+)(?:-(\d+))?\)/

@               // Literal @ symbol
([^\s(]+)       // Filename: any chars except space or (
\s*             // Optional whitespace
\(              // Opening parenthesis
(\d+)           // Start line: one or more digits
(?:-(\d+))?     // Optional: dash and end line
\)              // Closing parenthesis
```

---

## Highlight System

### Decoration Type
```javascript
{
  backgroundColor: 'rgba(255, 200, 0, 0.3)',  // Yellow, 30% opacity
  isWholeLine: true,                          // Highlight entire line
  overviewRulerColor: 'rgba(255, 200, 0, 0.8)', // Scrollbar indicator
  overviewRulerLane: Center                   // Center of scrollbar
}
```

### Lifecycle
```
Navigate → Apply Decoration → User Moves Cursor → Clear Decoration

1. Create decoration on navigate
2. Apply to line range
3. Listen for cursor movement
4. Clear decoration on movement
5. Dispose event listener
```

