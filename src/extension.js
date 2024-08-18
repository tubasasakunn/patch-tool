"use strict";
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (
          !desc ||
          ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)
        ) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }
    : function (o, v) {
        o["default"] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
      for (var k in mod)
        if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const child_process = __importStar(require("child_process"));
function activate(context) {
  const provider = new DiffPatcherViewProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      DiffPatcherViewProvider.viewType,
      provider
    )
  );
  let disposable = vscode.commands.registerCommand(
    "diffpatcher.applyPatch",
    () => {
      provider.applyPatch();
    }
  );
  context.subscriptions.push(disposable);
}
exports.activate = activate;
class DiffPatcherViewProvider {
  _extensionUri;
  static viewType = "diffPatcher.patcherView";
  _view;
  constructor(_extensionUri) {
    this._extensionUri = _extensionUri;
  }
  resolveWebviewView(webviewView, context, _token) {
    this._view = webviewView;
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };
    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
    webviewView.webview.onDidReceiveMessage((data) => {
      switch (data.type) {
        case "patchContent":
          this._patchContent = data.value;
          break;
      }
    });
  }
  _patchContent = "";
  applyPatch() {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const filePath = editor.document.uri.fsPath;
      const tempFile = vscode.Uri.parse(`untitled:${filePath}.patch`);
      vscode.workspace.openTextDocument(tempFile).then((document) => {
        vscode.window
          .showTextDocument(document, { preview: false })
          .then((editor) => {
            editor
              .edit((editBuilder) => {
                editBuilder.insert(
                  new vscode.Position(0, 0),
                  this._patchContent
                );
              })
              .then(() => {
                document.save().then(() => {
                  this._executePatchCommand(filePath, tempFile.fsPath);
                });
              });
          });
      });
    }
  }
  _executePatchCommand(filePath, patchPath) {
    const command = `patch "${filePath}" "${patchPath}"`;
    child_process.exec(command, (error, stdout, stderr) => {
      if (error) {
        vscode.window.showErrorMessage(
          `Failed to apply patch: ${error.message}`
        );
        return;
      }
      vscode.window.showInformationMessage("Patch applied successfully");
    });
  }
  _getHtmlForWebview(webview) {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "main.js")
    );
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "style.css")
    );
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
//# sourceMappingURL=extension.js.map
