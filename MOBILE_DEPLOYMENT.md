# Mobile Deployment Guide

## Quick Start for Mobile Development

### 📋 Prerequisites

**For Android Development:**
- Install [Android Studio](https://developer.android.com/studio)
- Set up Android SDK
- Enable Developer Options on your Android device

**For iOS Development (macOS only):**
- Install [Xcode](https://developer.apple.com/xcode/) from the App Store
- Set up iOS Simulator or connect physical device
- Apple Developer Account (for device testing/distribution)

### 🚀 Development Workflow

1. **Start with web version in browser:**
   ```bash
   # Open mobile/index.html in your browser to test
   ```

2. **Sync changes to mobile platforms:**
   ```bash
   npm run mobile:build
   ```

3. **Open in native IDEs:**
   ```bash
   # For Android
   npm run mobile:android
   
   # For iOS  
   npm run mobile:ios
   ```

### 📱 Testing on Devices

**Android:**
1. Open Android Studio project (`android/` folder)
2. Connect Android device via USB or use emulator
3. Click "Run" button or use `Ctrl+R`

**iOS:**
1. Open Xcode project (`ios/App.xcworkspace`)
2. Select device/simulator
3. Click "Play" button or use `Cmd+R`

### 📦 Building for Distribution

**Android APK:**
1. In Android Studio: `Build > Build Bundle(s) / APK(s) > Build APK(s)`
2. APK location: `android/app/build/outputs/apk/debug/app-debug.apk`

**iOS App:**
1. In Xcode: `Product > Archive`
2. Follow App Store submission process

### 🔧 Customization

**App Icons & Splash Screens:**
- Add icons to `android/app/src/main/res/` (various sizes)
- Add icons to `ios/App/App/Assets.xcassets/AppIcon.appiconset/`
- Modify splash screen in `capacitor.config.json`

**App Permissions:**
- Android: Edit `android/app/src/main/AndroidManifest.xml`
- iOS: Edit `ios/App/App/Info.plist`

### 🛠️ Troubleshooting

**Common Issues:**
- **Gradle sync failed**: Update Android Studio and Gradle
- **Pod install failed**: Install CocoaPods with `sudo gem install cocoapods`
- **Web assets not updating**: Run `cap sync` after changes

**Debugging:**
- Use Chrome DevTools for web debugging
- Use native IDE debuggers for platform-specific issues
- Check Capacitor logs with `cap run android --livereload` or `cap run ios --livereload`

### 📚 Useful Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Android Developer Guide](https://developer.android.com/guide)
- [iOS App Development](https://developer.apple.com/ios/)
- [Publishing to App Stores](https://capacitorjs.com/docs/basics/publishing)

### 💡 Pro Tips

1. **Live Reload**: Use `cap run android --livereload` for faster development
2. **Web Testing**: Test in mobile browser first (Chrome DevTools device mode)
3. **Performance**: Optimize images and minimize JavaScript for better mobile performance
4. **Storage**: Mobile version uses localStorage - test with limited storage scenarios