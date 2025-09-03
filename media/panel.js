/* Webview script for tbdflow panel */
(function () {
  const vscode = acquireVsCodeApi();

  const typeInput = document.getElementById('type');
  const messageInput = document.getElementById('message');
  const outputEl = document.getElementById('output');
  const submitBtn = document.getElementById('commit');

  function doCommit() {
    if (!typeInput.value.trim() || !messageInput.value.trim()) {
      outputEl.textContent = 'Type and Message are required.';
      return;
    }
    outputEl.textContent = 'Running...';
    submitBtn.disabled = true;
    vscode.postMessage({
      command: 'commit',
      type: typeInput.value,
      message: messageInput.value
    });
  }

  submitBtn.addEventListener('click', () => doCommit());
  [typeInput, messageInput].forEach((el) => {
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        doCommit();
      }
    });
  });

  window.addEventListener('message', (event) => {
    const data = event.data || {};
    if (data.command === 'commandOutput') {
      const parts = [];
      if (data.stdout) parts.push(String(data.stdout).trimEnd());
      if (data.stderr) parts.push(String(data.stderr).trimEnd());
      outputEl.textContent = parts.join('\n');
      submitBtn.disabled = false;
    }
  });
})();

