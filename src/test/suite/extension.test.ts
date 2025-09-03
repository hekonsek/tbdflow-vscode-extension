import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Extension Basics', () => {
  test('Extension loads and activates', async () => {
    const ext = vscode.extensions.getExtension('local.tbdflow-code-plugin');
    assert.ok(ext, 'Extension should be found');

    await ext!.activate();
    assert.strictEqual(ext!.isActive, true, 'Extension should be active');
  });
});

