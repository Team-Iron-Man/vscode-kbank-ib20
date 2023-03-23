// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { showQuickPick, showInputBox } from './functions/basicInput';
import { Note } from "./types/Note";
import { getWebviewContent } from "./ui/getWebviewContent";
import { SqlconfigExplorer } from './ui/sqlconfigExplorer';
import { SqlmapDataExplorer,Dependency } from './ui/sqlmapDataExplorer';


// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	const rootPath = (vscode.workspace.workspaceFolders && (vscode.workspace.workspaceFolders.length > 0))
		? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined;

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "vscode-kbank-ib20" is now active!');
	let panel: vscode.WebviewPanel | undefined = undefined;		
	let notes: Note[] = [];
	const newNote: Note = {
		id: "id",
		title: "Query",
		content: "",
		tags: ["Personal"],
	  };
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('vscode-kbank-ib20.helloWorld', async () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from vscode-kbank-ib20!');
		const showData:boolean = await showInputBox();

		if (!panel) {
			panel = vscode.window.createWebviewPanel("noteDetailView", 'matchingNote.title', vscode.ViewColumn.One, {
				// Enable JavaScript in the webview
				enableScripts: true,
				// Restrict the webview to only load resources from the `out` directory
				localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, "out")],
				});
		}
		panel.title = 'matchingNote.title';
		panel.webview.html = getWebviewContent(panel.webview, context.extensionUri, newNote);
	
		panel.webview.onDidReceiveMessage((message) => {
		const command = message.command;
		const note = message.note;
		switch (command) {
			case "updateNote":
			const updatedNoteId = note.id;
			const copyOfNotesArray = [...notes];
			const matchingNoteIndex = copyOfNotesArray.findIndex((note) => note.id === updatedNoteId);
			copyOfNotesArray[matchingNoteIndex] = note;
			notes = copyOfNotesArray;
			panel
				? ((panel.title = note.title),
				(panel.webview.html = getWebviewContent(panel.webview, context.extensionUri, note)))
				: null;
			break;
		}
		});
		panel.onDidDispose(
		() => {
			// When the panel is closed, cancel any future updates to the webview content
			panel = undefined;
		},
		null,
		context.subscriptions
		);
	});

	const sqlmapProvider = new SqlmapDataExplorer(rootPath); //왼쪽 하단 TreeView ( vscode.TreeDataProvider )
	new SqlconfigExplorer(context, sqlmapProvider); //왼쪽 상단 WebviewView Provider

	vscode.window.registerTreeDataProvider('sqlmapExplorer',sqlmapProvider); //viewID:sqlmapExplorer
	vscode.commands.registerCommand('sqlmapExplorer.addEntry', () => openUntitledFile(context, panel) ); // + 아이콘 클릭
	vscode.commands.registerCommand('sqlmapExplorer.delEntry', () => vscode.window.showInformationMessage(`Successfully called delete NameSpace.`));	// - 아이콘 클릭
	
	context.subscriptions.push(vscode.commands.registerCommand('sqlmapExplorer.refreshEntry', () => {sqlmapProvider.refresh();}));	//refresh
	context.subscriptions.push(disposable);
}


function sqlPanle(panel: vscode.WebviewPanel, context: vscode.ExtensionContext){
	

}
async function openUntitledFile(context: vscode.ExtensionContext, panel: vscode.WebviewPanel | undefined = undefined) {	// + 아이콘 클릭 시, 화면 중앙 webview panel open 한다.
	//To DO.. webview panel로 오픈하도록 수정 필요.
	// const document = await vscode.workspace.openTextDocument({
	// 	content: undefined,
	// 	language: 'sql'
	// }); 
	// vscode.window.showTextDocument(document);

	let notes: Note[] = [];
	const newNote: Note = {
		id: "id",
		title: "Query",
		content: "",
		tags: ["Personal"],
	  };
	  
	if (!panel) {
		panel = vscode.window.createWebviewPanel("noteDetailView", 'matchingNote.title', vscode.ViewColumn.One, {
			// Enable JavaScript in the webview
			enableScripts: true,
			// Restrict the webview to only load resources from the `out` directory
			localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, "out")],
			});
	}
	panel.title = 'matchingNote.title';
	panel.webview.html = getWebviewContent(panel.webview, context.extensionUri, newNote);

	panel.webview.onDidReceiveMessage((message) => {
	const command = message.command;
	const note = message.note;
	switch (command) {
		case "updateNote":
		const updatedNoteId = note.id;
		const copyOfNotesArray = [...notes];
		const matchingNoteIndex = copyOfNotesArray.findIndex((note) => note.id === updatedNoteId);
		copyOfNotesArray[matchingNoteIndex] = note;
		notes = copyOfNotesArray;
		panel
			? ((panel.title = note.title),
			(panel.webview.html = getWebviewContent(panel.webview, context.extensionUri, note)))
			: null;
		break;
	}
	});
  }

// This method is called when your extension is deactivated
export function deactivate() {}
