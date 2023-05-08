import { Webview, Uri } from "vscode";
import { Note } from "../types/Note";
import { getUri } from "../utilities/getUri";
import { getNonce } from "../utilities/getNonce";




/**
 * Defines and returns the HTML that should be rendered within a notepad note view (aka webview panel).
 *
 * @param webview A reference to the extension webview
 * @param extensionUri The URI of the directory containing the extension
 * @param note An object representing a notepad note
 * @returns A template string literal containing the HTML that should be
 * rendered within the webview panel
 */
export function getWebviewContent(webview: Webview, extensionUri: Uri, note: Note) {

  console.log("extensionUri: ",extensionUri);
  const webviewUri = getUri(webview, extensionUri, ["out", "webview.js"]);
  const styleUri = getUri(webview, extensionUri, ["out", "style.css"]);
  const toolkitUri = getUri(webview, extensionUri, [
    "node_modules",
    "@vscode",
    "webview-ui-toolkit",
    "dist",
    "toolkit.js", // A toolkit.min.js file is also available
  ]);
  const nonce = getNonce();
  const formattedTags = note.tags ? note.tags.join(", ") : null;

  webview.onDidReceiveMessage((message) => {
    const command = message.command;
    switch (command) {
      case "requestNoteData":
        webview.postMessage({
          command: "receiveDataInWebview",
          payload: JSON.stringify(note),
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
        <style>
        /* Webview 스타일을 정의합니다. */
        body {
          margin: 0;
          padding: 0;
        }
        .monaco-editor-container {
          height: 100vh;
        }
        .monaco-editor {
          height: 100%;
          width: 100%;
        }
      </style>        
        <title>${note.title}</title>
    </head>
    <body id="webview-body">
      <header>
        <h1>${note.title}</h1>
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

        <vscode-text-area id="editor"value="${note.content}" placeholder="Write your heart out, Shakespeare!" resize="vertical" rows=15></vscode-text-area>
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
