const { app, BrowserWindow, Menu, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const stringSimilarity = require('string-similarity');

let mainWindow;
let userDictionaryPath = null;
let englishWords = null;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 600,
    minHeight: 400,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
      spellcheck: true
    },
    icon: path.join(__dirname, '../assets/icon.png'),
    show: false
  });

  // Load the index.html of the app
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Enable spell checker context menu
  mainWindow.webContents.on('context-menu', (event, params) => {
    const { selectionText, misspelledWord, dictionarySuggestions = [] } = params;

    if (misspelledWord) {
      // Get better suggestions using fuzzy match against an English word list
      let better = [];
      try {
        if (englishWords && englishWords.length) {
          const lower = String(misspelledWord).toLowerCase();
          const len = lower.length;
          // Pre-filter to words of similar length and same starting letter to keep it fast
          const subset = englishWords.filter(w => {
            const wl = w.length;
            if (wl < 2) return false;
            if (Math.abs(wl - len) > 3) return false;
            if (w[0].toLowerCase() !== lower[0]) return false;
            return true;
          }).slice(0, 8000);

          if (subset.length) {
            const result = stringSimilarity.findBestMatch(misspelledWord, subset);
            better = result.ratings
              .sort((a, b) => b.rating - a.rating)
              .slice(0, 7)
              .map(r => r.target);
          }
        }
      } catch (_) {}

      // Merge and de-duplicate suggestions, prefer our list first
      const merged = Array.from(new Set([...(better || []), ...dictionarySuggestions]))
        .filter(s => s && s.toLowerCase() !== (misspelledWord || '').toLowerCase())
        .slice(0, 7);

      const menu = Menu.buildFromTemplate([
        // Suggestion entries
        ...(merged.length ? merged : ["No suggestions"]).map(suggestion => ({
          label: suggestion,
          enabled: suggestion !== "No suggestions",
          click: () => mainWindow.webContents.replaceMisspelling(suggestion)
        })),
        { type: 'separator' },
        {
          label: 'Add to Dictionary',
          click: () => addWordToUserDictionary(misspelledWord)
        },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { type: 'separator' },
        { role: 'selectAll' }
      ]);
      menu.popup();
    } else if (selectionText || params.isEditable) {
      // Regular context menu for editable fields
      const menu = Menu.buildFromTemplate([
        { role: 'cut', enabled: selectionText && selectionText.length > 0 },
        { role: 'copy', enabled: selectionText && selectionText.length > 0 },
        { role: 'paste' },
        { type: 'separator' },
        { role: 'selectAll' }
      ]);
      menu.popup();
    }
  });

  // Open DevTools in development mode
  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }

  // Create application menu
  createMenu();
}

function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.send('menu-new-file');
          }
        },
        {
          label: 'Open',
          accelerator: 'CmdOrCtrl+O',
          click: async () => {
            const result = await dialog.showOpenDialog(mainWindow, {
              properties: ['openFile'],
              filters: [
                { name: 'Text Files', extensions: ['txt', 'md', 'rtf'] },
                { name: 'All Files', extensions: ['*'] }
              ]
            });

            if (!result.canceled && result.filePaths.length > 0) {
              const filePath = result.filePaths[0];
              try {
                const content = fs.readFileSync(filePath, 'utf8');
                mainWindow.webContents.send('menu-open-file', {
                  path: filePath,
                  content: content,
                  name: path.basename(filePath)
                });
              } catch (error) {
                dialog.showErrorBox('Error', `Could not open file: ${error.message}`);
              }
            }
          }
        },
        {
          label: 'Save',
          accelerator: 'CmdOrCtrl+S',
          click: () => {
            mainWindow.webContents.send('menu-save-file');
          }
        },
        {
          label: 'Save As',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => {
            mainWindow.webContents.send('menu-save-as-file');
          }
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectall' }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Toggle Dark Mode',
          accelerator: 'CmdOrCtrl+D',
          click: () => {
            mainWindow.webContents.send('menu-toggle-dark-mode');
          }
        },
        { type: 'separator' },
        {
          label: 'Increase Font Size',
          accelerator: 'CmdOrCtrl+Plus',
          click: () => {
            mainWindow.webContents.send('menu-increase-font');
          }
        },
        {
          label: 'Decrease Font Size',
          accelerator: 'CmdOrCtrl+-',
          click: () => {
            mainWindow.webContents.send('menu-decrease-font');
          }
        },
        {
          label: 'Reset Font Size',
          accelerator: 'CmdOrCtrl+0',
          click: () => {
            mainWindow.webContents.send('menu-reset-font');
          }
        },
        { type: 'separator' },
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Handle file save requests from renderer
ipcMain.handle('save-file', async (event, { path: filePath, content }) => {
  try {
    if (filePath) {
      fs.writeFileSync(filePath, content, 'utf8');
      return { success: true, path: filePath };
    } else {
      const result = await dialog.showSaveDialog(mainWindow, {
        filters: [
          { name: 'Text Files', extensions: ['txt'] },
          { name: 'Markdown Files', extensions: ['md'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      });

      if (!result.canceled && result.filePath) {
        fs.writeFileSync(result.filePath, content, 'utf8');
        return { success: true, path: result.filePath };
      }
    }
    return { success: false };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Handle collection save requests
ipcMain.handle('save-collection', async (event, collection) => {
  try {
    const result = await dialog.showSaveDialog(mainWindow, {
      properties: ['createDirectory'],
      filters: [
        { name: 'Story Collection', extensions: ['json'] }
      ]
    });

    if (!result.canceled && result.filePath) {
      fs.writeFileSync(result.filePath, JSON.stringify(collection, null, 2), 'utf8');
      return { success: true, path: result.filePath };
    }
    return { success: false };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Handle collection export (create folder with chapters)
ipcMain.handle('export-collection', async (event, { collection, exportPath }) => {
  try {
    let targetDir = exportPath;
    
    if (!targetDir) {
      const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory', 'createDirectory'],
        title: 'Select Export Location'
      });

      if (result.canceled || !result.filePaths.length) {
        return { success: false };
      }
      targetDir = result.filePaths[0];
    }

    // Create collection folder
    const collectionDir = path.join(targetDir, collection.title.replace(/[<>:"/\\|?*]/g, '_'));
    if (!fs.existsSync(collectionDir)) {
      fs.mkdirSync(collectionDir, { recursive: true });
    }

    // Save collection metadata
    const metadataPath = path.join(collectionDir, '_collection.json');
    fs.writeFileSync(metadataPath, JSON.stringify(collection, null, 2), 'utf8');

    // Export each chapter
    for (let i = 0; i < collection.chapters.length; i++) {
      const chapter = collection.chapters[i];
      const chapterFileName = `${String(i + 1).padStart(2, '0')}_${chapter.title.replace(/[<>:"/\\|?*]/g, '_')}.txt`;
      const chapterPath = path.join(collectionDir, chapterFileName);
      
      let chapterContent = `# ${chapter.title}\n\n${chapter.content}`;
      fs.writeFileSync(chapterPath, chapterContent, 'utf8');
    }

    return { success: true, path: collectionDir };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Handle collection open requests
ipcMain.handle('open-collection', async (event) => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      filters: [
        { name: 'Story Collection', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });

    if (!result.canceled && result.filePaths.length > 0) {
      const filePath = result.filePaths[0];
      const content = fs.readFileSync(filePath, 'utf8');
      const collection = JSON.parse(content);
      return { success: true, collection, path: filePath };
    }
    return { success: false };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// App event handlers
app.whenReady().then(() => {
  // Prepare user dictionary path and load spell resources
  try {
    userDictionaryPath = path.join(app.getPath('userData'), 'user-dictionary.txt');
  } catch (_) {}

  loadWordList();

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

async function loadWordList() {
  try {
    // word-list is an async module that resolves to a file path
    const wordList = await import('word-list');
    const wordListPath = wordList.default;
    const data = fs.readFileSync(wordListPath, 'utf8');
    // Keep a reasonably sized list in memory
    englishWords = data.split(/\r?\n/).filter(Boolean);
    console.log(`Loaded ${englishWords.length} words for spell checking`);
  } catch (e) {
    console.warn('Could not load word list:', e.message);
  }
}

function addWordToUserDictionary(word) {
  if (!word || !word.trim()) return;
  try {
    // Add to Electron spell checker session
    try { mainWindow?.webContents?.session?.addWordToSpellCheckerDictionary(word); } catch (_) {}

    // Persist to user dictionary file
    if (userDictionaryPath) {
      const exists = fs.existsSync(userDictionaryPath);
      fs.appendFileSync(userDictionaryPath, (exists ? '\n' : '') + word.trim(), 'utf8');
    }
  } catch (e) {
    console.warn('Failed to persist user dictionary word:', e.message);
  }
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});