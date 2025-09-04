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

