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
  const dodAnchor = document.getElementById('dod-anchor');
  let dodSection = null;
  let dodList = null;
  let dodHint = null;
  let dodCheckboxes = [];
  let dodRequired = false;

  function updateCommitEligibility() {
    if (!submitBtn) {
      return;
    }

    if (!dodRequired) {
      submitBtn.disabled = false;
      if (dodHint) {
        dodHint.textContent = '';
      }
      return;
    }

    const allChecked = dodCheckboxes.every((checkbox) => checkbox.checked);
    if (dodHint) {
      dodHint.textContent = allChecked ? '' : 'Please complete all items before committing.';
    }
    submitBtn.disabled = !allChecked;
  }

  function renderDodItems(items) {
    dodCheckboxes = [];
    dodRequired = Array.isArray(items) && items.length > 0;

    if (!dodAnchor) {
      updateCommitEligibility();
      return;
    }

    if (!dodRequired) {
      dodAnchor.innerHTML = '';
      dodSection = null;
      dodList = null;
      dodHint = null;
      updateCommitEligibility();
      return;
    }

    if (!dodSection) {
      dodSection = document.createElement('div');
      dodSection.className = 'row';
      dodSection.id = 'dod-section';

      const title = document.createElement('div');
      title.className = 'dod-title';
      title.textContent = 'Definition of Done Checklist';

      dodList = document.createElement('div');
      dodList.className = 'dod-list';
      dodList.setAttribute('role', 'group');
      dodList.setAttribute('aria-label', 'Definition of Done checklist');

      dodHint = document.createElement('div');
      dodHint.className = 'hint';

      dodSection.appendChild(title);
      dodSection.appendChild(dodList);
      dodSection.appendChild(dodHint);
      dodAnchor.appendChild(dodSection);
    }

    if (!dodList || !dodSection.contains(dodList)) {
      dodList = dodSection.querySelector('.dod-list') || null;
    }
    if (!dodList) {
      dodList = document.createElement('div');
      dodList.className = 'dod-list';
      dodList.setAttribute('role', 'group');
      dodList.setAttribute('aria-label', 'Definition of Done checklist');
      if (dodHint && dodSection.contains(dodHint)) {
        dodSection.insertBefore(dodList, dodHint);
      } else {
        dodSection.appendChild(dodList);
      }
    }

    if (!dodHint || !dodSection.contains(dodHint)) {
      dodHint = dodSection.querySelector('.hint') || null;
    }
    if (!dodHint) {
      dodHint = document.createElement('div');
      dodHint.className = 'hint';
      dodSection.appendChild(dodHint);
    }

    dodList.innerHTML = '';

    items.forEach((item, index) => {
      const row = document.createElement('div');
      row.className = 'dod-item';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      const checkboxId = `dod-item-${index}`;
      checkbox.id = checkboxId;
      checkbox.addEventListener('change', () => updateCommitEligibility());

      const label = document.createElement('label');
      label.setAttribute('for', checkboxId);
      label.textContent = String(item);

      row.appendChild(checkbox);
      row.appendChild(label);

      dodList.appendChild(row);
      dodCheckboxes.push(checkbox);
    });

    updateCommitEligibility();
  }

  function doCommit() {
    if (!typeInput.value.trim() || !messageInput.value.trim()) {
      outputEl.textContent = 'Type and Message are required.';
      return;
    }

    if (dodRequired && !dodCheckboxes.every((checkbox) => checkbox.checked)) {
      outputEl.textContent = 'Please complete the Definition of Done checklist.';
      updateCommitEligibility();
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
      updateCommitEligibility();
    }

    if (data.command === 'dodItems') {
      renderDodItems(Array.isArray(data.items) ? data.items : []);
    }
  });

  updateCommitEligibility();
})();
