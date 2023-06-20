import * as vscode from 'vscode'
import * as fs from 'fs'
import * as path from 'path'

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

	public handleMessage(queryList: any): void {

		console.log('ALM#1-1 handleMessage 호출됨 -> Webview에서 전달된 데이터를 처리:Received data:',queryList)
		this.initNode()
		//let SQLNmSp = Object.keys(queryList)[0] //SQL_CONFIG명
		let SqlConfig = ''
		let SqlNmSp = ''
		let SqlNm = ''
		let SqlQuery = ''
		let rootNode:Dependency
		let rootNodeTmp:Dependency
		let childNode:Dependency
		
		for(let i=0; i < queryList.length; i++){

			SqlConfig = queryList[i].CONFIG
			SqlNmSp = queryList[i].NAME
			SqlNm = queryList[i].SQLNAME
			SqlQuery = queryList[i].SQL_0

			
			rootNode = new Dependency(SqlNmSp, vscode.TreeItemCollapsibleState.Expanded)
			
			//TO DO : SqlNmSp 같을때 같은 parent 하위에 child 만 추가 하도록 로직구성 필요.
			if(queryList.length == 1) {
				
				this.setRootNode(rootNode)
				childNode = new Dependency(SqlNm, vscode.TreeItemCollapsibleState.None)
				this.setChildNode(rootNode, childNode)
				childNode.parent = rootNode.parent
				this.refresh(rootNode)
				break
			} else {
				
				if(i+1 < queryList.length) {
					if(SqlNmSp == queryList[i+1].NAME){
						//rootNode는 그대로, child만 추가
						rootNodeTmp = rootNode
						
						this.setRootNode(rootNodeTmp)
						childNode = new Dependency(SqlNm, vscode.TreeItemCollapsibleState.None)
						this.setChildNode(rootNodeTmp, childNode)
						childNode.parent = rootNodeTmp.parent
						this.refresh(rootNodeTmp)
					} else {
						rootNode = new Dependency(SqlNmSp, vscode.TreeItemCollapsibleState.Expanded)
						this.setRootNode(rootNode)
						childNode = new Dependency(SqlNm, vscode.TreeItemCollapsibleState.None)
						this.setChildNode(rootNode, childNode)
						childNode.parent = rootNode.parent
						this.refresh(rootNode)
					}
				} else {//last idx
					if(SqlNmSp == queryList[i-1].NAME){
						///rootNode는 그대로, child만 추가
						rootNodeTmp = rootNode
						
						this.setRootNode(rootNodeTmp)
						childNode = new Dependency(SqlNm, vscode.TreeItemCollapsibleState.None)
						this.setChildNode(rootNodeTmp, childNode)
						childNode.parent = rootNodeTmp.parent
						this.refresh(rootNodeTmp)
					} else {
						rootNode = new Dependency(SqlNmSp, vscode.TreeItemCollapsibleState.Expanded)
						this.setRootNode(rootNode)
						childNode = new Dependency(SqlNm, vscode.TreeItemCollapsibleState.None)
						this.setChildNode(rootNode, childNode)
						childNode.parent = rootNode.parent
						this.refresh(rootNode)
					}
				}
			}
			
		}
		
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