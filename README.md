# tbdflow Code plugin

Simple VS Code extension that adds a "tbdflow" button to the Activity Bar (left side). Clicking it opens a sidebar panel with three single-line inputs (Type, optional Scope, and Message) and a Commit button.

## Install / Run from Source

- Prerequisite: Install Visual Studio Code.
- Open this folder in VS Code.
- Install dev dependencies and build:
  - `npm install`
  - `npm run compile` (or just press `F5`, which runs the watch build)
- Run the extension:
  - Press `F5` (or go to `Run and Debug` and start "Run Extension"). A watch build runs automatically.
  - A new "Extension Development Host" window opens.
- In the new window, click the `tbdflow` icon in the Activity Bar. You should see a small form with Type, optional Scope, Message, and a Commit button. Submitting runs `tbdflow commit --type <type> [--scope <scope>] --message <message>` and displays the command output at the bottom of the panel.

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
