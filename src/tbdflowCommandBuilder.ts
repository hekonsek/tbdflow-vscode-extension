export type CommitOptions = {
  type: string;
  message: string;
  scope?: string;
  body?: string;
  issue?: string;
  tag?: string;
  breaking?: boolean;
  breakingDescription?: string;
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

    if (opts.issue && opts.issue.trim().length > 0) {
      parts.push('--issue', this.quote(opts.issue));
    }

    if (opts.tag && opts.tag.trim().length > 0) {
      parts.push('--tag', this.quote(opts.tag));
    }

    if (opts.breaking) {
      parts.push('--breaking');
    }

    if (opts.breakingDescription && opts.breakingDescription.trim().length > 0) {
      parts.push('--breaking-description', this.quote(opts.breakingDescription));
    }

    return parts.join(' ');
  }

  // tbdflow branch --type <TYPE> --name <NAME> [--issue <ISSUE>] [--from-commit <FROM_COMMIT>]
  branch(opts: { type: string; name: string; issue?: string; fromCommit?: string; }): string {
    const parts: string[] = [
      'tbdflow',
      'branch'
    ];

    parts.push('--type', this.quote(opts.type));
    parts.push('--name', this.quote(opts.name));

    if (opts.issue && opts.issue.trim().length > 0) {
      parts.push('--issue', this.quote(opts.issue));
    }

    if (opts.fromCommit && opts.fromCommit.trim().length > 0) {
      parts.push('--from-commit', this.quote(opts.fromCommit));
    }

    return parts.join(' ');
  }

  // tbdflow complete --type <TYPE> --name <NAME>
  complete(opts: { type: string; name: string; }): string {
    const parts: string[] = [
      'tbdflow',
      'complete'
    ];

    parts.push('--type', this.quote(opts.type));
    parts.push('--name', this.quote(opts.name));

    return parts.join(' ');
  }
}
