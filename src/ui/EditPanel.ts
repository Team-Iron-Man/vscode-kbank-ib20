import * as vscode from 'vscode';
import {QueryService} from "../modules/db/service/QueryService";
import { getUri } from "../utilities/getUri";
import { SqlEdit } from "../types/SqlEdit";
import { getNonce } from "../utilities/getNonce";

function getWebviewOptions(extensionUri: vscode.Uri): vscode.WebviewOptions {
  return {
    enableScripts: true,
    localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'out')]
  };
}

class CatCodingPanel {
  public static currentPanel: CatCodingPanel | undefined;
  public static readonly viewType = 'sqlEdit';
  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private _disposables: vscode.Disposable[] = [];
  private _sqlEdit: SqlEdit;

  public static createOrShow(extensionUri: vscode.Uri, sqlEdit: SqlEdit) {
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

    CatCodingPanel.currentPanel = new CatCodingPanel(panel, extensionUri, sqlEdit);

  }

  public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, sqlEdit: SqlEdit) {
    CatCodingPanel.currentPanel = new CatCodingPanel(panel, extensionUri, sqlEdit);
  }

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, sqlEdit: SqlEdit) {
    this._panel = panel;
    this._extensionUri = extensionUri;
    this._sqlEdit = sqlEdit;
    this._update();
    //패널을 닫거나 확장 프로그램이 프로그래밍 방식으로 닫아 웹 보기 패널을 삭제할 때 트리거되는 콜백 함수
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
    //패널의 가시성 상태가 변경될 때마다 함수가 호출됨
    this._panel.onDidChangeViewState(
      e => {
        if (this._panel.visible) {
          this._update();
        }
      },
      null,
      this._disposables
    );
    //패널에서 메시지를 수신하면 트리거되는 콜백 함수입니다.
    this._panel.webview.onDidReceiveMessage(
      message => {
        switch (message.command) {
          case 'error':
            vscode.window.showErrorMessage(message.text);
            return;
          case 'info':
            vscode.window.showInformationMessage(message.text);
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
        this._updateForCat(webview);
        return;
        case vscode.ViewColumn.Three:
            this._updateForCat(webview);
            return;
        
          case vscode.ViewColumn.One:
          default:
            this._updateForCat(webview);
            return;
        }
    }

    private _updateForCat(webview: vscode.Webview) {
        this._panel.title = this._sqlEdit.id;
        this._panel.webview.html = this._getHtmlForWebview(webview);
    }
    
    private _getHtmlForWebview(webview: vscode.Webview) {

        // const scriptPathOnDisk = vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js');
        // const scriptUri = webview.asWebviewUri(scriptPathOnDisk);
        // const styleResetPath = vscode.Uri.joinPath(this._extensionUri, 'media', 'reset.css');
        // const stylesPathMainPath = vscode.Uri.joinPath(this._extensionUri, 'media', 'vscode.css');
        // const stylesResetUri = webview.asWebviewUri(styleResetPath);
        // const stylesMainUri = webview.asWebviewUri(stylesPathMainPath);
        console.log("extensionUri: ",this._extensionUri);
        const webviewUri = getUri(webview, this._extensionUri, ["out", "webview.js"]);
        const styleUri = getUri(webview, this._extensionUri, ["out", "style.css"]);
        const codiconUri = getUri(webview, this._extensionUri, ["out", "codicon.css"]);
        const nonce = getNonce();
        
        webview.onDidReceiveMessage((message) => {
            vscode.window.showInformationMessage(`Received message: ${message}`);
            const command = message.command;
            switch (command) {
            case "requestNoteData":
                webview.postMessage({
                command: "receiveDataInWebview",
                payload: JSON.stringify(this._sqlEdit),
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
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; font-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
                <link rel="stylesheet" href="${styleUri}">
                <link rel="stylesheet" href="${codiconUri}">
                <title>${this._sqlEdit.id}</title>
            </head>
            <body>
              <header>

              </header>
              <section id="notes-form">
              <vscode-divider role="separator"></vscode-divider>
                            
              <div class="container">
                <label for="type-dropdown">ID*</label>    
                <vscode-text-field id="title" value="${this._sqlEdit.id}" type="text" size="30"></vscode-text-field>                                              
                <label for="type-dropdown">TYPE*</label>
                <vscode-dropdown id="type-dropdown">
                  <vscode-option value="SELECT">SELECT</vscode-option>
                  <vscode-option value="UPDATE" selected>UPDATE</vscode-option>
                  <vscode-option value="INSERT">INSERT</vscode-option>
                  <vscode-option value="DELETE">DELETE</vscode-option>
                </vscode-dropdown>
                <label slot="label">USE*</label>
                <vscode-radio-group>
                  <vscode-radio value="Y" checked>Y</vscode-radio>
                  <vscode-radio value="N">N</vscode-radio>
                </vscode-radio-group>                                
              </div>

                <vscode-text-area id="editor" value="${this._sqlEdit.sql}" placeholder="sql" resize="vertical" rows=10>Query</vscode-text-area>                

                <vscode-divider role="presentation"></vscode-divider>
                
                <div class="container">
                  <label for="info-dropdown">DB Info*</label>
                  <vscode-dropdown id="info-dropdown">
                    <vscode-option>isb_frw</vscode-option>
                    <vscode-option>cbz_frw</vscode-option>                  
                  </vscode-dropdown>

                  <vscode-button id="submit-button1" appearance="Secondary">Set Param
                    <span slot="start" class="codicon codicon-add"></span>
                  </vscode-button>

                  <vscode-button id="submit-button2" appearance="Secondary">Query Test
                    <span slot="start" class="codicon codicon-beaker"></span>                                    
                  </vscode-button>
                  <vscode-button id="submit-button3" appearance="Primary">Query Save
                    <span slot="start" class="codicon codicon-save"></span>                  
                  </vscode-button>                  
                </div>

                <div id="paramContainer">
                  <div>
                    <vscode-text-field type="text" readonly>Parameter</vscode-text-field>
                    <vscode-text-field type="text">Value</vscode-text-field>
                    <vscode-text-field type="text">Data Type</vscode-text-field>
                  </div>
                </div>

                <vscode-divider role="separator"></vscode-divider>
                <vscode-text-area id="description"value="" placeholder="" resize="vertical" rows=5>Description</vscode-text-area>

              </section>
              <script type="module" nonce="${nonce}" src="${webviewUri}"></script>
            </body>
          </html>
        `;
    }
}

async function comman_2(){
	const data = await QueryService.selectSqlMapSeq();
	console.log(data);
}

export default CatCodingPanel;