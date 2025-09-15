import * as assert from 'assert';
import { TbdflowCommandBuilder } from '../../tbdflowCommandBuilder';

suite('TbdflowCommandBuilder - breaking flags', () => {
  test('does not emit breaking flags by default', () => {
    const cmd = new TbdflowCommandBuilder().commit({
      type: 'feat',
      message: 'add feature'
    });
    assert.strictEqual(/\s--breaking(\s|$)/.test(cmd), false);
    assert.strictEqual(cmd.includes('--breaking-description'), false);
  });

  test('emits --breaking when true', () => {
    const cmd = new TbdflowCommandBuilder().commit({
      type: 'fix',
      message: 'bug fix',
      breaking: true
    });
    assert.ok(/\s--breaking(\s|$)/.test(cmd), `Expected --breaking in: ${cmd}`);
  });

  test('omits --breaking when false', () => {
    const cmd = new TbdflowCommandBuilder().commit({
      type: 'chore',
      message: 'cleanup',
      breaking: false
    });
    assert.strictEqual(/\s--breaking(\s|$)/.test(cmd), false, `Did not expect --breaking in: ${cmd}`);
  });

  test('emits --breaking-description when provided (quoted)', () => {
    const cmd = new TbdflowCommandBuilder().commit({
      type: 'feat',
      message: 'new API',
      breakingDescription: 'renamed method with spaces'
    });
    assert.ok(cmd.includes('--breaking-description "renamed method with spaces"'), `Expected quoted description in: ${cmd}`);
  });

  test('both --breaking and --breaking-description together in order', () => {
    const cmd = new TbdflowCommandBuilder().commit({
      type: 'feat',
      message: 'v2 changes',
      breaking: true,
      breakingDescription: 'remove old endpoint'
    });
    const breakingIdx = cmd.indexOf('--breaking');
    const descIdx = cmd.indexOf('--breaking-description');
    assert.ok(breakingIdx !== -1 && descIdx !== -1, `Expected both flags in: ${cmd}`);
    assert.ok(breakingIdx < descIdx, `Expected --breaking before --breaking-description in: ${cmd}`);
  });

  test('omits --breaking-description when empty or whitespace', () => {
    const cmd1 = new TbdflowCommandBuilder().commit({ type: 'feat', message: 'x', breakingDescription: '' });
    const cmd2 = new TbdflowCommandBuilder().commit({ type: 'feat', message: 'x', breakingDescription: '   ' });
    assert.strictEqual(cmd1.includes('--breaking-description'), false);
    assert.strictEqual(cmd2.includes('--breaking-description'), false);
  });
});

suite('TbdflowCommandBuilder - complete', () => {
  test('builds minimal complete command with type and name', () => {
    const cmd = new TbdflowCommandBuilder().complete({
      type: 'feature',
      name: 'user-profile-page'
    });
    assert.strictEqual(cmd, 'tbdflow complete --type "feature" --name "user-profile-page"');
  });

  test('orders flags: --type, --name', () => {
    const cmd = new TbdflowCommandBuilder().complete({ type: 'release', name: '1.2.0' });
    const t = cmd.indexOf('--type');
    const n = cmd.indexOf('--name');
    assert.ok(t !== -1 && n !== -1, `Expected both flags in: ${cmd}`);
    assert.ok(t < n, `Expected --type before --name in: ${cmd}`);
  });

  test('escapes special characters in name', () => {
    const cmd = new TbdflowCommandBuilder().complete({ type: 'feat', name: 'say "hi" costs $5 \\ path' });
    assert.ok(
      cmd.includes('--name "say \\\"hi\\\" costs \\\$5 \\\\ path"'),
      `Expected escaped value in: ${cmd}`
    );
  });
});

suite('TbdflowCommandBuilder - changelog', () => {
  test('builds --unreleased changelog command', () => {
    const cmd = new TbdflowCommandBuilder().changelog({ unreleased: true });
    assert.strictEqual(cmd, 'tbdflow changelog --unreleased');
  });

  test('builds changelog with --from only', () => {
    const cmd = new TbdflowCommandBuilder().changelog({ from: 'v1.0.0' });
    assert.strictEqual(cmd, 'tbdflow changelog --from "v1.0.0"');
  });

  test('builds changelog with --from and --to in order', () => {
    const cmd = new TbdflowCommandBuilder().changelog({ from: 'v1.0.0', to: 'v2.0.0' });
    assert.strictEqual(cmd, 'tbdflow changelog --from "v1.0.0" --to "v2.0.0"');
  });

  test('escapes special characters in refs', () => {
    const cmd = new TbdflowCommandBuilder().changelog({ from: 'tag"1', to: 'cost $5 \\ back' });
    assert.ok(cmd.includes('--from "tag\\\"1"'), `Expected escaped from in: ${cmd}`);
    assert.ok(cmd.includes('--to "cost \\\$5 \\\\ back"'), `Expected escaped to in: ${cmd}`);
  });
});

suite('TbdflowCommandBuilder - branch', () => {
  test('builds minimal branch command with type and name', () => {
    const cmd = new TbdflowCommandBuilder().branch({
      type: 'feature',
      name: 'cool-stuff'
    });
    assert.strictEqual(cmd, 'tbdflow branch --type "feature" --name "cool-stuff"');
  });

  test('includes optional --issue when provided (quoted)', () => {
    const cmd = new TbdflowCommandBuilder().branch({
      type: 'feat',
      name: 'api-refactor',
      issue: 'PROJ-123'
    });
    assert.ok(cmd.includes('--issue "PROJ-123"'), `Expected --issue in: ${cmd}`);
  });

  test('omits --issue when empty or whitespace', () => {
    const cmd1 = new TbdflowCommandBuilder().branch({ type: 'feat', name: 'x', issue: '' });
    const cmd2 = new TbdflowCommandBuilder().branch({ type: 'feat', name: 'x', issue: '   ' });
    assert.strictEqual(cmd1.includes('--issue'), false, `Did not expect --issue in: ${cmd1}`);
    assert.strictEqual(cmd2.includes('--issue'), false, `Did not expect --issue in: ${cmd2}`);
  });

  test('includes optional --from-commit when provided (quoted)', () => {
    const cmd = new TbdflowCommandBuilder().branch({
      type: 'fix',
      name: 'hotfix-1',
      fromCommit: 'deadbeef'
    });
    assert.ok(cmd.includes('--from-commit "deadbeef"'), `Expected --from-commit in: ${cmd}`);
  });

  test('omits --from-commit when empty or whitespace', () => {
    const cmd1 = new TbdflowCommandBuilder().branch({ type: 'fix', name: 'y', fromCommit: '' });
    const cmd2 = new TbdflowCommandBuilder().branch({ type: 'fix', name: 'y', fromCommit: '   ' });
    assert.strictEqual(cmd1.includes('--from-commit'), false, `Did not expect --from-commit in: ${cmd1}`);
    assert.strictEqual(cmd2.includes('--from-commit'), false, `Did not expect --from-commit in: ${cmd2}`);
  });

  test('orders flags: --type, --name, --issue, --from-commit', () => {
    const cmd = new TbdflowCommandBuilder().branch({
      type: 'feat',
      name: 'cool',
      issue: 'ABC-9',
      fromCommit: '1234567'
    });
    const t = cmd.indexOf('--type');
    const n = cmd.indexOf('--name');
    const i = cmd.indexOf('--issue');
    const f = cmd.indexOf('--from-commit');
    assert.ok(t !== -1 && n !== -1 && i !== -1 && f !== -1, `Expected all flags in: ${cmd}`);
    assert.ok(t < n && n < i && i < f, `Expected proper flag order in: ${cmd}`);
  });

  test('escapes quotes, dollar, and backslash in name', () => {
    const cmd = new TbdflowCommandBuilder().branch({
      type: 'feat',
      name: 'say "hi" costs $5 \\ path'
    });
    assert.ok(
      cmd.includes('--name "say \\\"hi\\\" costs \\\$5 \\\\ path"'),
      `Expected escaped value in: ${cmd}`
    );
  });
});

suite('TbdflowCommandBuilder - sync', () => {
  test('builds sync command', () => {
    const cmd = new TbdflowCommandBuilder().sync();
    assert.strictEqual(cmd, 'tbdflow sync');
  });
});

suite('TbdflowCommandBuilder - status', () => {
  test('builds status command', () => {
    const cmd = new TbdflowCommandBuilder().status();
    assert.strictEqual(cmd, 'tbdflow status');
  });
});

suite('TbdflowCommandBuilder - current-branch', () => {
  test('builds current-branch command', () => {
    const cmd = new TbdflowCommandBuilder().currentBranch();
    assert.strictEqual(cmd, 'tbdflow current-branch');
  });
});
