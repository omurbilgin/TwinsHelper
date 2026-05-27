# TwinsHelper

TwinsHelper is a small userscript helper for the Twins dashboard.

## Requirements

- Install the Tampermonkey browser extension.
- Add only the `main.user.js` file as a new Tampermonkey userscript.

## Setup

1. Open Tampermonkey in your browser.
2. Create a new script.
3. Paste the contents of `main.user.js`.
4. Update the `@match` line at the top of the script with your Twins dashboard URL:

```js
// @match        http://your-twins-url/
```

After saving the script, open the Twins dashboard and the helper panel should appear automatically.
