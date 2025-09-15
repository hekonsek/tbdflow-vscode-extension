import * as vscode from 'vscode';
import * as cp from 'child_process';
import { TbdflowCommandBuilder } from './tbdflowCommandBuilder';

export function activate(context: vscode.ExtensionContext) {
  const provider: vscode.WebviewViewProvider = {
    resolveWebviewView(webviewView: vscode.WebviewView) {
      webviewView.title = 'tbdflow Commit';
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
          const scope = (msg.scope || '').trim();
          const message = (msg.message || '').trim();
          const body = (msg.body || '').trim();
          const issue = (msg.issue || '').trim();
          const tag = (msg.tag || '').trim();
          const breaking = !!msg.breaking;
          const breakingDescription = (msg.breakingDescription || '').trim();

          if (!type || !message) {
            vscode.window.showWarningMessage('Please fill both Type and Message.');
            return;
          }

          const cmd = new TbdflowCommandBuilder().commit({ type, message, scope, body, issue, tag, breaking, breakingDescription, noVerify: true });

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

  // Command: tbdflow.newBranch — prompts for fields and runs `tbdflow branch`
  context.subscriptions.push(
    vscode.commands.registerCommand('tbdflow.newBranch', async () => {
      const cwd = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0
        ? vscode.workspace.workspaceFolders[0].uri.fsPath
        : undefined;

      // Collect inputs
      const type = await vscode.window.showInputBox({
        title: 'tbdflow: New Branch',
        placeHolder: 'feat, fix, chore... (type)',
        prompt: 'Type of branch (see .tbdflow.yml for allowed types)',
        ignoreFocusOut: true,
        validateInput: (v) => v.trim().length === 0 ? 'Type is required' : undefined,
      });
      if (!type) { return; }

      const name = await vscode.window.showInputBox({
        title: 'tbdflow: New Branch',
        placeHolder: 'e.g., user-profile-page',
        prompt: 'Short, descriptive name for the branch',
        ignoreFocusOut: true,
        validateInput: (v) => v.trim().length === 0 ? 'Name is required' : undefined,
      });
      if (!name) { return; }

      const issue = await vscode.window.showInputBox({
        title: 'tbdflow: New Branch',
        placeHolder: 'e.g., ABC-123 (optional)',
        prompt: 'Optional issue reference to include in the branch name',
        ignoreFocusOut: true,
      });

      const fromCommit = await vscode.window.showInputBox({
        title: 'tbdflow: New Branch',
        placeHolder: 'Commit hash on main to branch from (optional)',
        prompt: "Optional commit hash on 'main' to branch from",
        ignoreFocusOut: true,
      });

      const cmd = new TbdflowCommandBuilder().branch({ type: type.trim(), name: name.trim(), issue: (issue || '').trim(), fromCommit: (fromCommit || '').trim() });

      try {
        const result = await vscode.window.withProgress({
          location: vscode.ProgressLocation.Notification,
          title: 'tbdflow: Creating branch...',
          cancellable: false,
        }, async () => {
          return await execCmd(cmd, { cwd });
        });

        const out = (result.stdout || '').trim();
        const err = (result.stderr || '').trim();
        const msg = [out, err].filter(Boolean).join('\n');
        vscode.window.showInformationMessage(msg.length > 0 ? msg : 'Branch created and pushed.');
      } catch (e: any) {
        const stdout = e && e.stdout ? String(e.stdout) : '';
        const stderr = e && e.stderr ? String(e.stderr) : String(e);
        const msg = [stdout, stderr].filter(Boolean).join('\n');
        vscode.window.showErrorMessage(msg.length > 0 ? msg : 'Failed to create branch.');
      }
    })
  );

  // Command: tbdflow.completeBranch — prompts for fields and runs `tbdflow complete`
  context.subscriptions.push(
    vscode.commands.registerCommand('tbdflow.completeBranch', async () => {
      const cwd = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0
        ? vscode.workspace.workspaceFolders[0].uri.fsPath
        : undefined;

      const type = await vscode.window.showInputBox({
        title: 'tbdflow: Complete Branch',
        placeHolder: 'feature, release, hotfix... (type)',
        prompt: 'Type of branch to complete (see .tbdflow.yml for allowed types)',
        ignoreFocusOut: true,
        validateInput: (v) => v.trim().length === 0 ? 'Type is required' : undefined,
      });
      if (!type) { return; }

      const name = await vscode.window.showInputBox({
        title: 'tbdflow: Complete Branch',
        placeHolder: 'e.g., user-profile-page or 1.2.0',
        prompt: 'Name or version of the branch to complete',
        ignoreFocusOut: true,
        validateInput: (v) => v.trim().length === 0 ? 'Name is required' : undefined,
      });
      if (!name) { return; }

      const cmd = new TbdflowCommandBuilder().complete({ type: type.trim(), name: name.trim() });

      try {
        const result = await vscode.window.withProgress({
          location: vscode.ProgressLocation.Notification,
          title: 'tbdflow: Completing branch...',
          cancellable: false,
        }, async () => {
          return await execCmd(cmd, { cwd });
        });

        const out = (result.stdout || '').trim();
        const err = (result.stderr || '').trim();
        const msg = [out, err].filter(Boolean).join('\n');
        vscode.window.showInformationMessage(msg.length > 0 ? msg : 'Branch completed.');
      } catch (e: any) {
        const stdout = e && e.stdout ? String(e.stdout) : '';
        const stderr = e && e.stderr ? String(e.stderr) : String(e);
        const msg = [stdout, stderr].filter(Boolean).join('\n');
        vscode.window.showErrorMessage(msg.length > 0 ? msg : 'Failed to complete branch.');
      }
    })
  );

  // Command: tbdflow.generateChangelog — prompts for options and runs `tbdflow changelog`
  context.subscriptions.push(
    vscode.commands.registerCommand('tbdflow.generateChangelog', async () => {
      const cwd = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0
        ? vscode.workspace.workspaceFolders[0].uri.fsPath
        : undefined;

      // Ask if user wants unreleased since last tag
      const unreleasedChoice = await vscode.window.showQuickPick(['Yes', 'No'], {
        title: 'tbdflow: Generate Changelog',
        placeHolder: 'Generate for unreleased (since latest tag)?',
        ignoreFocusOut: true,
      });
      if (!unreleasedChoice) { return; }
      const unreleased = unreleasedChoice === 'Yes';

      let from = '';
      let to = '';

      if (!unreleased) {
        from = (await vscode.window.showInputBox({
          title: 'tbdflow: Generate Changelog',
          placeHolder: 'e.g., v1.0.0 or commit hash (optional)',
          prompt: 'Generate from this git reference (optional)',
          ignoreFocusOut: true,
        })) || '';

        to = (await vscode.window.showInputBox({
          title: 'tbdflow: Generate Changelog',
          placeHolder: 'Defaults to HEAD (optional)',
          prompt: 'Generate to this git reference (optional)',
          ignoreFocusOut: true,
        })) || '';

        if (from.trim().length === 0 && to.trim().length === 0) {
          const pick = await vscode.window.showWarningMessage(
            "Please provide at least 'From' or choose 'Unreleased'.",
            'Try Again',
            'Cancel'
          );
          if (pick === 'Try Again') {
            await vscode.commands.executeCommand('tbdflow.generateChangelog');
          }
          return;
        }
      }

      const cmd = new TbdflowCommandBuilder().changelog({
        unreleased,
        from: from.trim(),
        to: to.trim(),
      });

      try {
        const result = await vscode.window.withProgress({
          location: vscode.ProgressLocation.Notification,
          title: 'tbdflow: Generating changelog...',
          cancellable: false,
        }, async () => {
          return await execCmd(cmd, { cwd });
        });

        const out = (result.stdout || '').trim();
        const err = (result.stderr || '').trim();
        const content = [out, err].filter(Boolean).join('\n');

        if (content.length === 0) {
          vscode.window.showInformationMessage('Changelog is empty.');
          return;
        }

        const doc = await vscode.workspace.openTextDocument({ language: 'markdown', content });
        await vscode.window.showTextDocument(doc, { preview: false });
      } catch (e: any) {
        const stdout = e && e.stdout ? String(e.stdout) : '';
        const stderr = e && e.stderr ? String(e.stderr) : String(e);
        const msg = [stdout, stderr].filter(Boolean).join('\n');
        vscode.window.showErrorMessage(msg.length > 0 ? msg : 'Failed to generate changelog.');
      }
    })
  );

  // Command: tbdflow.sync — runs `tbdflow sync` and shows output
  context.subscriptions.push(
    vscode.commands.registerCommand('tbdflow.sync', async () => {
      const cwd = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0
        ? vscode.workspace.workspaceFolders[0].uri.fsPath
        : undefined;

      const cmd = new TbdflowCommandBuilder().sync();

      try {
        const result = await vscode.window.withProgress({
          location: vscode.ProgressLocation.Notification,
          title: 'tbdflow: Syncing with remote...',
          cancellable: false,
        }, async () => {
          return await execCmd(cmd, { cwd });
        });

        const out = (result.stdout || '').trim();
        const err = (result.stderr || '').trim();
        const content = [out, err].filter(Boolean).join('\n');

        if (content.length === 0) {
          vscode.window.showInformationMessage('tbdflow: Sync completed.');
          return;
        }

        const doc = await vscode.workspace.openTextDocument({ language: 'plaintext', content });
        await vscode.window.showTextDocument(doc, { preview: false });
      } catch (e: any) {
        const stdout = e && e.stdout ? String(e.stdout) : '';
        const stderr = e && e.stderr ? String(e.stderr) : String(e);
        const msg = [stdout, stderr].filter(Boolean).join('\n');
        vscode.window.showErrorMessage(msg.length > 0 ? msg : 'Failed to sync.');
      }
    })
  );

  // Command: tbdflow.status — runs `tbdflow status` and shows output
  context.subscriptions.push(
    vscode.commands.registerCommand('tbdflow.status', async () => {
      const cwd = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0
        ? vscode.workspace.workspaceFolders[0].uri.fsPath
        : undefined;

      const cmd = new TbdflowCommandBuilder().status();

      try {
        const result = await vscode.window.withProgress({
          location: vscode.ProgressLocation.Notification,
          title: 'tbdflow: Checking status...',
          cancellable: false,
        }, async () => {
          return await execCmd(cmd, { cwd });
        });

        const out = (result.stdout || '').trim();
        const err = (result.stderr || '').trim();
        const content = [out, err].filter(Boolean).join('\n');

        const doc = await vscode.workspace.openTextDocument({ language: 'plaintext', content });
        await vscode.window.showTextDocument(doc, { preview: false });
      } catch (e: any) {
        const stdout = e && e.stdout ? String(e.stdout) : '';
        const stderr = e && e.stderr ? String(e.stderr) : String(e);
        const msg = [stdout, stderr].filter(Boolean).join('\n');
        vscode.window.showErrorMessage(msg.length > 0 ? msg : 'Failed to check status.');
      }
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
        /* Add vertical spacing between form rows */
        #commit-form { display: flex; flex-direction: column; gap: 12px; }
        label { font-size: 12px; opacity: 0.8; }
        input[type="text"], textarea {
          width: 100%;
          padding: 6px 8px;
          border-radius: 4px;
          border: 1px solid rgba(127,127,127,0.4);
          background: transparent;
          color: inherit;
        }
        textarea { min-height: 100px; resize: vertical; }
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
        .row.inline { flex-direction: row; align-items: center; gap: 8px; }
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
          <label for="scope">Scope (optional)</label>
          <input id="scope" name="scope" type="text" placeholder="api, ui, docs... (optional)" />
        </div>
        <div class="row">
          <label for="message">Message</label>
          <input id="message" name="message" type="text" placeholder="Short description" required />
        </div>
        <div class="row">
          <label for="body">Body (optional)</label>
          <textarea id="body" name="body" placeholder="Longer description (optional)"></textarea>
        </div>
        <div class="row">
          <label for="issue">Issue (optional)</label>
          <input id="issue" name="issue" type="text" placeholder="Issue reference (optional)" />
        </div>
        <div class="row">
          <label for="tag">Tag (optional)</label>
          <input id="tag" name="tag" type="text" placeholder="Tag (optional)" />
        </div>
        <div class="row inline">
          <input id="breaking" name="breaking" type="checkbox" />
          <label for="breaking">Is this a breaking change?</label>
        </div>
        <div class="row">
          <label for="breaking-description">Breaking Description (optional)</label>
          <input id="breaking-description" name="breaking-description" type="text" placeholder="Describe the breaking change (optional)" disabled />
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
