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
        enableScripts: true
      };
      webviewView.webview.html = getHtml();

      // Handle messages from the webview
      webviewView.webview.onDidReceiveMessage(async (msg) => {
        if (msg && msg.command === 'commit') {
          const type = (msg.type || '').trim();
          const message = (msg.message || '').trim();

          if (!type || !message) {
            vscode.window.showWarningMessage('Please fill both Type and Message.');
            return;
          }

          // Placeholder behavior: show a confirmation. Replace with real logic later.
          vscode.window.showInformationMessage(`Commit requested: [${type}] ${message}`);
        }
      });
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
        * { box-sizing: border-box; }
        body {
          margin: 0;
          font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Arial, "Apple Color Emoji", "Segoe UI Emoji";
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        label { font-size: 12px; opacity: 0.8; }
        input[type="text"] {
          width: 100%;
          padding: 6px 8px;
          border-radius: 4px;
          border: 1px solid rgba(127,127,127,0.4);
          background: transparent;
          color: inherit;
        }
        button {
          align-self: flex-start;
          padding: 6px 12px;
          border-radius: 4px;
          border: 1px solid rgba(127,127,127,0.4);
          background: rgba(127,127,127,0.15);
          color: inherit;
          cursor: pointer;
        }
        button:hover { background: rgba(127,127,127,0.25); }
        .row { display: flex; flex-direction: column; gap: 4px; }
      </style>
    </head>
    <body>
      <form id="commit-form">
        <div class="row">
          <label for="type">Type</label>
          <input id="type" name="type" type="text" placeholder="feat, fix, chore..." required />
        </div>
        <div class="row">
          <label for="message">Message</label>
          <input id="message" name="message" type="text" placeholder="Short description" required />
        </div>
        <button id="commit" type="submit">Commit</button>
      </form>

      <script>
        const vscode = acquireVsCodeApi();
        const form = document.getElementById('commit-form');
        const typeInput = document.getElementById('type');
        const messageInput = document.getElementById('message');

        form.addEventListener('submit', (e) => {
          e.preventDefault();
          vscode.postMessage({
            command: 'commit',
            type: typeInput.value,
            message: messageInput.value
          });
        });
      </script>
    </body>
  </html>`;
}

module.exports = {
  activate,
  deactivate
};
