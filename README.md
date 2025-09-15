# tbdflow VS Code extension

Simple VS Code extension for [tbdflow](https://github.com/cladam/tbdflow). Main features added by this extension are:
- `tbdflow commit` Activity Bar
- Commands:
    - `tbdflow: New Branch`
    - `tbdflow: Complete Branch`
    - `tbdflow: Sync`
    - `tbdflow: Generate Changelog`
    - `tbdflow: Status`
    - `tbdflow: Current Branch`
    - `tbdflow: Check Stale Branches`

## Git‑project awareness

The extension can hide its commands and the commit view unless the current workspace is a Git repository.

- Setting: `tbdflow.gitProjectAwareness.enabled` (default: `true`)
- When disabled, all commands and the view are always visible.
- While debugging the extension (Run Extension / F5), this awareness is automatically disabled so you can always see the commands.

##  Local development

You can start local development of this extension by cloning this project and opening Code in it:

```bash
git clone git@github.com:hekonsek/tbdflow-vscode-extension.git
cd tbdflow-vscode-extension
code .
```

Next step is to install dev dependencies and build:

```bash
npm install
```

Finally press `F5` (or go to `Run and Debug` and start "Run Extension"). A new "Extension Development Host" window should open now. In the new window, click the `tbdflow` icon in the Activity Bar. That's it! That is your plugin running in local development mode 😊 .

In order to run project's tests locally run the following command:

```bash
npm test
```
