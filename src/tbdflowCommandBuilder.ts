export type CommitOptions = {
  type: string;
  message: string;
  scope?: string;
  body?: string;
  noVerify?: boolean;
};

export class TbdflowCommandBuilder {
  private quote(s: string): string {
    return '"' + String(s).replace(/["\\$`]/g, (r) => '\\' + r) + '"';
  }

  commit(opts: CommitOptions): string {
    const parts: string[] = [
      'tbdflow',
      'commit'
    ];

    if (opts.noVerify) {
      parts.push('--no-verify');
    }

    parts.push('--type', this.quote(opts.type));
    parts.push('--message', this.quote(opts.message));

    if (opts.scope && opts.scope.trim().length > 0) {
      parts.push('--scope', this.quote(opts.scope));
    }

    if (opts.body && opts.body.trim().length > 0) {
      parts.push('--body', this.quote(opts.body));
    }

    return parts.join(' ');
  }
}
