// Application state
let currentCollection = {
    title: 'My Story',
    chapters: [
        { id: 1, title: 'Chapter 1', content: '' }
    ],
    currentChapterIndex: 0,
    path: null,
    modified: false
};

let currentFile = {
    path: null,
    name: 'Untitled',
    content: '',
    modified: false
};

let fontSize = 16;
let isDarkMode = false;
let isCollectionMode = true;
let sidebarCollapsed = false;

// DOM elements
const editor = document.getElementById('editor');
const fileNameDisplay = document.getElementById('file-name');
const fileStatus = document.getElementById('file-status');
const wordCount = document.getElementById('word-count');
const charCount = document.getElementById('char-count');
const lineCol = document.getElementById('line-col');
const fontSizeDisplay = document.getElementById('font-size-display');

// Chapters elements
const sidebar = document.getElementById('chapters-sidebar');
const chaptersList = document.getElementById('chapters-list');
const collectionTitleInput = document.getElementById('collection-title');
const currentChapterTitleInput = document.getElementById('current-chapter-title');
const addChapterBtn = document.getElementById('add-chapter-btn');
const exportCollectionBtn = document.getElementById('export-collection-btn');
const toggleSidebarBtn = document.getElementById('toggle-sidebar');
const toggleChaptersBtn = document.getElementById('toggle-chapters-btn');

// Button elements
const newCollectionBtn = document.getElementById('new-collection-btn');
const openCollectionBtn = document.getElementById('open-collection-btn');
const saveCollectionBtn = document.getElementById('save-collection-btn');
const newBtn = document.getElementById('new-btn');
const openBtn = document.getElementById('open-btn');
const saveBtn = document.getElementById('save-btn');
const darkModeBtn = document.getElementById('dark-mode-btn');
const fontSmallerBtn = document.getElementById('font-smaller');
const fontLargerBtn = document.getElementById('font-larger');

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
    setupMenuListeners();
});

function initializeApp() {
    // Load saved preferences
    const savedTheme = localStorage.getItem('theme');
    const savedFontSize = localStorage.getItem('fontSize');
    
    if (savedTheme === 'dark') {
        toggleDarkMode();
    }
    
    if (savedFontSize) {
        fontSize = parseInt(savedFontSize);
        updateFontSize();
    }
    
    // Initialize in collection mode
    switchToCollectionMode();
    loadCurrentChapter();
}

function setupEventListeners() {
    // Editor events
    editor.addEventListener('input', handleEditorInput);
    editor.addEventListener('keyup', updateCursorPosition);
    editor.addEventListener('click', updateCursorPosition);
    editor.addEventListener('scroll', updateCursorPosition);
    
    // Collection events
    collectionTitleInput.addEventListener('input', handleCollectionTitleChange);
    currentChapterTitleInput.addEventListener('input', handleChapterTitleChange);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboard);
    
    // Collection button events
    newCollectionBtn.addEventListener('click', newCollection);
    openCollectionBtn.addEventListener('click', openCollection);
    saveCollectionBtn.addEventListener('click', saveCollection);
    addChapterBtn.addEventListener('click', addChapter);
    exportCollectionBtn.addEventListener('click', exportCollection);
    toggleSidebarBtn.addEventListener('click', toggleSidebar);
    toggleChaptersBtn.addEventListener('click', toggleSidebar);
    
    // Single file button events
    newBtn.addEventListener('click', () => switchToSingleFileMode(true));
    openBtn.addEventListener('click', () => switchToSingleFileMode(false));
    saveBtn.addEventListener('click', () => {
        if (isCollectionMode) {
            saveCollection();
        } else {
            saveFile();
        }
    });
    
    // UI controls
    darkModeBtn.addEventListener('click', toggleDarkMode);
    fontSmallerBtn.addEventListener('click', decreaseFontSize);
    fontLargerBtn.addEventListener('click', increaseFontSize);
    
    // Prevent default drag and drop
    document.addEventListener('dragover', e => e.preventDefault());
    document.addEventListener('drop', e => e.preventDefault());
}

function setupMenuListeners() {
    // Menu event listeners
    window.electronAPI.onNewFile(() => newFile());
    window.electronAPI.onOpenFile((event, fileData) => openFile(fileData));
    window.electronAPI.onSaveFile(() => saveFile());
    window.electronAPI.onSaveAsFile(() => saveAsFile());
    window.electronAPI.onToggleDarkMode(() => toggleDarkMode());
    window.electronAPI.onIncreaseFont(() => increaseFontSize());
    window.electronAPI.onDecreaseFont(() => decreaseFontSize());
    window.electronAPI.onResetFont(() => resetFontSize());
}

function handleEditorInput() {
    if (isCollectionMode) {
        const currentChapter = currentCollection.chapters[currentCollection.currentChapterIndex];
        if (currentChapter) {
            currentChapter.content = editor.value;
            currentCollection.modified = true;
        }
    } else {
        currentFile.content = editor.value;
        currentFile.modified = true;
    }
    updateUI();
    updateWordCount();
}

function handleCollectionTitleChange() {
    currentCollection.title = collectionTitleInput.value;
    currentCollection.modified = true;
    updateUI();
}

function handleChapterTitleChange() {
    const currentChapter = currentCollection.chapters[currentCollection.currentChapterIndex];
    if (currentChapter) {
        currentChapter.title = currentChapterTitleInput.value;
        currentCollection.modified = true;
        renderChaptersList();
        updateUI();
    }
}

function newCollection() {
    if (currentCollection.modified) {
        const proceed = confirm('You have unsaved changes. Are you sure you want to create a new collection?');
        if (!proceed) return;
    }
    
    currentCollection = {
        title: 'My Story',
        chapters: [
            { id: 1, title: 'Chapter 1', content: '' }
        ],
        currentChapterIndex: 0,
        path: null,
        modified: false
    };
    
    isCollectionMode = true;
    switchToCollectionMode();
    loadCurrentChapter();
}

async function openCollection() {
    if (currentCollection.modified) {
        const proceed = confirm('You have unsaved changes. Are you sure you want to open a collection?');
        if (!proceed) return;
    }
    
    try {
        const result = await window.electronAPI.openCollection();
        if (result.success) {
            currentCollection = result.collection;
            currentCollection.path = result.path;
            currentCollection.modified = false;
            currentCollection.currentChapterIndex = 0;
            
            isCollectionMode = true;
            switchToCollectionMode();
            loadCurrentChapter();
        }
    } catch (error) {
        alert(`Error opening collection: ${error.message}`);
    }
}

async function saveCollection() {
    try {
        const result = await window.electronAPI.saveCollection(currentCollection);
        if (result.success) {
            currentCollection.path = result.path;
            currentCollection.modified = false;
            updateUI();
        }
    } catch (error) {
        alert(`Error saving collection: ${error.message}`);
    }
}

async function exportCollection() {
    try {
        const result = await window.electronAPI.exportCollection({
            collection: currentCollection
        });
        
        if (result.success) {
            alert(`Collection exported successfully to:\n${result.path}`);
        } else {
            alert('Export cancelled or failed');
        }
    } catch (error) {
        alert(`Error exporting collection: ${error.message}`);
    }
}

function addChapter() {
    const newChapterId = Math.max(...currentCollection.chapters.map(c => c.id)) + 1;
    const newChapter = {
        id: newChapterId,
        title: `Chapter ${newChapterId}`,
        content: ''
    };
    
    currentCollection.chapters.push(newChapter);
    currentCollection.modified = true;
    renderChaptersList();
    switchToChapter(currentCollection.chapters.length - 1);
}

function deleteChapter(index) {
    if (currentCollection.chapters.length === 1) {
        alert('Cannot delete the last chapter. A collection must have at least one chapter.');
        return;
    }
    
    const chapter = currentCollection.chapters[index];
    const proceed = confirm(`Are you sure you want to delete "${chapter.title}"?`);
    if (!proceed) return;
    
    currentCollection.chapters.splice(index, 1);
    currentCollection.modified = true;
    
    // Adjust current chapter index if necessary
    if (currentCollection.currentChapterIndex >= currentCollection.chapters.length) {
        currentCollection.currentChapterIndex = currentCollection.chapters.length - 1;
    } else if (currentCollection.currentChapterIndex > index) {
        currentCollection.currentChapterIndex--;
    }
    
    renderChaptersList();
    loadCurrentChapter();
}

function switchToChapter(index) {
    // Save current chapter content first
    if (currentCollection.currentChapterIndex >= 0 && currentCollection.chapters[currentCollection.currentChapterIndex]) {
        currentCollection.chapters[currentCollection.currentChapterIndex].content = editor.value;
    }
    
    currentCollection.currentChapterIndex = index;
    loadCurrentChapter();
    renderChaptersList();
}

function loadCurrentChapter() {
    const currentChapter = currentCollection.chapters[currentCollection.currentChapterIndex];
    if (currentChapter) {
        editor.value = currentChapter.content;
        currentChapterTitleInput.value = currentChapter.title;
        collectionTitleInput.value = currentCollection.title;
        updateWordCount();
        updateUI();
        editor.focus();
    }
}

function renderChaptersList() {
    chaptersList.innerHTML = '';
    
    currentCollection.chapters.forEach((chapter, index) => {
        const chapterItem = document.createElement('div');
        chapterItem.className = `chapter-item ${index === currentCollection.currentChapterIndex ? 'active' : ''}`;
        chapterItem.innerHTML = `
            <span class="chapter-number">${index + 1}.</span>
            <span class="chapter-title">${chapter.title || `Chapter ${index + 1}`}</span>
            <div class="chapter-actions">
                <button class="chapter-action-btn" onclick="deleteChapter(${index})" title="Delete Chapter">🗑️</button>
            </div>
        `;
        
        chapterItem.addEventListener('click', (e) => {
            if (!e.target.classList.contains('chapter-action-btn')) {
                switchToChapter(index);
            }
        });
        
        chaptersList.appendChild(chapterItem);
    });
}

function switchToCollectionMode() {
    isCollectionMode = true;
    sidebar.style.display = 'flex';
    document.querySelector('.chapter-header').style.display = 'block';
    renderChaptersList();
    updateUI();
}

function switchToSingleFileMode(isNew = true) {
    if (isCollectionMode && currentCollection.modified) {
        const proceed = confirm('You have unsaved changes in your collection. Are you sure you want to switch to single file mode?');
        if (!proceed) return;
    }
    
    isCollectionMode = false;
    sidebar.style.display = 'none';
    document.querySelector('.chapter-header').style.display = 'none';
    
    if (isNew) {
        newFile();
    } else {
        // This will be handled by the existing open file functionality
        openFile();
    }
}

function toggleSidebar() {
    sidebarCollapsed = !sidebarCollapsed;
    sidebar.classList.toggle('collapsed', sidebarCollapsed);
    
    // Update both toggle buttons
    const buttonText = sidebarCollapsed ? '📖' : '📕';
    toggleSidebarBtn.textContent = buttonText;
    toggleChaptersBtn.textContent = buttonText;
    
    // Update button titles
    const titleText = sidebarCollapsed ? 'Show Chapters Panel' : 'Hide Chapters Panel';
    toggleSidebarBtn.title = titleText;
    toggleChaptersBtn.title = titleText;
}

function handleKeyboard(e) {
    // Handle common keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
            case 'n':
                e.preventDefault();
                newFile();
                break;
            case 's':
                e.preventDefault();
                if (e.shiftKey) {
                    saveAsFile();
                } else {
                    saveFile();
                }
                break;
            case 'd':
                e.preventDefault();
                toggleDarkMode();
                break;
            case '=':
            case '+':
                e.preventDefault();
                increaseFontSize();
                break;
            case '-':
                e.preventDefault();
                decreaseFontSize();
                break;
            case '0':
                e.preventDefault();
                resetFontSize();
                break;
        }
    }
}

function newFile() {
    if (currentFile.modified) {
        const proceed = confirm('You have unsaved changes. Are you sure you want to create a new file?');
        if (!proceed) return;
    }
    
    currentFile = {
        path: null,
        name: 'Untitled',
        content: '',
        modified: false
    };
    
    editor.value = '';
    updateUI();
    updateWordCount();
    editor.focus();
}

function openFile(fileData = null) {
    if (!fileData) {
        // This will be handled by the menu system
        return;
    }
    
    if (currentFile.modified) {
        const proceed = confirm('You have unsaved changes. Are you sure you want to open a new file?');
        if (!proceed) return;
    }
    
    currentFile = {
        path: fileData.path,
        name: fileData.name,
        content: fileData.content,
        modified: false
    };
    
    editor.value = fileData.content;
    updateUI();
    updateWordCount();
    editor.focus();
}

async function saveFile() {
    try {
        const result = await window.electronAPI.saveFile({
            path: currentFile.path,
            content: editor.value
        });
        
        if (result.success) {
            currentFile.path = result.path;
            currentFile.name = result.path.split(/[\\\/]/).pop();
            currentFile.modified = false;
            updateUI();
        } else if (result.error) {
            alert(`Error saving file: ${result.error}`);
        }
    } catch (error) {
        alert(`Error saving file: ${error.message}`);
    }
}

async function saveAsFile() {
    try {
        const result = await window.electronAPI.saveFile({
            path: null, // Force save dialog
            content: editor.value
        });
        
        if (result.success) {
            currentFile.path = result.path;
            currentFile.name = result.path.split(/[\\\/]/).pop();
            currentFile.modified = false;
            updateUI();
        } else if (result.error) {
            alert(`Error saving file: ${result.error}`);
        }
    } catch (error) {
        alert(`Error saving file: ${error.message}`);
    }
}

function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    document.body.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    
    // Update button text
    darkModeBtn.textContent = isDarkMode ? '☀️' : '🌓';
}

function increaseFontSize() {
    if (fontSize < 32) {
        fontSize += 2;
        updateFontSize();
    }
}

function decreaseFontSize() {
    if (fontSize > 8) {
        fontSize -= 2;
        updateFontSize();
    }
}

function resetFontSize() {
    fontSize = 16;
    updateFontSize();
}

function updateFontSize() {
    editor.style.fontSize = fontSize + 'px';
    fontSizeDisplay.textContent = fontSize + 'px';
    localStorage.setItem('fontSize', fontSize.toString());
}

function updateUI() {
    if (isCollectionMode) {
        // Update collection display
        fileNameDisplay.textContent = currentCollection.title;
        
        // Update status
        if (currentCollection.modified) {
            fileStatus.textContent = '• Modified';
        } else if (currentCollection.path) {
            fileStatus.textContent = 'Saved';
        } else {
            fileStatus.textContent = '';
        }
        
        // Update window title
        const currentChapter = currentCollection.chapters[currentCollection.currentChapterIndex];
        const chapterName = currentChapter ? currentChapter.title : 'No Chapter';
        const title = `${chapterName} - ${currentCollection.title}${currentCollection.modified ? ' •' : ''} - TextEditor Blink`;
        document.title = title;
    } else {
        // Update single file display
        fileNameDisplay.textContent = currentFile.name;
        
        // Update file status
        if (currentFile.modified) {
            fileStatus.textContent = '• Modified';
        } else if (currentFile.path) {
            fileStatus.textContent = 'Saved';
        } else {
            fileStatus.textContent = '';
        }
        
        // Update window title
        const title = `${currentFile.name}${currentFile.modified ? ' •' : ''} - TextEditor Blink`;
        document.title = title;
    }
}

function updateWordCount() {
    const text = editor.value;
    const words = text.trim() ? text.trim().split(/\\s+/).length : 0;
    const characters = text.length;
    
    wordCount.textContent = `Words: ${words}`;
    charCount.textContent = `Characters: ${characters}`;
}

function updateCursorPosition() {
    const textarea = editor;
    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = textarea.value.substring(0, cursorPos);
    const lines = textBeforeCursor.split('\\n');
    const currentLine = lines.length;
    const currentColumn = lines[lines.length - 1].length + 1;
    
    lineCol.textContent = `Line ${currentLine}, Column ${currentColumn}`;
}

// Auto-save functionality (optional)
setInterval(() => {
    if (isCollectionMode) {
        if (currentCollection.modified) {
            // Auto-save current chapter content
            const currentChapter = currentCollection.chapters[currentCollection.currentChapterIndex];
            if (currentChapter) {
                currentChapter.content = editor.value;
            }
            localStorage.setItem('autoSaveCollection', JSON.stringify({
                collection: currentCollection,
                timestamp: Date.now()
            }));
        }
    } else {
        if (currentFile.modified && currentFile.path) {
            // Auto-save to temporary file or localStorage
            localStorage.setItem('autoSave', JSON.stringify({
                content: editor.value,
                timestamp: Date.now()
            }));
        }
    }
}, 30000); // Auto-save every 30 seconds

// Make functions globally accessible for inline event handlers
window.deleteChapter = deleteChapter;

// Recovery on startup
window.addEventListener('load', () => {
    const autoSave = localStorage.getItem('autoSave');
    if (autoSave && (!isCollectionMode && !currentFile.content)) {
        try {
            const data = JSON.parse(autoSave);
            const timeDiff = Date.now() - data.timestamp;
            
            // If auto-save is less than 1 hour old, offer recovery
            if (timeDiff < 3600000) {
                const recover = confirm('A recent auto-save was found. Would you like to recover your work?');
                if (recover) {
                    if (isCollectionMode) {
                        const currentChapter = currentCollection.chapters[currentCollection.currentChapterIndex];
                        if (currentChapter) {
                            currentChapter.content = data.content;
                            editor.value = data.content;
                            currentCollection.modified = true;
                        }
                    } else {
                        editor.value = data.content;
                        currentFile.content = data.content;
                        currentFile.modified = true;
                    }
                    updateUI();
                    updateWordCount();
                }
            }
        } catch (e) {
            console.error('Error recovering auto-save:', e);
        }
    }
});