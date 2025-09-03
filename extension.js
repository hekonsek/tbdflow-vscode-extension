// Minimal VS Code extension that adds a tbdflow Activity Bar view
// and renders a simple webview with "Hello tbdflow".
const vscode = require('vscode');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  const provider = {
    /**
     * @param {vscode.WebviewView} webviewView
     */
    resolveWebviewView(webviewView) {
      webviewView.title = 'tbdflow';
      webviewView.webview.options = {
        enableScripts: false
      };
      webviewView.webview.html = getHtml();
    }
  };

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('tbdflow.view', provider)
  );

  // Optional command to programmatically open the view's container
  context.subscriptions.push(
    vscode.commands.registerCommand('tbdflow.openPanel', async () => {
      await vscode.commands.executeCommand('workbench.view.extension.tbdflow');
    })
  );
}

function deactivate() {}

function getHtml() {
  return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>tbdflow</title>
      <style>
        :root { color-scheme: light dark; }
        body {
          margin: 0;
          font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Arial, "Apple Color Emoji", "Segoe UI Emoji";
          display: grid;
          place-items: center;
          height: 100vh;
        }
        .hello { font-size: 1.2rem; }
      </style>
    </head>
    <body>
      <div class="hello">Hello tbdflow</div>
    </body>
  </html>`;
}

module.exports = {
  activate,
  deactivate
};

