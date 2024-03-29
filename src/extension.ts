// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { showQuickPick, showInputBox } from './functions/basicInput';
import { addNameSpace, delNameSpace } from './functions/multiStepInput';

import { Note  } from "./types/Note";
import { SqlEdit , SqlEditor  } from "./types/SqlEdit";
import { getWebviewContent , getWebviewContentSql} from "./ui/getWebviewContent";
import { SqlconfigExplorer } from './ui/sqlconfigExplorer';
import { SqlmapDataExplorer, Dependency } from './ui/sqlmapDataExplorer';
//import { SearchProvider } from './ui/search';

import SqlEditPanel from './ui/SqlEditPanel';
import { SqlConfigService } from "./modules/db/service/SqlConfigService";
import { U2CSQLMAPCONFIG } from "./types/SqlConfig";
import { Context } from 'mocha';



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
	let sqleditor: SqlEditor = {
		QUERY_ID: "",
		USE_YN: "",
		DESCRIPTION: "",
		QUERY_NAME: "",
		QUERY_TYPE: "",
		SQL_0: "",
		SQL_1: "",
		SQL_2: "",
		SQL_3: "",
		SQL_4: "",
		SQLMAP_ID: "",
		tags: ["sqlEdit"]
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

	
	const sqlmapProvider = new SqlmapDataExplorer(context, rootPath)
	const sqlconfigWV = new SqlconfigExplorer(context, sqlmapProvider)
	let sqlconfig:U2CSQLMAPCONFIG[] = sqlconfigWV.getSqlConfig()
	// 트리 데이터 뷰 등록 
	//참고사이트1: https://github.com/microsoft/vscode/pull/152481
	//참고사이트2: https://code.visualstudio.com/docs/getstarted/userinterface#_advanced-tree-navigation
	//참고사이트3: https://stackoverflow.com/questions/51237836/how-to-focus-a-custom-view-when-writing-a-vs-code-extension 
	const treeView = vscode.window.createTreeView('sqlmapExplorer', {
		treeDataProvider: sqlmapProvider
	});
	treeView.reveal(sqlmapProvider.rootNodes[0], { focus: true , select: true});
	
	//등록된 리스너로 이벤트를 발생시킨다.
	sqlmapProvider.sendMessage(`Hello from provider (${new Date().toISOString()})`)
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
	vscode.commands.registerCommand('cwt_cucumber.on_itemClicked',
	item => on_itemClicked(context,panel,item));
	vscode.commands.registerCommand('sqlmapExplorer.contextMenuAddSelQry',
	item => creatSelQry(context,panel,item));
	vscode.commands.registerCommand('sqlmapExplorer.contextMenuAddUpdQry',
	item => creatUpQry(context,panel,item));
	vscode.commands.registerCommand('sqlmapExplorer.contextMenuAddInsQry',
	item => creatInsQry(context,panel,item));
	vscode.commands.registerCommand('sqlmapExplorer.contextMenuAddDelQry',
	item => creatDelQry(context,panel,item));
	

	vscode.commands.registerCommand('sqlmapExplorer.contextMenudelEntry',
	(item: Dependency) => {
		console.log("1. item 삭제:", item.query);
		sqlmapProvider.getParent(item).then(parentNode => {
			if (parentNode) {
				console.log("3. parentNode:", parentNode.query);
				sqlmapProvider.deleteChildNode(parentNode, item);
			}
		});
	});
	//Context Menu 정의 (마우스 우클릭) [END]

	//TreeView CodiCon 정의 [START]
	//Codicon [+] 클릭. To Do 네임스페이스 추가 팝업
	/*context.subscriptions.push(vscode.commands.registerCommand('sqlconfigExplorer.addNameSpace', async () => {
		const options: { [key: string]: (context: vscode.ExtensionContext) => Promise<void> } = {
			//showQuickPick,
			//showInputBox,
			addNameSpace,
			delNameSpace
			//quickOpen,
		};
		const quickPick = vscode.window.createQuickPick();
		quickPick.items = Object.keys(options).map(label => ({ label }));
		quickPick.onDidChangeSelection(selection => {
			if (selection[0]) {
				options[selection[0].label](context)
					.catch(console.error);
			}
		});
		quickPick.onDidHide(() => quickPick.dispose());
		quickPick.show();
	}));*/
	//vscode.commands.registerCommand('sqlconfigExplorer.addNameSpace',
	//() => showNameSpaceInputBox())
	vscode.commands.registerCommand('sqlconfigExplorer.addNameSpace', 
	() => { addNameSpace(context) }) //	quick input
	vscode.commands.registerCommand('sqlconfigExplorer.delNameSpace',
	() => { delNameSpace(context) }) //	quick input
	//TO DO 돋보기? 검색기능
	//Codicon [+] 클릭. To Do ?
	vscode.commands.registerCommand('sqlmapExplorer.addEntry',
		() => openUntitledFile(context, panel))
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

function sqlUntitledPannel(context: vscode.ExtensionContext, panel: vscode.WebviewPanel, sqleditor: SqlEditor) {

	let sqls: SqlEditor[] = [];
	const newsql: SqlEditor = {
		QUERY_ID: sqleditor.QUERY_ID,
		USE_YN: sqleditor.USE_YN,
		DESCRIPTION: sqleditor.DESCRIPTION,
		QUERY_NAME: sqleditor.QUERY_NAME,
		QUERY_TYPE: sqleditor.QUERY_TYPE,
		SQL_0: sqleditor.SQL_0,
		SQL_1: sqleditor.SQL_1,
		SQL_2: sqleditor.SQL_2,
		SQL_3: sqleditor.SQL_3,
		SQL_4: sqleditor.SQL_4,
		SQLMAP_ID: sqleditor.SQLMAP_ID,
		tags: sqleditor.tags
	};
	if(!panel) {
		panel = vscode.window.createWebviewPanel("sqlDetailView", "sqledit.title", vscode.ViewColumn.One, {
			// Enable JavaScript in the webview
			enableScripts: true,
			retainContextWhenHidden: true,
			// Restrict the webview to only load resources from the `out` directory
			localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, "out")],
		});
	}
	panel.title = newsql.QUERY_NAME
	panel.webview.html = getWebviewContentSql(panel.webview, context.extensionUri, newsql)
	panel.webview.onDidReceiveMessage((message) => {
		const command = message.command
		const newsql = message.newsql
		switch(command) {
			case "updateNote":
					const queryId = newsql.QUERY_ID
					const copyOfSqlsArray = [...sqls]
					const matchingSqlIndex = copyOfSqlsArray.findIndex((sql) => sql.QUERY_ID === queryId)
					copyOfSqlsArray[matchingSqlIndex] = newsql
					sqls = copyOfSqlsArray
					panel
					? ((panel.title = newsql.QUERY_NAME),
						(panel.webview.html = getWebviewContentSql(panel.webview, context.extensionUri, newsql)))
					: null;
				break;
		}
	}

	);


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
		queryid: "id",
		type: "Query",
		use: "",
		tags: ["queryEdit"],
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
				const matchingNoteIndex = copyOfNotesArray.findIndex((note) => note.queryid === updatedNoteId);
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
	console.log("contextmenu 클릭 : item.label[", item.label, "] item.query[",item.query,"]");
	
	
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
//function on_itemClicked(context: vscode.ExtensionContext, panel: vscode.WebviewPanel | undefined = undefined , treeView: vscode.TreeView<Dependency>, item: Dependency) {
function on_itemClicked(context: vscode.ExtensionContext, panel: vscode.WebviewPanel | undefined = undefined , item: Dependency) {
	//const provider = new TreeDataProvider();
//const treeView = vscode.window.createTreeView("exampleView", { treeDataProvider: sqlmapProvider });

// get item by label and make it selected
//const item = provider.getTreeItemByLabel("BMW");
//treeView.reveal(item, { focus: true, select: true });
//treeView.reveal(item, { focus: true, select: true });
//vscode.commands.executeCommand("sqlmapExplorer.focus")
	//treeView.reveal(item, {select: true, focus: true});
	let sql:SqlEditor 
	if(item.query != undefined){
		sql = {
			QUERY_ID: item.query.QUERY_ID,
			USE_YN: item.query.USE_YN,
			DESCRIPTION: item.query.DESCRIPTION,
			QUERY_NAME: item.query.QUERY_NAME,
			QUERY_TYPE: item.query.QUERY_TYPE,
			SQL_0: item.query.SQL_0,
			SQL_1: item.query.SQL_1,
			SQL_2: item.query.SQL_2,
			SQL_3: item.query.SQL_3,
			SQL_4: item.query.SQL_4,
			SQLMAP_ID: item.query.SQLMAP_ID,
			tags: ["sqlEdit"]
		};
		if(!panel) {
			panel = vscode.window.createWebviewPanel("sqlDetailView", "sqledit.title", vscode.ViewColumn.One, {
				// Enable JavaScript in the webview
				enableScripts: true,
				retainContextWhenHidden: true,
				// Restrict the webview to only load resources from the `out` directory
				localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, "out")],
			});
		}
		sqlUntitledPannel(context, panel, sql)		
		
	}
	
}
function creatSelQry(context: vscode.ExtensionContext, panel: vscode.WebviewPanel | undefined = undefined, item: Dependency) {
	console.log("creatSelQry contextmenu 클릭 : item.label[", item.label, "] item.query[",item.query,"]");
	
	openUntitledFile(context, panel)
	
}
function creatUpQry(context: vscode.ExtensionContext, panel: vscode.WebviewPanel | undefined = undefined, item: Dependency) {
	console.log("creatUpQry contextmenu 클릭 : item.label[", item.label, "] item.query[",item.query,"]");
	openUntitledFile(context, panel)
	
}
function creatInsQry(context: vscode.ExtensionContext, panel: vscode.WebviewPanel | undefined = undefined, item: Dependency) {
	console.log("creatInsQry contextmenu 클릭 : item.label[", item.label, "] item.query[",item.query,"]");
	openUntitledFile(context, panel)
	
}
function creatDelQry(context: vscode.ExtensionContext, panel: vscode.WebviewPanel | undefined = undefined, item: Dependency) {
	console.log("creatDelQry contextmenu 클릭 : item.label[", item.label, "] item.query[",item.query,"]");
	openUntitledFile(context, panel)
	
}
// This method is called when your extension is deactivated
export function deactivate() { }
