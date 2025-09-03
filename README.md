# tbdflow VS Code extension

Simple VS Code extension for [tbdflow](https://github.com/cladam/tbdflow). Main features added by this extension include:
- "tbdflow commit" button to the Activity Bar

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

## Optional: Package as VSIX

If you want a distributable `.vsix`:

- Install `vsce` (`npm i -g @vscode/vsce`).
- Run `vsce package` in this folder to generate a `.vsix`.
- In VS Code, use `Extensions` panel menu → `Install from VSIX...` and select the generated file.

## Project Structure

- `package.json`: Extension manifest and contributions (Activity Bar view).
- `src/extension.ts`: Activation and Webview content provider (renders the Type/Message form and handles Commit clicks).
- `media/tbdflow.svg`: Activity Bar icon.
- `tsconfig.json`: TypeScript configuration; outputs to `out/`.
- `.vscode/launch.json`: Debug configuration to run + watch-compile the extension.

## Testing & Linting

- Run unit tests:
  - Using CLI: `npm test` (downloads VS Code test runner and executes Mocha suite)
  - From VS Code: use the `Extension Tests` launch configuration
- Lint the code: `npm run lint` (or `npm run lint:fix`)
