import * as vscode from 'vscode';

import { Disposable, Webview, WebviewPanel, window, Uri, ViewColumn } from "vscode";
import { getUri } from "../utilities/getUri";
//import { getNonce } from "../../utils/getNonce";
import { SqlmapDataExplorer, Dependency } from './sqlmapDataExplorer';

import { SqlConfigService } from "../modules/db/service/SqlConfigService";
import { U2CSQLMAPCONFIG } from "../types/SqlConfig";

let cfg: Map<string, string> = new Map();
let cfgString = '';
let dataAttributes = ''
let sendToCommand: U2CSQLMAPCONFIG[];
export class SqlconfigExplorer {

  constructor(context: vscode.ExtensionContext, sqlmapDataExplorer: SqlmapDataExplorer) {
    console.log('ALM#2-1 class SqlconfigExplorer constructor')
    
    const configProvider = new SqlconfigProvider(context.extensionUri, sqlmapDataExplorer);

    context.subscriptions.push(
      vscode.window.registerWebviewViewProvider(SqlconfigProvider.viewType, configProvider
      ));
    
      
  }
  public getSqlConfig():U2CSQLMAPCONFIG[]{
    console.log('ALM#3 NAMESPACE 구현 [sendToCommand] <- ',sendToCommand)
    return sendToCommand
  }
}

class SqlconfigProvider implements vscode.WebviewViewProvider {

  public static readonly viewType = 'sqlconfigExplorer';
  public static currentWvVProvider: SqlconfigProvider | undefined;
  private _view: vscode.WebviewView | undefined;
  private _disposables: vscode.Disposable[] = [];
  private _sqlmapDataExplorer?: SqlmapDataExplorer;
  
  
  constructor(private readonly _extensionUri: vscode.Uri, sqlmapDataExplorer: SqlmapDataExplorer) {
    console.log('ALM#2-1 class SqlconfigProvider constructor')
    if (SqlmapDataExplorer) {
      //await new Promise(resolve => setTimeout(resolve, 1000));
      //this.initialize(sqlmapDataExplorer);
      // this.getSQLConfigLists()
      this._sqlmapDataExplorer = sqlmapDataExplorer
      
      this._sqlmapDataExplorer.onMessage((message: string) => {
        console.log('ALM#2-1 class SqlconfigProvider constructor : onMessage : Received message :', message)
        vscode.window.showInformationMessage(`ALM#2-1 class SqlconfigProvider Received message: ${message}`)
      });
    }
  }
  
  public async resolveWebviewView(//IB20 SQLMAP CONFIG WEBVIEW 생성
  webviewView: vscode.WebviewView,
  context: vscode.WebviewViewResolveContext,
  token: vscode.CancellationToken
  ) {
    
    this._view = webviewView;
    
    //webviewView.webview.options = {
      this._view.webview.options = {
        enableScripts: true,
        localResourceRoots: [
        //this._extensionUri
        vscode.Uri.joinPath(this._extensionUri, 'out')
      ]
    };
    
    
    this._view.webview.html = await this.initialize(webviewView.webview, this._extensionUri)
    
    
    this._view.webview.onDidReceiveMessage((message) => {
      //console.log(` !!! 선택 했다 !!! : Received selected option: ` + message.queryList);
      console.log(` !!! 선택 했다 !!! : Received selected option: ` + message.selectedConfig);
      if (message.type === 'myEvent' && this._sqlmapDataExplorer) {
        this._sqlmapDataExplorer.handleMessage(message.selectedConfig);
      } 
    });
    //TO DO select 된 sqlconfig값을 sqlmapDataExplorere에 postMessage...
    this._view.webview.postMessage({ command: 'cfgList', payload: sendToCommand});

  }
  
  
  private _getHtmlForWebView(webview: vscode.Webview, extensionUri: Uri) {
    
    console.log('ALM#2-1 [1] [_getHtmlForWebView] ')
    //정의된 javascript를 통해, html 동적으로 dropdown 항목 만들어주기.
    const srcUri = getUri(webview, extensionUri, ["src/ui", "getsqlconfigLists.js"]);//TO DO 안쓰므로 제거처리
    console.log('ALM#2-1 [2] [_getHtmlForWebView]srcUri:', srcUri)
    console.log('ALM#2-1 [3] [_getHtmlForWebView]cfg.size:', cfg.size)
    
    for (let [key,value] of cfg.entries()){
      cfgString += `<option id="${value}" value="${value}" data-id="${key}">${value}</option>`
      console.log('ALM#2-1 [4] [_getHtmlForWebView]cfg->cfgString key,value:', key, value)
    }
    
    //<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; font-src ${webview.cspSource}; img-src ${webview.cspSource} https:;">
    return /*html*/ `
          <!DOCTYPE html>
      <html lang="en">

      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width,initial-scale=1.0">
          <script type="module" src="${srcUri}"></script>
          <script>

            const vscode = acquireVsCodeApi()
            
            document.addEventListener("DOMContentLoaded", function(){

              console.log('ALM#2-1 [5]-[1] [_getHtmlForWebView] DOMContentLoaded ')
              
              let el = document.getElementById("sqlconfig-list-dropdown")

              if(el){
                  let cfgsEl = document.querySelector("#sqlconfig-list-dropdown");
                  
                  el.addEventListener('change', (event) => {
                    //const selectedOption = event.value;
                    const _el = document.getElementsByClassName("sqlconfig-list-dropdown")[0]
                    const selectOptId = _el.options[event.currentTarget.selectedIndex].id
                    const selectOptVal = _el.options[event.currentTarget.selectedIndex].value
                    const selectOptDataId = _el.options[event.currentTarget.selectedIndex].dataset.id

                    console.log('ALM#2-1-1 _getHtmlForWebView addEventListener 감지 -> selectOptId:',selectOptId)//CONFIG
                    console.log('ALM#2-1-1 _getHtmlForWebView addEventListener 감지 -> selectOptVal:',selectOptVal)//NAME
                    console.log('ALM#2-1-1 _getHtmlForWebView addEventListener 감지 -> selectOptDataId:',selectOptDataId)//CONFIG_ID
                    
                    //TO DO key, value 쌍으로 queryList 전달
                    let _queryList = [
                      {
                        CONFIG: selectOptVal,
                        NAME: selectOptId,
                        SQLNAME: "selMgtCmCd",
                        SQL_0: "select * from isb_app.mgt_db"

                      },
                      {
                        CONFIG: selectOptVal,
                        NAME: selectOptId,
                        SQLNAME: "updMgtCmCd",
                        SQL_0: "update * from isb_app.mgt_db"

                      },
                      {
                        CONFIG: selectOptVal,
                        NAME: selectOptId,
                        SQLNAME: "insMgtCmCd",
                        SQL_0: "insert * from isb_app.mgt_db"

                      }
                    ]
                    let selectedConfig = {
                      CONFIG_NAME : selectOptVal,
                      CONFIG_ID : selectOptDataId
                    }
                    //vscode.postMessage({ type: 'myEvent', queryList: _queryList}, '*');
                    vscode.postMessage({ type: 'myEvent', selectedConfig: selectedConfig}, '*');
                    
                  })
                }              

                
            })

          </script>
          <title>IB20 SQL Config</title>
      </head>

      <body>
          <div class="sqlconfig-list">
              <label for="my-dropdown">Choose SQL CONFIG:</label>
              <select class="sqlconfig-list-dropdown" id="sqlconfig-list-dropdown" >
                  <option value="">--Please choose an option--</option>
                  ${cfgString}
              </select>
          </div>
          <p></p>
          <div class="sqlnmspace-list" id="sqlnmspace-list">
          
          </div>         
      </body>

      </html>`;

  }

  private async initialize(webview: vscode.Webview, extensionUri: Uri) {
    await this.getSQLConfigLists();
    return this._getHtmlForWebView(webview, extensionUri);    
  }
  private async getSQLConfigLists() {

    let u2cconfigList: U2CSQLMAPCONFIG[];

    console.log('ALM#2-1 [Get Data From DB][1] 쿼리 Req')
    u2cconfigList = await SqlConfigService.selectSqlConfig();
    
    //let item: Map<string, string> = new Map();
    if (u2cconfigList.length) {
      u2cconfigList.map((row: any) => {
        console.log('ALM#2-1 [Get Data From DB][2] Result:DB to MAP::' + row.CONFIG_ID + '::' + row.CONFIG_NAME);
        cfg.set(row.CONFIG_ID, row.CONFIG_NAME);
      })
    } else {
      console.log('ALM#2-1 [Get Data From DB][2] FAIL => 데이터가 없습니다 !!! ')
    }

    //cfg = item;
    //sendToCommand = u2cconfigList
    this.setSqlConfig(u2cconfigList);
    console.log('ALM#2-1 [Get Data From DB][3] ... _getHtmlForWebView cfg:', cfg.size)

  }
  public setSqlConfig(u2cconfigList: any){
    
    console.log('ALM#3 NAMESPACE 구현 [setSqlConfig] <- ',u2cconfigList)
    sendToCommand = u2cconfigList
     
  }
  
}



