/* Webview script for tbdflow panel */
(function () {
  const vscode = acquireVsCodeApi();

  const typeInput = document.getElementById('type');
  const scopeInput = document.getElementById('scope');
  const messageInput = document.getElementById('message');
  const bodyInput = document.getElementById('body');
  const issueInput = document.getElementById('issue');
  const tagInput = document.getElementById('tag');
  const breakingInput = document.getElementById('breaking');
  const breakingDescInput = document.getElementById('breaking-description');
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
      scope: scopeInput ? scopeInput.value : '',
      message: messageInput.value,
      body: bodyInput ? bodyInput.value : '',
      issue: issueInput ? issueInput.value : '',
      tag: tagInput ? tagInput.value : '',
      breaking: breakingInput ? !!breakingInput.checked : false,
      breakingDescription: breakingDescInput ? breakingDescInput.value : ''
    });
  }

  submitBtn.addEventListener('click', () => doCommit());
  [typeInput, scopeInput, messageInput, issueInput, tagInput, breakingDescInput].forEach((el) => {
    if (!el) return;
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        doCommit();
      }
    });
  });

  if (breakingInput && breakingDescInput) {
    const syncBreakingState = () => {
      const enabled = !!breakingInput.checked;
      breakingDescInput.disabled = !enabled;
      if (!enabled) {
        breakingDescInput.value = '';
      }
    };
    breakingInput.addEventListener('change', syncBreakingState);
    // Initialize state on load
    syncBreakingState();
  }

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
