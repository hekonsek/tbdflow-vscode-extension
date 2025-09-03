import * as vscode from 'vscode';
import * as cp from 'child_process';

export function activate(context: vscode.ExtensionContext) {
  const provider: vscode.WebviewViewProvider = {
    resolveWebviewView(webviewView: vscode.WebviewView) {
      webviewView.title = 'tbdflow';
      webviewView.webview.options = {
        enableScripts: true,
      };

      const scriptUri = webviewView.webview.asWebviewUri(
        vscode.Uri.joinPath(context.extensionUri, 'media', 'panel.js')
      );

      webviewView.webview.html = getHtml(String(scriptUri));

      webviewView.webview.onDidReceiveMessage(async (msg: any) => {
        if (msg && msg.command === 'commit') {
          const type = (msg.type || '').trim();
          const message = (msg.message || '').trim();

          if (!type || !message) {
            vscode.window.showWarningMessage('Please fill both Type and Message.');
            return;
          }

          const q = (s: string) => '"' + String(s).replace(/["\\$`]/g, (r) => '\\' + r) + '"';
          const cmd = `tbdflow commit --type ${q(type)} --message ${q(message)}`;

          const cwd = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0
            ? vscode.workspace.workspaceFolders[0].uri.fsPath
            : undefined;

          try {
            const { stdout, stderr } = await execCmd(cmd, { cwd });
            webviewView.webview.postMessage({ command: 'commandOutput', stdout, stderr });
          } catch (err: any) {
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

  context.subscriptions.push(
    vscode.commands.registerCommand('tbdflow.openPanel', async () => {
      await vscode.commands.executeCommand('workbench.view.extension.tbdflow');
    })
  );
}

export function deactivate() {}

function getHtml(scriptUri: string): string {
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

function execCmd(command: string, options: cp.ExecOptions = {}): Promise<{ stdout: string; stderr: string; }> {
  return new Promise((resolve, reject) => {
    cp.exec(command, { ...options, maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
      if (error) {
        (error as any).stdout = stdout;
        (error as any).stderr = stderr;
        reject(error);
        return;
      }
      resolve({ stdout, stderr });
    });
  });
}

