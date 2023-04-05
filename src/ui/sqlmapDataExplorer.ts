import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export class SqlmapDataExplorer implements vscode.TreeDataProvider<Dependency> {

	public _onDidChangeTreeData: vscode.EventEmitter<Dependency | undefined | void> = new vscode.EventEmitter<Dependency | undefined | void>();
	readonly onDidChangeTreeData: vscode.Event<Dependency | undefined | void> = this._onDidChangeTreeData.event;
	private _onMessage = new vscode.EventEmitter<string>();
	public readonly onMessage: vscode.Event<string> = this._onMessage.event;

	private rootNodes: Dependency[] = [];

	constructor(private workspaceRoot: string | undefined) { }

	sendMessage(message: string) {
		this._onMessage.fire(message);
	}

	refresh(node?: Dependency): void {
		if (node === undefined) {
			console.log("refresh(undefined)");
			this._onDidChangeTreeData.fire(undefined);
		} else {
			console.log("refresh(node):", node.label);
			this._onDidChangeTreeData.fire(node);
		}
	}


	getTreeItem(element: Dependency): vscode.TreeItem {
		return element;
	}

	getChildren(element?: Dependency): Thenable<Dependency[]> {

		if (element === undefined) {
			return Promise.resolve(this.rootNodes);
		} else {
			return Promise.resolve(element.children);
		}

	}
	getParent(element: Dependency): Thenable<Dependency | undefined> {
		console.log("2. getParent(item):", element.label);
		element.parent = this.rootNodes[0];
		return Promise.resolve(element.parent);
	}

	initNode() {
		this.rootNodes = [];
		this._onDidChangeTreeData.fire();
	}

	setRootNode(node: Dependency): void {
		this.rootNodes.push(node);
		this._onDidChangeTreeData.fire(undefined);
	}
	setChildNode(parent: Dependency, child: Dependency): void {
		parent.children.push(child);
		this._onDidChangeTreeData.fire(parent);
	}

	deleteChildNode(parentNode: Dependency, childNode: Dependency) {
		console.log("4. deleteChildNode parentNode:", parentNode.label);
		console.log("4. deleteChildNode childNode:", childNode.label);
		// Remove the child node from the parent's children array
		const index = parentNode.children.indexOf(childNode);
		console.log("5. deleteChildNode index:", index);
		if (index > -1) {
			parentNode.children.splice(index, 1);
		}
		// Refresh the TreeView to reflect the changes
		this.refresh();
		this._onDidChangeTreeData.fire(parentNode);
	}

	public handleMessage(queryList: any): void {
		// Webview에서 전달된 데이터를 처리
		console.log('3. sqlmapDataExplorer : Received data:' + queryList);
		this.initNode();
		let SQLNmSp = Object.keys(queryList)[0];

		// Add a root node to the tree view
		const rootNode = new Dependency(SQLNmSp, vscode.TreeItemCollapsibleState.Expanded);
		this.setRootNode(rootNode);

		const values = queryList[SQLNmSp];
		for (let i = 0; i < values.length; i++) {
			console.log(values[i]); // Output: "z29m8k7", "z29m8k777777", "z29m8k888888", "z29m8k12345"
			// Add a child node to the root node
			const childNode = new Dependency(values[i], vscode.TreeItemCollapsibleState.None);
			this.setChildNode(rootNode, childNode);
			childNode.parent = rootNode.parent;
		}

		this.refresh(rootNode);
	}

	private pathExists(p: string): boolean {
		try {
			fs.accessSync(p);
		} catch (err) {
			return false;
		}

		return true;
	}
}

export class Dependency extends vscode.TreeItem {
	public parent: Dependency | undefined;
	children: Dependency[] = [];
	constructor(
		public readonly label: string,
		//private readonly version: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly command?: vscode.Command,
		parent?: Dependency,
		children: Dependency[] = []

	) {
		super(label, collapsibleState);
		this.parent = parent;
		this.children = children;
		this.collapsibleState = vscode.TreeItemCollapsibleState.Expanded;

	}

	iconPath = {
		light: path.join(__filename, '..', '..', 'resources', 'light', 'dependency.svg'),
		dark: path.join(__filename, '..', '..', 'resources', 'dark', 'dependency.svg')
	};

	contextValue = 'dependency';
}