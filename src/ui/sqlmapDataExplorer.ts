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
	public rootNodes: Dependency[] = []
	private searchText: string | undefined;
	private filteredNodes: Dependency[] = [];
	public treeView = vscode.window.createTreeView('sqlmapExplorer', {
		treeDataProvider: this
	});

  setSearchText(text: string | undefined) {
    this.searchText = text;
    this.filteredNodes = this.getFilteredNodes(this.rootNodes);
    this._onDidChangeTreeData.fire();
  }

  private getFilteredNodes(nodes: Dependency[]): Dependency[] {
    if (!this.searchText) {
      return nodes;
    }

    const filteredNodes: Dependency[] = [];
    for (const node of nodes) {
      if (node.label.includes(this.searchText)) {
        filteredNodes.push(node);
      }

      const children = this.getFilteredNodes(node.children);
      if (children.length > 0) {
        const newNode = new Dependency(
          node.label,
          vscode.TreeItemCollapsibleState.Expanded,
          true,
          node.query
        );
        newNode.children = children;
        filteredNodes.push(newNode);
      }
    }

    return filteredNodes;
  }
	// Implement the search method
  search(searchText: string) {
    if (!searchText) {
      return;
			
    }

    this.setSearchText(searchText);
  }

  getChildren(element?: Dependency): Thenable<Dependency[]> {
    if (!element) {
      // Top-level nodes
      return Promise.resolve(this.getFilteredNodes(this.rootNodes));
    } else {
      // Child nodes
      return Promise.resolve(this.getFilteredNodes(element.children));
    }
  }
	getParent(element: Dependency): Thenable<Dependency | undefined> {
		console.log('ALM#1-1 getParent 호출됨 : getParent(element) : ', element.label)
		element.parent = this.rootNodes[0]
		
		return Promise.resolve(element.parent)
	}
	constructor(context: vscode.ExtensionContext, private workspaceRoot: string | undefined) {
		
	console.log('ALM#1-1 class constructor')
	//검색기능 시작
	console.log('============= search 명령어 등록 진행 =============')
	const search = vscode.commands.registerCommand('sqlmapExplorer.search', 

		async () => {
			const searchText = await vscode.window.showInputBox({
				prompt: 'Enter search keyword',
			});
			if(searchText != undefined) 
				this.search(searchText);
		}
		
	)//끝
	
	context.subscriptions.push(search)
	console.log('============= search 명령어 등록 완료 =============')
	
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
		this.treeView.reveal(this.rootNodes[0], { focus: true , select: true});
	}

	getTreeItem(element: Dependency): vscode.TreeItem {
		console.log('ALM#1-1 getTreeItem 호출됨')
		//return element
		let title = element.label ? element.label.toString() : "";
		let result = new vscode.TreeItem(title, element.collapsibleState);
		result.command = { command: 'cwt_cucumber.on_itemClicked', title : title, arguments: [element] };
    return result;

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
		
		console.log("ALM#1-1 deleteChildNode parentNode:", parentNode.query)
		console.log("ALM#1-1 deleteChildNode childNode:", childNode.query)
		
		// Remove the child node from the parent's children array
		const index = parentNode.children.indexOf(childNode)
		console.log("5. deleteChildNode index:", index)
		if (index > -1) {
			parentNode.children.splice(index, 1)
		}
		// Refresh the TreeView to reflect the changes
		this.refresh()
		this._onDidChangeTreeData.fire(parentNode)

		if(childNode.query != undefined){
			this.delQry(childNode.query)	//IB20 쿼리 삭제
		}
	}
	public async delQry(query:U2C_SQLMAP_QUERY) {
		await SqlConfigService.delQry(query.SQLMAP_ID, query.QUERY_ID);
	}
	// INSERT INTO U2C_SQLMAP_QUERY (QUERY_ID, USE_YN, CREATE_USER, CREATE_DATE, UPDATE_USER, UPDATE_DATE, DESCRIPTION, QUERY_NAME, QUERY_TYPE, SQL_0, SQL_1, SQL_2, SQL_3, SQL_4, SQLMAP_ID, STATE)
	// VALUES (1, 'Y', 'user1', '', 'user1', '', 'Sample Query 1', 'Query 1', 'S', 'SELECT * FROM table1', '', '', '', '', 11440, '01');
	

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
							//rootNode.isParent = true
							rootNode.iconPath = new vscode.ThemeIcon('folder')
							rootNode.query = query
							this.setRootNode(rootNode);
							previousNamespace = namespace;
					}
	
					if (rootNode) {
							const childNode = new Dependency(sqlname, vscode.TreeItemCollapsibleState.None);
							this.setChildNode(rootNode, childNode)
							//rootNode.isParent = false
							childNode.iconPath = new vscode.ThemeIcon('database')
							childNode.query = query
							childNode.parent = rootNode.parent;
					}
			}
			
		}
			
		);

		// 트리 데이터 뷰 등록
		// const treeView = vscode.window.createTreeView('sqlmapExplorer', {
		// 	treeDataProvider: this
		// });
		//sqlmapProvider.refresh(); 
		this.treeView.reveal(this.rootNodes[0], { focus: true , select: true});
		
		
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
    public parent: Dependency | undefined;
    children: Dependency[] = [];
  
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
				public isParent?:boolean,
				public query?: U2C_SQLMAP_QUERY,
        public readonly command?: vscode.Command,
        parent?: Dependency,
        children: Dependency[] = []
    ) {
        super(label, collapsibleState);
        this.parent = parent;
        this.children = children;
        this.collapsibleState = vscode.TreeItemCollapsibleState.Expanded;
        //this.iconPath = this.getIconPath();
				//this.query = query
    }
  
    private getIconPath(): string | vscode.ThemeIcon {
        
        if (this.isParent) {
					// Use Codicon for parent nodes
					// return new vscode.ThemeIcon('folder');
					//https://code.visualstudio.com/api/references/icons-in-labels#icon-listing
					return new vscode.ThemeIcon('folder');
				} else {
						// Use Codicon for child nodes
						//return new vscode.ThemeIcon('file');
						return new vscode.ThemeIcon('database');
				}
    }
  
    contextValue = 'dependency';
}


/*

export class Dependency extends vscode.TreeItem {
	public parent: Dependency | undefined
	children: Dependency[] = []
	constructor(
		public readonly label: string,
		public readonly isParent:boolean,
		//private readonly version: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly command?: vscode.Command,
		parent?: Dependency,
		children: Dependency[] = [], 

	) {
		console.log('ALM#1-1 class Dependency constructor: Tree아이템 제작')
		super(label, collapsibleState)
		this.parent = parent
		this.children = children
		this.collapsibleState = vscode.TreeItemCollapsibleState.Expanded

	}

	private getIconPath(): vscode.Uri | string | vscode.ThemeIcon {
		if (this.isParent) {
				// Use Codicon for parent nodes
				return new vscode.ThemeIcon('folder');
		} else {
				// Use Codicon for child nodes
				return new vscode.ThemeIcon('file');
		}
	}
	iconPath = {
		light: path.join(__filename, '..', '..', 'resources', 'light', 'dependency.svg'),
		dark: path.join(__filename, '..', '..', 'resources', 'dark', 'dependency.svg')
	}

	contextValue = 'dependency'
}
*/