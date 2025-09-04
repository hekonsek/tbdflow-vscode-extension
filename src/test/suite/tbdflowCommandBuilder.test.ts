import * as assert from 'assert';
import { TbdflowCommandBuilder } from '../../tbdflowCommandBuilder';

suite('TbdflowCommandBuilder', () => {
  test('commit without scope includes no-verify', () => {
    const cmd = new TbdflowCommandBuilder().commit({ type: 'feat', message: 'add stuff', noVerify: true });
    assert.strictEqual(cmd, 'tbdflow commit --no-verify --type "feat" --message "add stuff"');
  });

  test('commit with scope at the end', () => {
    const cmd = new TbdflowCommandBuilder().commit({ type: 'feat', message: 'add', scope: 'api', noVerify: true });
    assert.strictEqual(cmd, 'tbdflow commit --no-verify --type "feat" --message "add" --scope "api"');
  });

  test('commit quotes special characters', () => {
    const cmd = new TbdflowCommandBuilder().commit({ type: 'f"e', message: 'm$g', scope: 'p`th\\x', body: 'b"o$d`y', noVerify: true });
    assert.strictEqual(cmd, 'tbdflow commit --no-verify --type "f\\"e" --message "m\\$g" --scope "p\\`th\\\\x" --body "b\\"o\\$d\\`y"');
  });

  test('commit with body at the end', () => {
    const cmd = new TbdflowCommandBuilder().commit({ type: 'feat', message: 'add', body: 'details', noVerify: true });
    assert.strictEqual(cmd, 'tbdflow commit --no-verify --type "feat" --message "add" --body "details"');
  });

  test('commit with issue and tag at the end', () => {
    const cmd = new TbdflowCommandBuilder().commit({ type: 'feat', message: 'add', issue: 'JIRA-123', tag: 'v1.2.3', noVerify: true });
    assert.strictEqual(cmd, 'tbdflow commit --no-verify --type "feat" --message "add" --issue "JIRA-123" --tag "v1.2.3"');
  });

  test('commit with all options keeps order', () => {
    const cmd = new TbdflowCommandBuilder().commit({ type: 'feat', message: 'add', scope: 'api', body: 'details', issue: 'ABC-1', tag: 'rc', noVerify: true });
    assert.strictEqual(cmd, 'tbdflow commit --no-verify --type "feat" --message "add" --scope "api" --body "details" --issue "ABC-1" --tag "rc"');
  });
});
