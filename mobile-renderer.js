// Mobile-optimized renderer - uses localStorage instead of file system
class MobileTextEditor {
    constructor() {
        this.currentChapterId = null;
        this.chapters = [];
        this.collectionTitle = '';
        this.isCollectionMode = true;
        this.autoSaveInterval = null;
        this.sidebarOpen = false;
        
        this.initializeApp();
        this.loadFromStorage();
        this.setupEventListeners();
        this.startAutoSave();
        this.updateStats();
    }

    initializeApp() {
        // Initialize dark mode
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.body.className = savedTheme === 'dark' ? 'dark-mode' : '';
        
        // Initialize text size
        const savedTextSize = localStorage.getItem('textSize') || '14';
        const textSizeSlider = document.getElementById('textSize');
        const textEditor = document.getElementById('textEditor');
        textSizeSlider.value = savedTextSize;
        textEditor.style.fontSize = savedTextSize + 'px';
        document.getElementById('textSizeValue').textContent = savedTextSize + 'px';
        
        // Set initial mode
        this.toggleMode(this.isCollectionMode);
    }

    setupEventListeners() {
        // Sidebar toggle
        document.getElementById('toggleSidebar').addEventListener('click', () => {
            this.toggleSidebar();
        });

        // Dark mode toggle
        document.getElementById('darkModeToggle').addEventListener('click', () => {
            this.toggleDarkMode();
        });

        // Collection mode toggle
        document.getElementById('collectionModeToggle').addEventListener('click', () => {
            this.toggleMode(!this.isCollectionMode);
        });

        // Text size control
        document.getElementById('textSize').addEventListener('input', (e) => {
            this.changeTextSize(e.target.value);
        });

        // Collection controls
        document.getElementById('saveCollection').addEventListener('click', () => {
            this.saveCollection();
        });

        document.getElementById('newCollection').addEventListener('click', () => {
            this.newCollection();
        });

        document.getElementById('loadCollection').addEventListener('click', () => {
            this.showLoadCollectionDialog();
        });

        document.getElementById('exportCollection').addEventListener('click', () => {
            this.exportCollection();
        });

        // Single file controls
        document.getElementById('newFile').addEventListener('click', () => {
            this.newFile();
        });

        document.getElementById('saveFile').addEventListener('click', () => {
            this.saveFile();
        });

        document.getElementById('loadFile').addEventListener('click', () => {
            this.loadFile();
        });

        // Chapter controls
        document.getElementById('addChapter').addEventListener('click', () => {
            this.addChapter();
        });

        // Editor events
        document.getElementById('textEditor').addEventListener('input', () => {
            this.updateStats();
            this.markAsModified();
        });

        document.getElementById('chapterTitle').addEventListener('input', (e) => {
            if (this.currentChapterId) {
                const chapter = this.chapters.find(c => c.id === this.currentChapterId);
                if (chapter) {
                    chapter.title = e.target.value;
                    this.updateChaptersList();
                    this.markAsModified();
                }
            }
        });

        document.getElementById('collectionTitle').addEventListener('input', (e) => {
            this.collectionTitle = e.target.value;
            this.markAsModified();
        });

        // Handle clicks outside sidebar to close it on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768 && this.sidebarOpen) {
                const sidebar = document.getElementById('sidebar');
                const toggleBtn = document.getElementById('toggleSidebar');
                if (!sidebar.contains(e.target) && !toggleBtn.contains(e.target)) {
                    this.toggleSidebar();
                }
            }
        });
    }

    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        this.sidebarOpen = !this.sidebarOpen;
        
        if (this.sidebarOpen) {
            sidebar.classList.add('open');
        } else {
            sidebar.classList.remove('open');
        }
    }

    toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        
        // Update button text
        document.getElementById('darkModeToggle').textContent = isDark ? '☀️' : '🌙';
    }

    toggleMode(collectionMode) {
        this.isCollectionMode = collectionMode;
        
        const collectionControls = document.getElementById('collectionControls');
        const singleFileControls = document.getElementById('singleFileControls');
        const chaptersSection = document.querySelector('.chapters-section');
        const collectionsSection = document.querySelector('.collections-section');
        const modeToggleBtn = document.getElementById('collectionModeToggle');
        
        if (collectionMode) {
            collectionControls.style.display = 'block';
            singleFileControls.style.display = 'none';
            chaptersSection.style.display = 'block';
            collectionsSection.style.display = 'block';
            modeToggleBtn.textContent = '📄 Single File';
            
            if (this.chapters.length === 0) {
                this.addChapter();
            }
        } else {
            collectionControls.style.display = 'none';
            singleFileControls.style.display = 'block';
            chaptersSection.style.display = 'none';
            collectionsSection.style.display = 'none';
            modeToggleBtn.textContent = '📚 Collections';
            
            // Clear chapter-specific UI
            document.getElementById('chapterTitle').style.display = 'none';
        }
        
        localStorage.setItem('isCollectionMode', collectionMode);
    }

    changeTextSize(size) {
        const textEditor = document.getElementById('textEditor');
        textEditor.style.fontSize = size + 'px';
        document.getElementById('textSizeValue').textContent = size + 'px';
        localStorage.setItem('textSize', size);
    }

    addChapter() {
        const newChapter = {
            id: Date.now(),
            title: `Chapter ${this.chapters.length + 1}`,
            content: ''
        };
        
        this.chapters.push(newChapter);
        this.updateChaptersList();
        this.selectChapter(newChapter.id);
        this.markAsModified();
    }

    selectChapter(chapterId) {
        // Save current chapter content
        if (this.currentChapterId) {
            const currentChapter = this.chapters.find(c => c.id === this.currentChapterId);
            if (currentChapter) {
                currentChapter.content = document.getElementById('textEditor').value;
            }
        }
        
        // Load new chapter
        const chapter = this.chapters.find(c => c.id === chapterId);
        if (chapter) {
            this.currentChapterId = chapterId;
            document.getElementById('textEditor').value = chapter.content;
            document.getElementById('chapterTitle').value = chapter.title;
            document.getElementById('chapterTitle').style.display = 'block';
            
            // Update active state in UI
            document.querySelectorAll('.chapter-item').forEach(item => {
                item.classList.remove('active');
            });
            document.querySelector(`[data-chapter-id="${chapterId}"]`).classList.add('active');
            
            this.updateStats();
        }
    }

    updateChaptersList() {
        const chaptersList = document.getElementById('chaptersList');
        chaptersList.innerHTML = '';
        
        this.chapters.forEach(chapter => {
            const chapterElement = document.createElement('div');
            chapterElement.className = 'chapter-item';
            chapterElement.setAttribute('data-chapter-id', chapter.id);
            chapterElement.innerHTML = `
                <span class="chapter-title">${chapter.title}</span>
                <button class="delete-chapter" onclick="mobileEditor.deleteChapter(${chapter.id})">×</button>
            `;
            
            chapterElement.addEventListener('click', (e) => {
                if (!e.target.classList.contains('delete-chapter')) {
                    this.selectChapter(chapter.id);
                }
            });
            
            chaptersList.appendChild(chapterElement);
        });
    }

    deleteChapter(chapterId) {
        if (this.chapters.length <= 1) {
            alert('Cannot delete the last chapter');
            return;
        }
        
        if (confirm('Are you sure you want to delete this chapter?')) {
            const index = this.chapters.findIndex(c => c.id === chapterId);
            if (index !== -1) {
                this.chapters.splice(index, 1);
                
                // If we deleted the current chapter, select another one
                if (this.currentChapterId === chapterId) {
                    const newCurrentChapter = this.chapters[Math.max(0, index - 1)];
                    this.selectChapter(newCurrentChapter.id);
                }
                
                this.updateChaptersList();
                this.markAsModified();
            }
        }
    }

    saveCollection() {
        if (!this.collectionTitle.trim()) {
            alert('Please enter a collection title');
            return;
        }
        
        // Save current chapter content
        if (this.currentChapterId) {
            const currentChapter = this.chapters.find(c => c.id === this.currentChapterId);
            if (currentChapter) {
                currentChapter.content = document.getElementById('textEditor').value;
            }
        }
        
        const collection = {
            title: this.collectionTitle,
            chapters: this.chapters,
            savedAt: new Date().toISOString()
        };
        
        // Save to localStorage
        const savedCollections = JSON.parse(localStorage.getItem('savedCollections') || '[]');
        const existingIndex = savedCollections.findIndex(c => c.title === this.collectionTitle);
        
        if (existingIndex !== -1) {
            savedCollections[existingIndex] = collection;
        } else {
            savedCollections.push(collection);
        }
        
        localStorage.setItem('savedCollections', JSON.stringify(savedCollections));
        this.updateSavedCollectionsList();
        
        document.getElementById('autoSaveStatus').textContent = 'Collection saved!';
        setTimeout(() => {
            document.getElementById('autoSaveStatus').textContent = 'Auto-saved';
        }, 2000);
    }

    loadCollection(collectionTitle) {
        const savedCollections = JSON.parse(localStorage.getItem('savedCollections') || '[]');
        const collection = savedCollections.find(c => c.title === collectionTitle);
        
        if (collection) {
            this.collectionTitle = collection.title;
            this.chapters = collection.chapters;
            
            document.getElementById('collectionTitle').value = this.collectionTitle;
            this.updateChaptersList();
            
            if (this.chapters.length > 0) {
                this.selectChapter(this.chapters[0].id);
            }
        }
    }

    newCollection() {
        if (confirm('Create a new collection? Unsaved changes will be lost.')) {
            this.collectionTitle = '';
            this.chapters = [];
            this.currentChapterId = null;
            
            document.getElementById('collectionTitle').value = '';
            document.getElementById('textEditor').value = '';
            document.getElementById('chapterTitle').value = '';
            document.getElementById('chapterTitle').style.display = 'none';
            
            this.updateChaptersList();
            this.addChapter();
            this.updateStats();
        }
    }

    exportCollection() {
        if (!this.collectionTitle.trim()) {
            alert('Please enter a collection title before exporting');
            return;
        }
        
        // Save current chapter content
        if (this.currentChapterId) {
            const currentChapter = this.chapters.find(c => c.id === this.currentChapterId);
            if (currentChapter) {
                currentChapter.content = document.getElementById('textEditor').value;
            }
        }
        
        // Create export data
        let exportContent = `Collection: ${this.collectionTitle}\n`;
        exportContent += `Exported: ${new Date().toLocaleString()}\n`;
        exportContent += `Chapters: ${this.chapters.length}\n\n`;
        exportContent += '='.repeat(50) + '\n\n';
        
        this.chapters.forEach((chapter, index) => {
            exportContent += `Chapter ${index + 1}: ${chapter.title}\n`;
            exportContent += '-'.repeat(30) + '\n';
            exportContent += chapter.content + '\n\n';
        });
        
        // Download as text file
        this.downloadTextFile(exportContent, `${this.collectionTitle}.txt`);
    }

    downloadTextFile(content, filename) {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    updateSavedCollectionsList() {
        const savedCollections = JSON.parse(localStorage.getItem('savedCollections') || '[]');
        const collectionsContainer = document.getElementById('savedCollections');
        
        collectionsContainer.innerHTML = '';
        
        savedCollections.forEach(collection => {
            const collectionElement = document.createElement('div');
            collectionElement.className = 'saved-collection-item';
            collectionElement.innerHTML = `
                <span>${collection.title}</span>
                <small>${new Date(collection.savedAt).toLocaleDateString()}</small>
            `;
            
            collectionElement.addEventListener('click', () => {
                this.loadCollection(collection.title);
            });
            
            collectionsContainer.appendChild(collectionElement);
        });
    }

    showLoadCollectionDialog() {
        const savedCollections = JSON.parse(localStorage.getItem('savedCollections') || '[]');
        
        if (savedCollections.length === 0) {
            alert('No saved collections found');
            return;
        }
        
        const collectionNames = savedCollections.map(c => c.title);
        const selectedCollection = prompt('Select a collection to load:\n\n' + 
            collectionNames.map((name, index) => `${index + 1}. ${name}`).join('\n') + 
            '\n\nEnter the number or name:');
        
        if (selectedCollection) {
            // Try to parse as number first
            const index = parseInt(selectedCollection) - 1;
            let collectionTitle;
            
            if (!isNaN(index) && index >= 0 && index < collectionNames.length) {
                collectionTitle = collectionNames[index];
            } else {
                collectionTitle = collectionNames.find(name => 
                    name.toLowerCase().includes(selectedCollection.toLowerCase())
                );
            }
            
            if (collectionTitle) {
                this.loadCollection(collectionTitle);
            } else {
                alert('Collection not found');
            }
        }
    }

    // Single file mode methods
    newFile() {
        if (confirm('Create a new file? Unsaved changes will be lost.')) {
            document.getElementById('textEditor').value = '';
            this.updateStats();
        }
    }

    saveFile() {
        const content = document.getElementById('textEditor').value;
        const filename = prompt('Enter filename:', 'document.txt');
        
        if (filename) {
            this.downloadTextFile(content, filename);
        }
    }

    loadFile() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.txt,.md';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    document.getElementById('textEditor').value = e.target.result;
                    this.updateStats();
                };
                reader.readAsText(file);
            }
        };
        
        input.click();
    }

    updateStats() {
        const text = document.getElementById('textEditor').value;
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        const chars = text.length;
        
        document.getElementById('wordCount').textContent = `Words: ${words}`;
        document.getElementById('charCount').textContent = `Characters: ${chars}`;
    }

    markAsModified() {
        document.getElementById('autoSaveStatus').textContent = 'Modified...';
    }

    startAutoSave() {
        this.autoSaveInterval = setInterval(() => {
            this.autoSave();
        }, 30000); // Auto-save every 30 seconds
    }

    autoSave() {
        if (this.isCollectionMode && this.currentChapterId) {
            const currentChapter = this.chapters.find(c => c.id === this.currentChapterId);
            if (currentChapter) {
                currentChapter.content = document.getElementById('textEditor').value;
                currentChapter.title = document.getElementById('chapterTitle').value;
            }
            
            // Save to localStorage
            const autoSaveData = {
                collectionTitle: this.collectionTitle,
                chapters: this.chapters,
                currentChapterId: this.currentChapterId,
                isCollectionMode: this.isCollectionMode
            };
            
            localStorage.setItem('autoSave', JSON.stringify(autoSaveData));
            document.getElementById('autoSaveStatus').textContent = 'Auto-saved';
        }
    }

    loadFromStorage() {
        // Load auto-save data
        const autoSaveData = localStorage.getItem('autoSave');
        if (autoSaveData) {
            try {
                const data = JSON.parse(autoSaveData);
                this.collectionTitle = data.collectionTitle || '';
                this.chapters = data.chapters || [];
                this.currentChapterId = data.currentChapterId;
                this.isCollectionMode = data.isCollectionMode !== false;
                
                document.getElementById('collectionTitle').value = this.collectionTitle;
                
                if (this.chapters.length > 0) {
                    this.updateChaptersList();
                    if (this.currentChapterId) {
                        this.selectChapter(this.currentChapterId);
                    } else {
                        this.selectChapter(this.chapters[0].id);
                    }
                }
            } catch (e) {
                console.error('Error loading auto-save data:', e);
            }
        }
        
        // Load saved collections list
        this.updateSavedCollectionsList();
        
        // Load mode preference
        const savedMode = localStorage.getItem('isCollectionMode');
        if (savedMode !== null) {
            this.isCollectionMode = savedMode === 'true';
        }
        
        this.toggleMode(this.isCollectionMode);
        
        // If no chapters exist in collection mode, add one
        if (this.isCollectionMode && this.chapters.length === 0) {
            this.addChapter();
        }
    }
}

// Initialize the mobile editor when the page loads
let mobileEditor;
document.addEventListener('DOMContentLoaded', () => {
    mobileEditor = new MobileTextEditor();
});

// Handle page visibility changes for better mobile experience
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && mobileEditor) {
        mobileEditor.autoSave();
    }
});

// Handle orientation changes
window.addEventListener('orientationchange', () => {
    setTimeout(() => {
        // Force a layout recalculation
        document.body.style.height = window.innerHeight + 'px';
        setTimeout(() => {
            document.body.style.height = '';
        }, 100);
    }, 100);
});