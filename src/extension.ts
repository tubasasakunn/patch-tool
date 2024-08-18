import * as vscode from 'vscode';
import * as child_process from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
    const provider = new DiffPatcherViewProvider(context.extensionUri);

    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider("diffPatcher.patcherView", provider)
    );

    let disposable = vscode.commands.registerCommand('diffpatcher.applyPatch', () => {
        provider.applyPatch();
    });

    context.subscriptions.push(disposable);
}

class DiffPatcherViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'diffPatcher.patcherView';

    private _view?: vscode.WebviewView;

    constructor(
        private readonly _extensionUri: vscode.Uri,
    ) { }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                this._extensionUri
            ]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        webviewView.webview.onDidReceiveMessage(data => {
            switch (data.type) {
                case 'patchContent':
                    this._patchContent = data.value;
                    break;
                case 'applyPatch':
                    this.applyPatch();
                    break;
            }
        });
    }

    private _patchContent: string = '';

    public applyPatch() {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const filePath = editor.document.uri.fsPath;
            const patchContent = this._patchContent;
            
            if (!patchContent) {
                vscode.window.showErrorMessage('No patch content available');
                return;
            }

            const tempDir = path.join(vscode.workspace.rootPath || '', '.vscode');
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir);
            }
            const tempFilePath = path.join(tempDir, 'temp.patch');

            fs.writeFileSync(tempFilePath, patchContent);

            this._executePatchCommand(filePath, tempFilePath);
        } else {
            vscode.window.showErrorMessage('No active text editor');
        }
    }

    private _executePatchCommand(filePath: string, patchPath: string) {
        const command = `patch "${filePath}" "${patchPath}"`;
        child_process.exec(command, (error: child_process.ExecException | null, stdout: string, stderr: string) => {
            if (error) {
                vscode.window.showErrorMessage(`Failed to apply patch: ${error.message}`);
                return;
            }
            vscode.window.showInformationMessage('Patch applied successfully');
            fs.unlinkSync(patchPath); // Clean up temporary patch file
        });
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js'));
        const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'style.css'));

        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="${styleUri}" rel="stylesheet">
                <title>Diff Patcher</title>
            </head>
            <body>
                <textarea id="patch-input" rows="10" cols="50" placeholder="Enter your diff here..."></textarea>
                <button id="apply-patch">Apply Patch</button>
                <script src="${scriptUri}"></script>
            </body>
            </html>`;
    }
}