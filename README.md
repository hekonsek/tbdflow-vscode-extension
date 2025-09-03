# tbdflow Code plugin

Simple VS Code extension that adds a "tbdflow" button to the Activity Bar (left side). Clicking it opens a sidebar panel with two single-line inputs (Type and Message) and a Commit button.

## Install / Run from Source

- Prerequisite: Install Visual Studio Code.
- Open this folder in VS Code.
- Run the extension:
  - Press `F5` (or go to `Run and Debug` and start "Run Extension").
  - A new "Extension Development Host" window opens.
- In the new window, click the `tbdflow` icon in the Activity Bar. You should see a small form with Type, Message, and a Commit button. Submitting shows a confirmation toast.

## Optional: Package as VSIX

If you want a distributable `.vsix`:

- Install `vsce` (`npm i -g @vscode/vsce`).
- Run `vsce package` in this folder to generate a `.vsix`.
- In VS Code, use `Extensions` panel menu → `Install from VSIX...` and select the generated file.

## Project Structure

- `package.json`: Extension manifest and contributions (Activity Bar view).
- `extension.js`: Activation and Webview content provider (renders the Type/Message form and handles Commit clicks).
- `media/tbdflow.svg`: Activity Bar icon.
- `.vscode/launch.json`: Debug configuration to run the extension.
