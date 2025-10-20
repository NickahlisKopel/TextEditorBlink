# TextEditor Blink

A powerful, elegant text editor designed specifically for story writing with advanced chapter management. Built with Electron for cross-platform desktop use.

## ✨ Features

### 📖 **Story Management**
- **Chapter Organization**: Organize your stories into chapters with a dedicated sidebar
- **Collection Management**: Group chapters into named collections
- **Chapter Navigation**: Easy switching between chapters with visual chapter list
- **Export Collections**: Export entire story collections as organized folder structures

### ✍️ **Writing Tools**
- **Distraction-Free Interface**: Clean, minimal design focused on writing
- **Dark Mode**: Toggle between light and dark themes for comfortable writing
- **Adjustable Text Size**: Increase/decrease font size for optimal readability
- **Real-Time Stats**: Live word and character counting
- **Auto-Save**: Automatic backup every 30 seconds to prevent data loss

### 💾 **File Operations**
- **Dual Mode**: Work with either chapter collections or individual files
- **Multiple Formats**: Support for `.txt`, `.md`, `.rtf`, and other text files
- **Smart Export**: Export collections as organized folders with numbered chapter files
- **Collection Files**: Save entire story projects as `.json` collections

## 🎮 How to Use

### **Getting Started**
1. **Launch the app** - Opens with a default "My Story" collection and Chapter 1
2. **Start Writing** - Begin typing in the main editor area
3. **Manage Chapters** - Use the left sidebar to organize your story

### **Chapter Management**
- **Add Chapters**: Click the "Add Chapter" button
- **Switch Chapters**: Click any chapter in the sidebar
- **Rename Chapters**: Edit the chapter title at the top of the editor
- **Delete Chapters**: Use the 🗑️ button next to each chapter (minimum 1 chapter required)
- **Rename Collection**: Edit the collection title in the sidebar

### **Export Your Story**
1. Click "Export Collection" in the sidebar
2. Choose a destination folder
3. Your story will be exported as:
   - `01_Chapter1.txt`, `02_Chapter2.txt`, etc.
   - `_collection.json` (metadata file)

## ⌨️ Keyboard Shortcuts

- `Ctrl+N` - New single file
- `Ctrl+O` - Open single file  
- `Ctrl+S` - Save current chapter/file
- `Ctrl+D` - Toggle dark mode
- `Ctrl++` - Increase font size
- `Ctrl+-` - Decrease font size
- `Ctrl+0` - Reset font size

## 🚀 Installation & Development

### **📥 For Users - Easy Install**
1. **Download**: Go to [Releases](https://github.com/NickahlisKopel/TextEditorBlink/releases)
2. **Extract**: Download and unzip `TextEditorBlink-v1.0.0-win64.zip`
3. **Run**: Double-click `TextEditorBlink.exe`
4. **Start Writing**: Begin your story immediately!

### **🔨 Build It Yourself**
Don't want to download? Build your own executable:
```bash
git clone https://github.com/NickahlisKopel/TextEditorBlink.git
cd TextEditorBlink
npm install
npm run package
```
Your executable will be in: `dist/TextEditorBlink-win32-x64/TextEditorBlink.exe`

### **👩‍💻 For Developers**
```bash
# Clone and setup
git clone <repository-url>
cd TextEditorBlink
npm install

# Run in development
npm start

# Run with DevTools
npm run dev

# Create executable
npm run package
```

## 🔨 Building Executables

### **Simple Executable (Recommended)**
```bash
npm run package
```
This creates `dist/TextEditorBlink-win32-x64/TextEditorBlink.exe` - a standalone executable that runs without installation.

### **Alternative Build Methods**
```bash
# Attempt electron-builder (may require admin privileges)
npm run build:win    # Windows installer
npm run build:mac    # macOS
npm run build:linux  # Linux

# Cross-platform
npm run build        # All platforms
```

## 📁 Project Structure

```
TextEditorBlink/
├── src/
│   ├── main.js          # Electron main process
│   ├── preload.js       # Security bridge
│   ├── index.html       # App interface
│   ├── styles.css       # App styling
│   └── renderer.js      # App functionality
├── assets/              # Icons and resources
├── dist/                # Built executables
├── package.json         # Project configuration
└── README.md           # This file
```

## 🎯 File Formats & Export

### **Supported Input Formats**
- `.txt` - Plain text files
- `.md` - Markdown files  
- `.rtf` - Rich text format
- `.*` - Any text-based file

### **Export Formats**
- **Individual Chapters**: `.txt` files with chapter titles as headers
- **Collection Metadata**: `.json` file with complete project structure
- **Organized Folders**: Numbered files in dedicated collection folder

## 🛠️ Technology Stack

- **Electron 38.3.0** - Cross-platform desktop framework
- **HTML5/CSS3** - Modern web standards
- **Vanilla JavaScript** - No external dependencies
- **Node.js** - File system operations
- **electron-packager** - Simple executable creation

## 🎨 Customization

### **Themes**
- **Light Theme**: Clean, paper-like writing experience
- **Dark Theme**: Easy on the eyes for long writing sessions
- **Auto-persistence**: Your theme preference is saved

### **Typography**
- **Font Sizes**: 8px to 32px range
- **Writing Font**: Optimized for readability
- **UI Font**: System fonts for native feel

## 📝 License

MIT License - Feel free to modify and distribute.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

- **Issues**: Create an issue on the project repository
- **Features**: Request new features via GitHub issues
- **Documentation**: Check this README for usage instructions

---

**Happy Writing! 📚✨**