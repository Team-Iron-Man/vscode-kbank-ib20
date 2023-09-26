import * as vscode from 'vscode';
import { SqlmapDataExplorer, Dependency } from './sqlmapDataExplorer';

export class SearchProvider implements vscode.TreeDataProvider<Dependency> {
  private _onDidChangeTreeData: vscode.EventEmitter<Dependency | undefined | void> = new vscode.EventEmitter<Dependency | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<Dependency | undefined | void> = this._onDidChangeTreeData.event;

  constructor(private readonly sqlmapProvider: SqlmapDataExplorer) {
  }

  setSearchText(text: string | undefined) {
    this.sqlmapProvider.setSearchText(text);
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: Dependency): vscode.TreeItem {
    return element;
  }

  getChildren(element?: Dependency): Thenable<Dependency[]> {
    return this.sqlmapProvider.getChildren(element);
  }

  getParent(element: Dependency): Thenable<Dependency | undefined> {
    return this.sqlmapProvider.getParent(element);
  }
}
