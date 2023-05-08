// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { showQuickPick, showInputBox } from './functions/basicInput';
import { Note,SqlEdit } from "./types/Note";
import { getWebviewContent } from "./ui/getWebviewContent";
import { SqlconfigExplorer } from './ui/sqlconfigExplorer';
import { SqlmapDataExplorer, Dependency } from './ui/sqlmapDataExplorer';
import SqlEditPanel from './ui/SqlEditPanel';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	const sqledit: SqlEdit = {
		id: "qryTB_ISB_PRD_MT_SB_C_01",
		title: "SQL Map",
		sql: "select * from ",
		type:"",
		use:"Y",
		sqlnamespace:"",
		tags: ["KBANK","IB20"],
	};
	
	const rootPath = (vscode.workspace.workspaceFolders && (vscode.workspace.workspaceFolders.length > 0))
		? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined;

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "vscode-kbank-ib20" is now active!');
	let panel: vscode.WebviewPanel | undefined = undefined;
	
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('vscode-kbank-ib20.helloWorld', async () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from vscode-kbank-ib20!');
		const showData: boolean = await showInputBox();
		SqlEditPanel.createOrShow(context.extensionUri, sqledit);
	});

	const sqlmapProvider = new SqlmapDataExplorer(rootPath); //왼쪽 하단 TreeView ( vscode.TreeDataProvider )
	new SqlconfigExplorer(context, sqlmapProvider); //왼쪽 상단 WebviewView Provider //주입된 프로바이더에 이벤트를 등록한다.
	sqlmapProvider.sendMessage(`Hello from provider (${new Date().toISOString()})`);//등록된 리스너로 이벤트를 발생시킨다.

	vscode.window.registerTreeDataProvider('sqlmapExplorer', sqlmapProvider); //viewID:sqlmapExplorer



	context.subscriptions.push(		
		vscode.commands.registerCommand('catCoding.start', () => {		  
		  SqlEditPanel.createOrShow(context.extensionUri, sqledit);
		})
	  );
	
	context.subscriptions.push(
		vscode.commands.registerCommand('catCoding.doRefactor', () => {
		  if (SqlEditPanel.currentPanel) {
			SqlEditPanel.currentPanel.doRefactor();
		  }
		})
	  );

	  if (vscode.window.registerWebviewPanelSerializer) {
		vscode.window.registerWebviewPanelSerializer(SqlEditPanel.viewType, {
		  async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: any) {
			console.log(`Got state: ${state}`);
			webviewPanel.webview.options = getWebviewOptions(context.extensionUri);
			SqlEditPanel.revive(webviewPanel, context.extensionUri, sqledit);
		  }
		});
	  }

	//Context Menu 정의 (마우스 우클릭) [START]

	vscode.commands.registerCommand('sqlmapExplorer.contextMenuAddSelQry',
		item => command_0(item)); //TEST
	vscode.commands.registerCommand('sqlmapExplorer.contextMenuAddUpdQry',
		item => command_0(item)); //TEST
	vscode.commands.registerCommand('sqlmapExplorer.contextMenuAddInsQry',
		item => command_0(item)); //TEST
	vscode.commands.registerCommand('sqlmapExplorer.contextMenuAddDelQry',
		item => command_0(item)); //TEST

	vscode.commands.registerCommand('sqlmapExplorer.contextMenuaddEntry',
		item => command_0(item)); //TEST

	vscode.commands.registerCommand('sqlmapExplorer.contextMenudelEntry',
		(item: Dependency) => {
			console.log("1. item 삭제:", item.label);
			sqlmapProvider.getParent(item).then(parentNode => {
				if (parentNode) {
					console.log("3. parentNode:", parentNode.label);
					sqlmapProvider.deleteChildNode(parentNode, item);
				}
			});
		});
	//Context Menu 정의 (마우스 우클릭) [END]

	//TreeView CodiCon 정의 [START]
	//TO DO 돋보기? 검색?
	//Codicon [+] 클릭. To Do NameSpace추가 팝업 띄우기
	vscode.commands.registerCommand('sqlmapExplorer.addEntry',
		() => openUntitledFile(context, panel));
	//TO DO. Codicon [-] 클릭. NameSpace 삭제 팝업 띄우기.
	vscode.commands.registerCommand('sqlmapExplorer.delEntry',
		(item: Dependency) => {
			console.log("1. item 삭제:", item.label);
			sqlmapProvider.getParent(item).then(parentNode => {
				if (parentNode) {
					console.log("3. parentNode:", parentNode.label);
					sqlmapProvider.deleteChildNode(parentNode, item);
				}
			});
		});
	context.subscriptions.push(vscode.commands.registerCommand('sqlmapExplorer.refreshEntry',
		() => { sqlmapProvider.refresh(); }));	//refresh
	//TreeView CodiCon 정의 [END]

	context.subscriptions.push(disposable);
}

function getWebviewOptions(extensionUri: vscode.Uri): vscode.WebviewOptions {
	return {
	  enableScripts: true,
	  localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'out')]
	};
  }

function sqlPanle(panel: vscode.WebviewPanel, context: vscode.ExtensionContext) {


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
			retainContextWhenHidden: true,
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
function command_0(item: Dependency) {
	console.log("context menu command 0 clickd with: ", item.label);
}
function command_1(item: Dependency, sqlmapProvider: SqlmapDataExplorer) {
	sqlmapProvider.getParent(item).then(parentNode => {
		if (parentNode) {
			// Delete the child node from the parent node
			sqlmapProvider.deleteChildNode(parentNode, item);
			console.log("context menu command 1 clicked with: ", item.label);
		}
	});
}
// This method is called when your extension is deactivated
export function deactivate() { }
