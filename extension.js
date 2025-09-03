// Minimal VS Code extension that adds a tbdflow Activity Bar view
// and renders a simple webview with "Hello tbdflow".
const vscode = require('vscode');
const cp = require('child_process');

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
      const scriptUri = webviewView.webview.asWebviewUri(
        vscode.Uri.joinPath(context.extensionUri, 'media', 'panel.js')
      );
      webviewView.webview.html = getHtml(String(scriptUri));

      // Handle messages from the webview
      webviewView.webview.onDidReceiveMessage(async (msg) => {
        if (msg && msg.command === 'commit') {
          const type = (msg.type || '').trim();
          const message = (msg.message || '').trim();

          if (!type || !message) {
            vscode.window.showWarningMessage('Please fill both Type and Message.');
            return;
          }

          // Execute: echo tbdflow commit --type $type --message $message
          // Simple quoting for POSIX shells; good enough for typical values.
          const q = (s) => '"' + String(s).replace(/["\\$`]/g, (r) => '\\' + r) + '"';
          const cmd = `echo tbdflow commit --type ${q(type)} --message ${q(message)}`;

          // Determine a reasonable CWD (first workspace folder if any)
          const cwd = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0
            ? vscode.workspace.workspaceFolders[0].uri.fsPath
            : undefined;

          try {
            const { stdout, stderr } = await execCmd(cmd, { cwd });
            webviewView.webview.postMessage({ command: 'commandOutput', stdout, stderr });
          } catch (err) {
            const stdout = err && err.stdout ? err.stdout : '';
            const stderr = err && err.stderr ? err.stderr : String(err);
            webviewView.webview.postMessage({ command: 'commandOutput', stdout, stderr });
          }
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

function getHtml(scriptUri) {
  return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>tbdflow</title>
      <!-- CSP intentionally omitted; VS Code provides a safe default for webviews. -->
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
        .output {
          margin-top: 12px;
          padding: 8px;
          border-radius: 4px;
          border: 1px solid rgba(127,127,127,0.4);
          background: rgba(127,127,127,0.08);
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
          white-space: pre-wrap;
          max-height: 200px;
          overflow: auto;
        }
      </style>
    </head>
    <body>
      <div id="commit-form">
        <div class="row">
          <label for="type">Type</label>
          <input id="type" name="type" type="text" placeholder="feat, fix, chore..." required />
        </div>
        <div class="row">
          <label for="message">Message</label>
          <input id="message" name="message" type="text" placeholder="Short description" required />
        </div>
        <button id="commit" type="button">Commit</button>
      </div>
      <div id="output" class="output" aria-live="polite"></div>

      <script src="${scriptUri}"></script>
    </body>
  </html>`;
}

function execCmd(command, options = {}) {
  return new Promise((resolve, reject) => {
    cp.exec(command, { ...options, maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
      if (error) {
        error.stdout = stdout;
        error.stderr = stderr;
        reject(error);
        return;
      }
      resolve({ stdout, stderr });
    });
  });
}

module.exports = {
  activate,
  deactivate
};
