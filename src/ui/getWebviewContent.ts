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
  <html>
    <head>
      <meta charset="UTF-8">
      <title>Sample Webview</title>
      <style>
        body {
          background-color: var(--vscode-editor-background);
          color: var(--vscode-editor-foreground);
        }
      </style>
    </head>
    <body>
      <h1>Sample Webview</h1>
      <p>This is a sample webview using VS Code's theme.</p>
      <button id="change-theme">Change Theme</button>
      <script>
        const vscode = acquireVsCodeApi();
  
        const currentTheme = vscode.getState().theme || 'light';
        applyTheme(currentTheme);
  
        window.addEventListener('message', event => {
          const message = event.data;
          if (message.type === 'theme') {
            const theme = message.theme;
            applyTheme(theme);
          }
        });
  
        function applyTheme(theme) {
          document.body.className = \`vscode-theme-\${theme}\`;
        }
  
        document.querySelector('#change-theme').addEventListener('click', () => {
          vscode.postMessage({
            type: 'changeTheme'
          });
        });
      </script>
    </body>
  </html>`;
  }
