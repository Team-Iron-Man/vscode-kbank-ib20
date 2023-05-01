import * as vscode from 'vscode';
import {QueryService} from "../modules/db/service/QueryService";
import { getUri } from "../utilities/getUri";

const cats = {
  'Coding Cat': 'https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif',
  'Compiling Cat': 'https://media.giphy.com/media/mlvseq9yvZhba/giphy.gif',
  'Testing Cat': 'https://media.giphy.com/media/3oriO0OEd9QIDdllqo/giphy.gif'
};

function getWebviewOptions(extensionUri: vscode.Uri): vscode.WebviewOptions {
  return {
    enableScripts: true,
    localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')]
  };
}

class CatCodingPanel {
  public static currentPanel: CatCodingPanel | undefined;
  public static readonly viewType = 'catCoding';
  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private _disposables: vscode.Disposable[] = [];

  public static createOrShow(extensionUri: vscode.Uri) {
    comman_2();
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    if (CatCodingPanel.currentPanel) {
      CatCodingPanel.currentPanel._panel.reveal(column);
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      CatCodingPanel.viewType,
      'Cat Coding',
      column || vscode.ViewColumn.One,
      getWebviewOptions(extensionUri),
    );

    CatCodingPanel.currentPanel = new CatCodingPanel(panel, extensionUri);

  }

  public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    CatCodingPanel.currentPanel = new CatCodingPanel(panel, extensionUri);
  }

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this._panel = panel;
    this._extensionUri = extensionUri;
    this._update();
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
    this._panel.onDidChangeViewState(
      e => {
        if (this._panel.visible) {
          this._update();
        }
      },
      null,
      this._disposables
    );
    this._panel.webview.onDidReceiveMessage(
      message => {
        switch (message.command) {
          case 'alert':
            vscode.window.showErrorMessage(message.text);
            return;
        }
      },
      null,
      this._disposables
    );
  }

  public doRefactor() {
    this._panel.webview.postMessage({ command: 'refactor' });
  }

  public dispose() {
    CatCodingPanel.currentPanel = undefined;
    this._panel.dispose();
    while (this._disposables.length) {
      const x = this._disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }

  private _update() {
    const webview = this._panel.webview;
    switch (this._panel.viewColumn) {
      case vscode.ViewColumn.Two:
        this._updateForCat(webview, 'Compiling Cat');
        return;
        case vscode.ViewColumn.Three:
            this._updateForCat(webview, 'Testing Cat');
            return;
        
          case vscode.ViewColumn.One:
          default:
            this._updateForCat(webview, 'Coding Cat');
            return;
        }
    }

    private _updateForCat(webview: vscode.Webview, catName: keyof typeof cats) {
        this._panel.title = catName;
        this._panel.webview.html = this._getHtmlForWebview(webview, cats[catName]);
    }
    
    private _getHtmlForWebview(webview: vscode.Webview, catGifPath: string) {
        // const scriptPathOnDisk = vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js');
        // const scriptUri = webview.asWebviewUri(scriptPathOnDisk);
        // const styleResetPath = vscode.Uri.joinPath(this._extensionUri, 'media', 'reset.css');
        // const stylesPathMainPath = vscode.Uri.joinPath(this._extensionUri, 'media', 'vscode.css');
        // const stylesResetUri = webview.asWebviewUri(styleResetPath);
        // const stylesMainUri = webview.asWebviewUri(stylesPathMainPath);
        const webviewUri = getUri(webview, this._extensionUri, ["out", "webview.js"]);
        const styleUri = getUri(webview, this._extensionUri, ["out", "style.css"]);
        const nonce = getNonce();
        
        webview.onDidReceiveMessage((message) => {
            const command = message.command;
            switch (command) {
            case "requestNoteData":
                webview.postMessage({
                command: "receiveDataInWebview",
                // payload: JSON.stringify(note),
                });
                break;
            }
        });

        return /*html*/ `
          <!DOCTYPE html>
          <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta http-equiv="Content-Security-Policy" 'unsafe-inline' content="default-src 'none'; style-src ${webview.cspSource}; img-src ${webview.cspSource} https:; script-src 'nonce-${nonce}';">
                <link rel="stylesheet" href="${styleUri}">
                <title>Query</title>
            </head>
            <body>
              <header>
                <h1>Query</h1>
                <div id="tags-container"></div>
              </header>
              <section id="notes-form">
              <vscode-divider role="separator"></vscode-divider>
              
              <vscode-text-field id="title" value="" placeholder="Enter a name" type="text">Sql Map Id*</vscode-text-field>
              
              <div>
              <label for="type-dropdown">Type:</label>
              <vscode-dropdown id="type-dropdown" position="below">
                    <vscode-option>SELECT</vscode-option>
                    <vscode-option>UPDATE</vscode-option>
                    <vscode-option>INSERT</vscode-option>
                    <vscode-option>UPDATE</vscode-option>
                  </vscode-dropdown>
                  <label for="use-dropdown">Use:</label>
                  <vscode-dropdown id="use-dropdown" position="below">
                  <vscode-option>Y</vscode-option>
                  <vscode-option>N</vscode-option>
                  </vscode-dropdown> 
                </div>

                <vscode-text-area id="editor"value="" placeholder="Write your heart out, Shakespeare!" resize="vertical" rows=15></vscode-text-area>
                <div id="editor" class="monaco-editor-container"></div>
                <vscode-divider role="separator"></vscode-divider>
                
                <label for="info-dropdown">DB Info:</label>
                <vscode-dropdown id="info-dropdown" position="below">
                  <vscode-option>isb_frw</vscode-option>
                  <vscode-option>cbz_frw</vscode-option>
                  <vscode-option>되고 있는거지</vscode-option>
                </vscode-dropdown>
                
                <vscode-data-grid id="basic-grid" aria-label="Basic">
                  <vscode-data-grid-row row-type="header">
                    <vscode-data-grid-cell cell-type="columnheader" grid-column="1">Parameter</vscode-data-grid-cell>
                    <vscode-data-grid-cell cell-type="columnheader" grid-column="2">Value</vscode-data-grid-cell>
                    <vscode-data-grid-cell cell-type="columnheader" grid-column="3">Data Type</vscode-data-grid-cell>
                  </vscode-data-grid-row>
                  <vscode-data-grid-row>
                    <vscode-data-grid-cell grid-column="1">Cell Data</vscode-data-grid-cell>
                    <vscode-data-grid-cell grid-column="2">Cell Data</vscode-data-grid-cell>
                    <vscode-data-grid-cell grid-column="3">Cell Data</vscode-data-grid-cell>
                  </vscode-data-grid-row>
                  <vscode-data-grid-row>
                    <vscode-data-grid-cell grid-column="1">Cell Data</vscode-data-grid-cell>
                    <vscode-data-grid-cell grid-column="2">Cell Data</vscode-data-grid-cell>
                    <vscode-data-grid-cell grid-column="3">Cell Data</vscode-data-grid-cell>
                  </vscode-data-grid-row>
                  <vscode-data-grid-row>
                    <vscode-data-grid-cell grid-column="1">Cell Data</vscode-data-grid-cell>
                    <vscode-data-grid-cell grid-column="2">Cell Data</vscode-data-grid-cell>
                    <vscode-data-grid-cell grid-column="3">Cell Data</vscode-data-grid-cell>
                  </vscode-data-grid-row>
                </vscode-data-grid>
                <div>
                  <vscode-button id="submit-button1">Set Param</vscode-button>
                  <vscode-button id="submit-button2">Query Test</vscode-button>
                </div>
                <vscode-divider role="separator"></vscode-divider>
                <vscode-text-area id="description"value="" placeholder="" resize="vertical" rows=5>Description</vscode-text-area>
                <div>
                  <vscode-button id="submit-button3">Query Save</vscode-button>
                </div>
              </section>
              <script type="module" nonce="${nonce}" src="${webviewUri}"></script>
            </body>
          </html>
        `;
    }
}

function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

async function comman_2(){
	const data = await QueryService.selectSqlMapSeq();
	console.log(data);
}

export default CatCodingPanel;