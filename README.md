# 🧹 FB-Unsaver - Facebook Collection Cleaner

<div align="center">

![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-green.svg)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue.svg)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)
![License](https://img.shields.io/badge/License-MIT-orange.svg)

*Automatically clean up your Facebook saved items and collections with one click*

</div>

## 📋 Overview

FB-Unsaver is a Chrome extension that automates the tedious process of removing saved items from your Facebook collections. Whether you've accumulated hundreds of saved posts over the years or just want to quickly clean up specific collections, FB-Unsaver does it all with a single click.

## ✨ Features

- 🚀 **One-Click Cleanup** - Remove all saved items automatically
- ⚡ **Fast Processing** - Efficiently processes items in batches
- 🔄 **Auto-Detection** - Automatically finds "Unsave" and "Remove from collection" buttons
- 📊 **Progress Logging** - Real-time console feedback on cleanup progress
- 🎯 **Smart Filtering** - Avoids processing the same items multiple times
- ⏸️ **Safe Operation** - Built-in delays to prevent rate limiting

## 🛠️ Tech Stack

- **Manifest Version**: V3 (Latest Chrome Extension standard)
- **Languages**: JavaScript (ES6+)
- **APIs**: Chrome Scripting API, Chrome Action API
- **Permissions**: activeTab, scripting

## 📦 Installation

### From Source

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/fb-unsaver.git
cd Fb-Unsaver
```

2. **Load in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `Fb-Unsaver` folder

3. **Verify Installation**
   - You should see the FB-Unsaver icon in your extensions toolbar
   - The extension is now ready to use

### From Chrome Web Store
*Coming soon...*

## 🎯 Usage

### Quick Start

1. **Navigate to Facebook**
   - Go to facebook.com
   - Open your Saved items or any collection

2. **Run FB-Unsaver**
   - Click the FB-Unsaver extension icon
   - The extension will automatically start removing items

3. **Monitor Progress**
   - Open Chrome DevTools (F12)
   - Switch to the Console tab
   - Watch real-time progress logs

### Important Notes

⚠️ **Before Running:**
- Make sure you're on a Facebook saved items or collection page
- The extension will run until all items are removed or you close the tab
- **This action cannot be undone** - removed items are permanently unsaved

### Console Output

```
[fb-unsaver] Running fb-unsaver. Close tab to stop.
[fb-unsaver] Removed item: 1
[fb-unsaver] Removed item: 2
[fb-unsaver] Total removed: 2
[fb-unsaver] Found (5, 0) to remove. Continuing fb-unsaver.
...
[fb-unsaver] Stopping. No more items to remove.
```

## 📁 Project Structure

```
Fb-Unsaver/
├── manifest.json      # Extension configuration
├── background.js      # Service worker for extension actions
├── unsaver.js         # Core cleanup logic
├── images/           # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md         # This file
```

## 🔧 How It Works

### Architecture

1. **background.js**: Service worker that listens for extension icon clicks
2. **unsaver.js**: Injected script that performs the actual cleanup

### Core Logic

```javascript
// Main workflow
1. Scan page for "More" buttons and "Unsave/Remove" menu items
2. Mark processed elements to avoid duplicates
3. Click "More" buttons to reveal menus
4. Click "Unsave" or "Remove from collection" options
5. Wait with delays to prevent rate limiting
6. Repeat until no items remain
```

### Key Functions

- **dom.getMoreButtons()** - Finds all unprocessed "More" buttons
- **dom.getRemoveMenuItems()** - Locates "Unsave" and "Remove" options
- **run.openAndRemove()** - Opens menus and removes items
- **read.mark()** - Marks processed elements

## ⚙️ Configuration

### Adjusting Speed

Edit the delay in `unsaver.js`:

```javascript
function delay(ms = 1000) {  // Default: 1 second
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

**Recommended values:**
- Slow (safe): 1500-2000ms
- Normal: 1000ms (default)
- Fast: 500ms (may trigger rate limiting)

## 🔒 Permissions

The extension requires minimal permissions:

- **activeTab**: Access the current Facebook tab
- **scripting**: Inject the cleanup script
- **host_permissions**: facebook.com domain only

## 🐛 Troubleshooting

### Extension Not Working?

1. **Check URL**: Ensure you're on facebook.com
2. **Reload Extension**: Go to chrome://extensions and reload FB-Unsaver
3. **Check Console**: Look for error messages in DevTools
4. **Facebook Updates**: Facebook's HTML structure may have changed

### Items Not Removing?

1. **Refresh the Page**: Sometimes Facebook's dynamic loading causes issues
2. **Check Element Names**: Facebook may have updated button labels
3. **Increase Delay**: Add more time between operations

### Rate Limited?

If Facebook temporarily blocks actions:
- Wait 15-30 minutes before trying again
- Increase delay times in the code
- Process items in smaller batches

## 🚀 Development

### Building from Source

```bash
# Clone repository
git clone https://github.com/yourusername/fb-unsaver.git
cd Fb-Unsaver

# No build process needed - pure JavaScript!
# Just load the extension in Chrome
```

### Testing

1. Create test saved items on Facebook
2. Load the unpacked extension
3. Run on the test collection
4. Verify items are removed correctly

### Debugging

```javascript
// Enable verbose logging in unsaver.js
console.log('[fb-unsaver] Debug info:', debugData);
```

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Make your changes
4. Test thoroughly on Facebook
5. Commit your changes (`git commit -m 'Add AmazingFeature'`)
6. Push to the branch (`git push origin feature/AmazingFeature`)
7. Open a Pull Request

### Ideas for Contributions

- [ ] Add options page for customization
- [ ] Implement selective removal (by date, type, etc.)
- [ ] Add statistics dashboard
- [ ] Support for other social media platforms
- [ ] Undo functionality
- [ ] Export saved items before removal

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ⚖️ Legal & Ethics

This extension is for personal use only. It automates actions you could perform manually through Facebook's interface. Use responsibly and in accordance with Facebook's Terms of Service.

## 🙏 Acknowledgments

- Built for Chrome Extension Manifest V3
- Uses Facebook's existing UI elements
- Community-driven improvements

## 📞 Support

- **Issues**: Report bugs on GitHub Issues
- **Questions**: Open a discussion on GitHub
- **Updates**: Check for Facebook UI changes regularly

## 🔄 Changelog

### Version 1.0
- Initial release
- Basic unsave functionality
- Console logging
- Manifest V3 support

---

<div align="center">

**Clean your Facebook collections with ease!**

*Made with ❤️ by the open-source community*

</div>
