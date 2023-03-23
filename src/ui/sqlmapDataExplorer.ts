import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

// const jsonFilePath = path.join(__dirname, 'sampleData.json');
// const jsonData = fs.readFileSync(jsonFilePath, 'utf-8');
// const data = JSON.parse(jsonData);

export class SqlmapDataExplorer implements vscode.TreeDataProvider<Dependency> {

	private _onDidChangeTreeData: vscode.EventEmitter<Dependency | undefined | void> = new vscode.EventEmitter<Dependency | undefined | void>();
	readonly onDidChangeTreeData: vscode.Event<Dependency | undefined | void> = this._onDidChangeTreeData.event;

	constructor(private workspaceRoot: string | undefined) {
	}

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	getTreeItem(element: Dependency): vscode.TreeItem {
		return element;
	}

	getChildren(element?: Dependency): Thenable<Dependency[]> {
		// TODO: Implement logic to get child nodes
		// if (!this.workspaceRoot) {
		// 	vscode.window.showInformationMessage('No dependency in empty workspace!!!');
		// 	return Promise.resolve([]);
		// }

		// if (element) {
		// 	return Promise.resolve(this.getDepsInPackageJson(path.join(this.workspaceRoot, 'node_modules', element.label, 'package.json')));
		// } else {
		// 	const packageJsonPath = path.join(this.workspaceRoot, 'package.json');
		// 	if (this.pathExists(packageJsonPath)) {
		// 		return Promise.resolve(this.getDepsInPackageJson(packageJsonPath));
		// 	} else {
		// 		vscode.window.showInformationMessage('Workspace has no package.json');
		// 		return Promise.resolve([]);
		// 	}
		// }
		if (!element) {
			return Promise.resolve([
			  new Dependency('Parent 1', vscode.TreeItemCollapsibleState.Expanded),
			  new Dependency('Parent 2', vscode.TreeItemCollapsibleState.Expanded)
			]);
		  } else if (element.label === 'Parent 1') {
			return Promise.resolve([
			  new Dependency('Child 1', vscode.TreeItemCollapsibleState.None),
			  new Dependency('Child 2', vscode.TreeItemCollapsibleState.None)
			]);
		  } else if (element.label === 'Parent 2') {
			return Promise.resolve([
			  new Dependency('Child 3', vscode.TreeItemCollapsibleState.None),
			  new Dependency('Child 4', vscode.TreeItemCollapsibleState.None)
			]);
		  } else {
			return Promise.resolve([]);
		  }

	}

	handleMessage(data: any): void {
		// Webview에서 전달된 데이터를 처리
		console.log('3. sqlmapDataExplorer : Received message:', data);
		this.refresh();
	}
	

	/**
	 * Given the path to package.json, read all its dependencies and devDependencies.
	 */
	// private getDepsInPackageJson(packageJsonPath: string): Dependency[] {
	// 	const workspaceRoot = this.workspaceRoot;
	// 	if (this.pathExists(packageJsonPath) && workspaceRoot) {
	// 		const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

	// 		const toDep = (moduleName: string, version: string): Dependency => {
	// 			if (this.pathExists(path.join(workspaceRoot, 'node_modules', moduleName))) {
	// 				return new Dependency(moduleName, version, vscode.TreeItemCollapsibleState.Expanded);
	// 			} else {
	// 				return new Dependency(moduleName, version, vscode.TreeItemCollapsibleState.None, {
	// 					command: 'extension.openPackageOnNpm',
	// 					title: '',
	// 					arguments: [moduleName]
	// 				});
	// 			}
	// 		};

	// 		const deps = packageJson.dependencies
	// 			? Object.keys(packageJson.dependencies).map(dep => toDep(dep, packageJson.dependencies[dep]))
	// 			: [];
	// 		const devDeps = packageJson.devDependencies
	// 			? Object.keys(packageJson.devDependencies).map(dep => toDep(dep, packageJson.devDependencies[dep]))
	// 			: [];
	// 		return deps.concat(devDeps);
	// 	} else {
	// 		return [];
	// 	}
	// }

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

	constructor(
		public readonly label: string,
		//private readonly version: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly command?: vscode.Command
	) {
		super(label, collapsibleState);

		// this.tooltip = `${this.label}-${this.version}`;
		// this.description = this.version;
	}
	// get tooltip(): string {
	// return this.label;
	// }

	// get description(): string {
	// return '';
	// }
	
	iconPath = {
		light: path.join(__filename, '..', '..', 'resources', 'light', 'dependency.svg'),
		dark: path.join(__filename, '..', '..', 'resources', 'dark', 'dependency.svg')
	};

	contextValue = 'dependency';
}