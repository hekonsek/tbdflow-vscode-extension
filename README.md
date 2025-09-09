# tbdflow VS Code extension

Simple VS Code extension for [tbdflow](https://github.com/cladam/tbdflow). Main features added by this extension are:
- `tbdflow commit` Activity Bar
- Commands:
    - `tbdflow: New Branch`

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