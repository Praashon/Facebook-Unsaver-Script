# FB Unsaver

Facebook Collection Cleaner

<img src="images/icon128.png" alt="FB Unsaver Logo" width="200" />

FB Unsaver is a Chrome extension that automates the process of removing saved items from your Facebook collections. Whether you have accumulated hundreds of saved posts over the years or just want to quickly clean up specific collections, FB Unsaver handles it with a single click.

## Features

*   **One Click Cleanup**
    Start clearing your saved items from a clean popup interface.

*   **Live Progress**
    A count up banner shows items cleared in real time.

*   **Stop Anytime**
    Halt the run from the popup or the on page banner at your convenience.

*   **Speed Control**
    Select Safe, Balanced, or Fast to match your preferred pace.

*   **Full List Aware**
    Waits through Facebook lazy loading so nothing is missed.

*   **Auto Detection**
    Finds Unsave and Remove from collection options automatically.

*   **Smart Filtering**
    Skips items it has already handled to save time.

## Tech Stack

*   Manifest Version: V3
*   Languages: JavaScript ES6+
*   APIs: Chrome Scripting API, Chrome Action API
*   Permissions: activeTab, scripting

## Installation

### From Source

1.  Clone the repository
    ```bash
    git clone https://github.com/yourusername/fb-unsaver.git
    cd Fb-Unsaver
    ```

2.  Load in Chrome
    Open Chrome and navigate to `chrome://extensions/`
    Enable Developer mode in the top right.
    Click Load unpacked and select the `Fb-Unsaver` folder.

3.  Verify Installation
    You should see the FB Unsaver icon in your extensions toolbar. The extension is now ready to use.

## Usage

### Quick Start

1.  Navigate to Facebook and open your Saved items or any collection.
2.  Click the FB Unsaver toolbar icon to open the popup.
3.  Choose a speed: Safe, Balanced, or Fast.
4.  Click Start cleaning.

### Monitor Progress

Watch the live count in the popup and the on page banner. Click Stop anytime to halt. Detailed logs are available in DevTools Console.

### Important Notes

Make sure you are on a Facebook saved items or collection page before running. The extension will run until all items are removed or you close the tab. This action cannot be undone, removed items are permanently unsaved.

## Architecture

1.  **popup.html, popup.css, popup.js**: The control panel. Reads the active tab, injects the worker with your chosen speed, and reflects live progress.
2.  **unsaver.js**: Injected content script that performs the actual cleanup and reports progress back to the popup.

## Configuration

Speed is chosen in the popup. To retune the presets, edit the `SPEEDS` table in `popup.js`:

```javascript
const SPEEDS = {
  safe:     { menuOpenDelay: 250, removeDelay: 750 },
  balanced: { menuOpenDelay: 120, removeDelay: 380 },
  fast:     { menuOpenDelay:  60, removeDelay: 200 },
};
```

Lower values are faster but leave less room before Facebook rate limits.

## Permissions

The extension requires minimal permissions:
*   activeTab: Access the current Facebook tab
*   scripting: Inject the cleanup script
*   host_permissions: facebook.com domain only

## License

This project is licensed under the MIT License.

## Legal

This extension is for personal use only. It automates actions you could perform manually through the Facebook interface. Use responsibly and in accordance with Facebook Terms of Service.
