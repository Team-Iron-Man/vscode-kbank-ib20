import * as vscode from 'vscode'
import * as fs from 'fs'
import * as path from 'path'
import { SqlConfigService } from "../modules/db/service/SqlConfigService";
import { U2CSQLMAPCONFIG, U2C_SQLMAP_QUERY } from "../types/SqlConfig";

export class SqlmapDataExplorer implements vscode.TreeDataProvider<Dependency> {

	public _onDidChangeTreeData: vscode.EventEmitter<Dependency | undefined | void> = new vscode.EventEmitter<Dependency | undefined | void>()
	public _onMessage = new vscode.EventEmitter<string>()
	public readonly onDidChangeTreeData: vscode.Event<Dependency | undefined | void> = this._onDidChangeTreeData.event;
	public readonly onMessage: vscode.Event<string> = this._onMessage.event
	private rootNodes: Dependency[] = []
	
	constructor(private workspaceRoot: string | undefined) { 
		console.log('ALM#1-1 class constructor')
		
	}

	sendMessage(message: string) {
		console.log('ALM#1-1 sendMessage 호출됨')
		this._onMessage.fire(message)
	}

	refresh(node?: Dependency): void {
		if (node === undefined) {
			console.log("ALM#1-1 refresh(undefined) 호출됨")
			this._onDidChangeTreeData.fire(undefined)
		} else {
			console.log("ALM#1-1 refresh(node) 호출됨", node.label)
			this._onDidChangeTreeData.fire(node)
		}
	}

	getTreeItem(element: Dependency): vscode.TreeItem {
		console.log('ALM#1-1 getTreeItem 호출됨')
		return element
	}

	getChildren(element?: Dependency): Thenable<Dependency[]> {
		console.log('ALM#1-1 getChildren 호출됨')
		if (element === undefined) {
			return Promise.resolve(this.rootNodes)
		} else {
			return Promise.resolve(element.children)
		}

	}
	getParent(element: Dependency): Thenable<Dependency | undefined> {
		console.log('ALM#1-1 getParent 호출됨 : getParent(element) : ', element.label)
		element.parent = this.rootNodes[0]
		return Promise.resolve(element.parent)
	}

	initNode() {
		console.log('ALM#1-1 initNode 호출됨')
		this.rootNodes = []
		this._onDidChangeTreeData.fire()
	}

	setRootNode(node: Dependency): void {
		console.log('ALM#1-1 setRootNode 호출됨')
		this.rootNodes.push(node)
		this._onDidChangeTreeData.fire(undefined)
	}
	setChildNode(parent: Dependency, child: Dependency): void {
		console.log('ALM#1-1 setChildNode 호출됨')
		parent.children.push(child)
		this._onDidChangeTreeData.fire(parent)
	}

	addChildNode(parent: Dependency, child: Dependency): void {
		console.log('ALM#1-1 addChildNode 호출됨')
		if (!parent.children) {
			parent.children = [];
		}
		parent.children.push(child);
		this._onDidChangeTreeData.fire(parent);
	}
	deleteChildNode(parentNode: Dependency, childNode: Dependency) {
		console.log('ALM#1-1 deleteChildNode 호출됨')
		console.log("ALM#1-1 deleteChildNode parentNode:", parentNode.label)
		console.log("ALM#1-1 deleteChildNode childNode:", childNode.label)
		// Remove the child node from the parent's children array
		const index = parentNode.children.indexOf(childNode)
		console.log("5. deleteChildNode index:", index)
		if (index > -1) {
			parentNode.children.splice(index, 1)
		}
		// Refresh the TreeView to reflect the changes
		this.refresh()
		this._onDidChangeTreeData.fire(parentNode)
	}



	public async handleMessage(selectedConfig: any): Promise<void> {

		/*
		let selectedConfig = {
			CONFIG_NAME : selectOptVal,
			CONFIG_ID : selectOptDataId
		}
		*/
		this.initNode() //TreeView 노드 초기화

		console.log('ALM#1-1 handleMessage 호출됨 -> Webview에서 전달된 데이터를 처리:Received data:',selectedConfig)

		const maps: Map<string, string> = await getSqlMap(selectedConfig.CONFIG_ID);
		
		/* 
		  QUERY_ID : string;
			USE_YN : string;
			CREATE_USER : string;
			CREATE_DATE : string;
			UPDATE_USER : string;
			UPDATE_DATE : string;
			DESCRIPTION : string;
			QUERY_NAME : string;
			QUERY_TYPE : string;
			SQL_0 : string;
			SQL_1 : string;
			SQL_2 : string;
			SQL_3 : string;
			SQL_4 : string;
			SQLMAP_ID : string;
			STATE: string;
		*/
		maps.forEach(async (key, value) => {//key : SQLMAP_NAME, value.toString(): SQLMAP_ID

			let queryList: U2C_SQLMAP_QUERY[] = await getSqlMapQueryList(value.toString())
			if (queryList.length === 0) {
				return;
			}
	
			let rootNode: Dependency | undefined;
			let previousNamespace: string | undefined;
	
			for (const query of queryList) {
					const namespace = key;
					const sqlname = query.QUERY_NAME;
	
					if (namespace !== previousNamespace) {
							rootNode = new Dependency(namespace, vscode.TreeItemCollapsibleState.Expanded);
							this.setRootNode(rootNode);
							previousNamespace = namespace;
					}
	
					if (rootNode) {
							const childNode = new Dependency(sqlname, vscode.TreeItemCollapsibleState.None);
							this.setChildNode(rootNode, childNode);
							childNode.parent = rootNode.parent;
					}
			}
			
		});

		
		
		
	}

	private pathExists(p: string): boolean {
		try {
			fs.accessSync(p)
		} catch (err) {
			return false
		}
		return true
	}
}
export async function getSqlMap(configid: string|undefined) {
	let u2csqlmapList: U2CSQLMAPCONFIG[]
	let sqlmap: Map<string, string> = new Map()
	
	u2csqlmapList = await SqlConfigService.getSqlMap(configid);
	
	if (u2csqlmapList.length) {
		u2csqlmapList.map((row: any) => {
			sqlmap.set(row.SQLMAP_ID, row.SQLMAP_NAME);
		})
	} else {
		console.log('ALM#2-1 [Get Data From DB][2] FAIL => 데이터가 없습니다 !!! ')
	}
	
	return sqlmap
}
export async function getSqlMapQueryList(sqlmapid: string) {
	let u2csqlmapquery: U2C_SQLMAP_QUERY[]
	u2csqlmapquery = await SqlConfigService.getSqlMapQueryList(sqlmapid);
	return u2csqlmapquery
}

export class Dependency extends vscode.TreeItem {
	public parent: Dependency | undefined
	children: Dependency[] = []
	constructor(
		public readonly label: string,
		//private readonly version: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly command?: vscode.Command,
		parent?: Dependency,
		children: Dependency[] = []

	) {
		console.log('ALM#1-1 class Dependency constructor: Tree아이템 제작')
		super(label, collapsibleState)
		this.parent = parent
		this.children = children
		this.collapsibleState = vscode.TreeItemCollapsibleState.Expanded

	}

	iconPath = {
		light: path.join(__filename, '..', '..', 'resources', 'light', 'dependency.svg'),
		dark: path.join(__filename, '..', '..', 'resources', 'dark', 'dependency.svg')
	}

	contextValue = 'dependency'
}