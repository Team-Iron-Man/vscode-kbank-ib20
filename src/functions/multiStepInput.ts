/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { stat } from 'fs';
import { QuickPickItem, window, Disposable, CancellationToken, QuickInputButton, QuickInput, ExtensionContext, QuickInputButtons, Uri, QuickPickItemKind } from 'vscode';
import { activate } from '../extension';
import { SqlConfigService } from "../modules/db/service/SqlConfigService";
import { U2CSQLMAPCONFIG } from "../types/SqlConfig";
/**
 * A multi-step input using window.createQuickPick() and window.createInputBox().
 * 
 * This first part uses the helper class `MultiStepInput` that wraps the API for the multi-step case.
 */
export async function addNameSpace(context: ExtensionContext) {

	class MyButton implements QuickInputButton {
		constructor(public iconPath: { light: Uri; dark: Uri; }, public tooltip: string) { }
	}
/*
	const createResourceGroupButton = new MyButton({
		dark: Uri.file(context.asAbsolutePath('resources/dark/add.svg')),
		light: Uri.file(context.asAbsolutePath('resources/light/add.svg')),
	}, 'Create Resource Group');
*/
	
	//const resourceGroups: QuickPickItem[] = ['APP_SQL_CONFIG', 'BAC_SQL_CONFIG', 'BAU_SQL_CONFIG', 'CMN_SQL_CONFIG', 'FRW_SQL_CONFIG', 'MGT_SQL_CONFIG', 'PAU_SQL_CONFIG']
	//	.map(label => ({ label }));
	const cfg: Map<string, string> = await getSQLConfigLists();
	let resourceGroups: QuickPickItem[] = [];
	let selectedConfigId:string|undefined;

	cfg.forEach((key, value) => {
			//resourceGroups.push({ label: key })
			resourceGroups.push({
				label: key,
				description: value
			})
	});

	interface State {
		title: string;
		step: number;
		totalSteps: number;
		resourceGroup: QuickPickItem | string;
		name: string;	
		runtime: QuickPickItem;
		isRegister: boolean|undefined;
	}

	async function collectInputs() {
		const state = {} as Partial<State>;
		await MultiStepInput.run(input => pickResourceGroup(input, state));
		return state as State;
	}

	const title = '[KBANK] IB20 SQL 네임스페이스 추가';

	async function pickResourceGroup(input: MultiStepInput, state: Partial<State>) {
		const pick = await input.showQuickPick({
			title,
			step: 1,
			totalSteps: 3,
			placeholder: 'SQL CONFIG 선택',
			items: resourceGroups,
			activeItem: typeof state.resourceGroup !== 'string' ? state.resourceGroup : undefined,
			//buttons: [createResourceGroupButton],
			shouldResume: shouldResume
		});
		// if (pick instanceof MyButton) {
		// 	return (input: MultiStepInput) => inputResourceGroupName(input, state);
		// }
		
		selectedConfigId = pick.description
		//console.log(`Quck Input Config 선택:`,pick.label,`, selectedConfigId:`,selectedConfigId)
		state.resourceGroup = pick;
		return (input: MultiStepInput) => inputName(input, state);
	}

	async function inputName(input: MultiStepInput, state: Partial<State>) {
		const additionalSteps = typeof state.resourceGroup === 'string' ? 1 : 0;
		// TODO: Remember current value when navigating back.
		state.name = await input.showInputBox({
			title,
			step: 2 + additionalSteps,
			totalSteps: 3 + additionalSteps,
			value: state.name || '',
			
			prompt: '추가할 SQL 네임스페이스 입력 (예시: PBK_MAN_001) -> ',
			validate: validateNameIsUnique,
			shouldResume: shouldResume
		});

		return (input: MultiStepInput) => pickRuntime(input, state);
	}

	async function pickRuntime(input: MultiStepInput, state: Partial<State>) {

		let configName:string = '', configid:string|undefined
		if(state.resourceGroup != undefined && typeof state.resourceGroup !== 'string'){
			configName = state.resourceGroup.label
			configid = state.resourceGroup.description
		}
		const additionalSteps = typeof state.resourceGroup === 'string' ? 1 : 0;
		const runtimes = await getAvailableRuntimes(state.resourceGroup!, undefined /* TODO: token */);
		// TODO: Remember currently active item when navigating back.
		state.runtime = await input.showQuickPick({
			title,
			step: 3 + additionalSteps,
			totalSteps: 3 + additionalSteps,
			placeholder: '정말 추가하시겠습니까?',
			items: runtimes,
			activeItem: state.runtime,
			shouldResume: shouldResume
		});
		
		if (state.runtime.label === 'Yes'){
			//네임스페이스 insert query
			if(state.name != undefined){
				console.log(`TO DO ::: NAMESPACE INSERT QUERY :NAMESPACE:`,state.name)
				insSQLNameSpace(configid,state.name)
				state.isRegister = true
			}else{
				console.log(`SQL 네임스페이스 추가 실패: state.name undefined !`)
				state.isRegister = false
			}
			
		} else {
			console.log(`SQL 네임스페이스 추가 실패: No 선택 !`)
			//input.setCurrentDispose()
			if(input.current){
				input.current.dispose()
			}else {
				console.log(`SQL 네임스페이스 오류 : quick input dispose 오류 !`)
			}
			state.isRegister = false
		}
	}

	function shouldResume() {
		// Could show a notification with the option to resume.
		return new Promise<boolean>((resolve, reject) => {
			// noop
		});
	}

	async function validateNameIsUnique(name: string) {
		// TO DO SQL네임스페이스 입력값 validation chk (영문, _ (언더바), 숫자, 길이)
		await new Promise(resolve => setTimeout(resolve, 1000));
		// 쿼리 조회
		//checkSqlMap(configid: string, sqlmapname: string)
		let u2cconfigList: U2CSQLMAPCONFIG[]
		let configid: string|undefined, sqlmapname: string
		sqlmapname = name
		configid = selectedConfigId
	  console.log(`sqlmapname:`,sqlmapname,`configid:`,configid)
		u2cconfigList = await SqlConfigService.checkSqlMap(configid,sqlmapname);
		
		if (u2cconfigList.length) {
			// u2cconfigList.map((row: any) => {
			// 	cfg.set(row.CONFIG_ID, row.CONFIG_NAME);
			// })
			return `이미 존재하는 네임스페이스`
		} else {
			console.log('ALM#2-1 [Get Data From DB][2] FAIL => 데이터가 없습니다 !!! ')
			return undefined
		}
		//return name === 'vscode' ? 'Name not unique' : undefined;
	}

	async function getAvailableRuntimes(resourceGroup: QuickPickItem | string, token?: CancellationToken): Promise<QuickPickItem[]> {
		// ...retrieve...
		await new Promise(resolve => setTimeout(resolve, 1000));
		return ['Yes', 'No']
			.map(label => ({ label }));
	}

	async function getSQLConfigLists() {

		let u2cconfigList: U2CSQLMAPCONFIG[]
		let cfg: Map<string, string> = new Map()
		
		u2cconfigList = await SqlConfigService.selectSqlConfig();
		
		if (u2cconfigList.length) {
			u2cconfigList.map((row: any) => {
				cfg.set(row.CONFIG_ID, row.CONFIG_NAME);
			})
		} else {
			console.log('ALM#2-1 [Get Data From DB][2] FAIL => 데이터가 없습니다 !!! ')
		}
		return cfg
	}
	async function insSQLNameSpace(configid:string|undefined, sqlnamespace:string) {
		await SqlConfigService.insertSqlMap(configid,sqlnamespace);
	}

	const state = await collectInputs();
	
	if(state.isRegister){
		window.showInformationMessage(`IB20 네임스페이스 등록 완료 [${state.name}]`);
	}else{
		window.showInformationMessage(`IB20 네임스페이스가 등록되지 않았습니다. 필요한 경우 재시도 하세요.`);
	}
}


export async function delNameSpace(context: ExtensionContext) {

	const cfg: Map<string, string> = await getSQLConfigLists();
	let resourceGroups: QuickPickItem[] = [];
	let mapGroups: QuickPickItem[] = [];
	let selectedConfigId:string|undefined;

	cfg.forEach((key, value) => {
			resourceGroups.push({
				label: key,
				description: value
			})
	});

	interface State {
		title: string;
		step: number;
		totalSteps: number;
		resourceGroup: QuickPickItem | string;
		mapGroup: QuickPickItem | string;
		name: string;
		runtime: QuickPickItem;
		isDelete: boolean|undefined;
	}

	async function collectInputs() {
		const state = {} as Partial<State>;
		await MultiStepInput.run(input => pickResourceGroup(input, state));
		return state as State;
	}

	const title = '[KBANK] IB20 SQL 네임스페이스 삭제';

	async function pickResourceGroup(input: MultiStepInput, state: Partial<State>) {
		const pick = await input.showQuickPick({
			title,
			step: 1,
			totalSteps: 3,
			placeholder: 'SQL CONFIG 선택',
			items: resourceGroups,
			activeItem: typeof state.resourceGroup !== 'string' ? state.resourceGroup : undefined,
			//buttons: [createResourceGroupButton],
			shouldResume: shouldResume
		});
		selectedConfigId = pick.description
		console.log(`Quck Input Config 선택:`,pick.label,`, selectedConfigId:`,selectedConfigId)
		state.resourceGroup = pick;

		const maps: Map<string, string> = await getSqlMap(selectedConfigId);
			
		maps.forEach((key, value) => {
			console.log(`SQL MAP LIST 조회 : `,key, `:`,value.toString())
			mapGroups.push({
				label: key,
				description: value.toString()
			})
		});
		
		return (input: MultiStepInput) => pickmapGroups(input, state);
	}

	async function pickmapGroups(input: MultiStepInput, state: Partial<State>) {
		const additionalSteps = typeof state.resourceGroup === 'string' ? 1 : 0;
		let selectedSqlMapId:string|undefined;

		const pickMap = await input.showQuickPick({
			title,
			step: 2 + additionalSteps,
			totalSteps: 3 + additionalSteps,
			placeholder: '삭제할 SQL 네임스페이스 선택',
			items: mapGroups,
			activeItem: typeof state.mapGroup !== 'string' ? state.mapGroup : undefined,
			
			shouldResume: shouldResume
		});
		selectedSqlMapId = pickMap.description
		state.resourceGroup = pickMap;
		state.mapGroup = pickMap;

		return (input: MultiStepInput) => delsqlMapRuntime(input, state);
	}

	async function getSQLConfigLists() {
		let u2cconfigList: U2CSQLMAPCONFIG[]
		let cfg: Map<string, string> = new Map()
		
		u2cconfigList = await SqlConfigService.selectSqlConfig();
		
		if (u2cconfigList.length) {
			u2cconfigList.map((row: any) => {
				cfg.set(row.CONFIG_ID, row.CONFIG_NAME);
			})
		} else {
			console.log('ALM#2-1 [Get Data From DB][2] FAIL => 데이터가 없습니다 !!! ')
		}
	
		return cfg
	}
	async function getSqlMap(configid: string|undefined) {
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

	async function delSQLNameSpace(sqlmapid:string) {
		await SqlConfigService.deleteSqlMap(sqlmapid);
	}

	async function delsqlMapRuntime(input: MultiStepInput, state: Partial<State>) {
		let sqlmapName:string = '', sqlmapId:string|undefined
		if(state.mapGroup != undefined && typeof state.mapGroup !== 'string'){
			sqlmapName = state.mapGroup.label
			sqlmapId = state.mapGroup.description
		}

		const additionalSteps = typeof state.resourceGroup === 'string' ? 1 : 0;
		const runtimes = await getAvailableRuntimes(state.resourceGroup!, undefined /* TODO: token */);
		// TODO: Remember currently active item when navigating back.
		state.runtime = await input.showQuickPick({
			title,
			step: 3 + additionalSteps,
			totalSteps: 3 + additionalSteps,
			placeholder: '정말 삭제하시겠습니까?',
			items: runtimes,
			activeItem: state.runtime,
			shouldResume: shouldResume
		});

		if (state.runtime.label === 'Yes'){
			//네임스페이스 delete query
			if(sqlmapId!= undefined){
				delSQLNameSpace(sqlmapId)
				state.isDelete = true
			}else{
				console.log(`SQL 네임스페이스 삭제 실패: sqlmapId undefined !`)
				state.isDelete = false
			}
		} else {
			console.log(`SQL 네임스페이스 추가 실패: No 선택 !`)
			if(input.current){
				input.current.dispose()
			}else {
				console.log(`SQL 네임스페이스 오류 : quick input dispose 오류 !`)
			}
			state.isDelete = false
		}
		
	}

	function shouldResume() {
		// Could show a notification with the option to resume.
		return new Promise<boolean>((resolve, reject) => {
			// noop
		});
	}

	async function getAvailableRuntimes(resourceGroup: QuickPickItem | string, token?: CancellationToken): Promise<QuickPickItem[]> {
		// ...retrieve...
		await new Promise(resolve => setTimeout(resolve, 1000));
		return ['Yes', 'No']
			.map(label => ({ label }));
	}

	const state = await collectInputs();
	if(state.isDelete){
		window.showInformationMessage(`IB20 네임스페이스 삭제 완료`);
	}else{
		window.showInformationMessage(`IB20 네임스페이스가 삭제되지 않았습니다. 필요한 경우 재시도 하세요.`);
	}

}


/* sample 영역 ----
export async function multiStepInput(context: ExtensionContext) {

	class MyButton implements QuickInputButton {
		constructor(public iconPath: { light: Uri; dark: Uri; }, public tooltip: string) { }
	}

	const createResourceGroupButton = new MyButton({
		dark: Uri.file(context.asAbsolutePath('resources/dark/add.svg')),
		light: Uri.file(context.asAbsolutePath('resources/light/add.svg')),
	}, 'Create Resource Group');

	//TODO SQL config list 가져오기
	const resourceGroups: QuickPickItem[] = ['APP_SQL_CONFIG', 'BAC_SQL_CONFIG', 'BAU_SQL_CONFIG', 'CMN_SQL_CONFIG', 'FRW_SQL_CONFIG', 'MGT_SQL_CONFIG', 'PAU_SQL_CONFIG']
		.map(label => ({ label }));


	interface State {
		title: string;
		step: number;
		totalSteps: number;
		resourceGroup: QuickPickItem | string;
		name: string;
		runtime: QuickPickItem;
	}

	async function collectInputs() {
		const state = {} as Partial<State>;
		await MultiStepInput.run(input => pickResourceGroup(input, state));
		return state as State;
	}

	const title = 'Create Application Service';

	async function pickResourceGroup(input: MultiStepInput, state: Partial<State>) {
		const pick = await input.showQuickPick({
			title,
			step: 1,
			totalSteps: 3,
			placeholder: 'Pick a SQL CONFIG',
			items: resourceGroups,
			activeItem: typeof state.resourceGroup !== 'string' ? state.resourceGroup : undefined,
			buttons: [createResourceGroupButton],
			shouldResume: shouldResume
		});
		if (pick instanceof MyButton) {
			return (input: MultiStepInput) => inputResourceGroupName(input, state);
		}
		state.resourceGroup = pick;
		return (input: MultiStepInput) => inputName(input, state);
	}

	async function inputResourceGroupName(input: MultiStepInput, state: Partial<State>) {
		state.resourceGroup = await input.showInputBox({
			title,
			step: 2,
			//totalSteps: 4,
			totalSteps: 3,
			value: typeof state.resourceGroup === 'string' ? state.resourceGroup : '',
			prompt: 'Type unique name for the SQL Name Space',
			validate: validateNameIsUnique,
			shouldResume: shouldResume
		});
		return (input: MultiStepInput) => inputName(input, state);
		
	}

	async function inputName(input: MultiStepInput, state: Partial<State>) {
		const additionalSteps = typeof state.resourceGroup === 'string' ? 1 : 0;
		// TODO: Remember current value when navigating back.
		state.name = await input.showInputBox({
			title,
			step: 2 + additionalSteps,
			totalSteps: 3 + additionalSteps,
			value: state.name || '',
			prompt: 'TTType unique name for the SQL Name Space',
			validate: validateNameIsUnique,
			shouldResume: shouldResume
		});
		//return (input: MultiStepInput) => pickRuntime(input, state);
	}

	async function pickRuntime(input: MultiStepInput, state: Partial<State>) {
		const additionalSteps = typeof state.resourceGroup === 'string' ? 1 : 0;
		const runtimes = await getAvailableRuntimes(state.resourceGroup!, undefined );
		// TODO: Remember currently active item when navigating back.
		state.runtime = await input.showQuickPick({
			title,
			step: 3 + additionalSteps,
			totalSteps: 3 + additionalSteps,
			placeholder: '정말 추가하시겠습니까?',
			items: runtimes,
			activeItem: state.runtime,
			shouldResume: shouldResume
		});
		
	}

	function shouldResume() {
		// Could show a notification with the option to resume.
		return new Promise<boolean>((resolve, reject) => {
			// noop
		});
	}

	async function validateNameIsUnique(name: string) {
		// ...validate...
		await new Promise(resolve => setTimeout(resolve, 1000));
		return name === 'vscode' ? 'Name not unique' : undefined;
	}

	async function getAvailableRuntimes(resourceGroup: QuickPickItem | string, token?: CancellationToken): Promise<QuickPickItem[]> {
		// ...retrieve...
		await new Promise(resolve => setTimeout(resolve, 1000));
		return ['Node 8.9', 'Node 6.11', 'Node 4.5']
			.map(label => ({ label }));
	}

	const state = await collectInputs();
	window.showInformationMessage(`Creating Name Space:'${state.name}'`);
}
*/


// -------------------------------------------------------
// Helper code that wraps the API for the multi-step case.
// -------------------------------------------------------
class InputFlowAction {
	static back = new InputFlowAction();
	static cancel = new InputFlowAction();
	static resume = new InputFlowAction();
}

type InputStep = (input: MultiStepInput) => Thenable<InputStep | void>;

interface QuickPickParameters<T extends QuickPickItem> {
	title: string;
	step: number;
	totalSteps: number;
	items: T[];
	activeItem?: T;
	ignoreFocusOut?: boolean;
	placeholder: string;
	buttons?: QuickInputButton[];
	shouldResume: () => Thenable<boolean>;
}

interface InputBoxParameters {
	title: string;
	step: number;
	totalSteps: number;
	value: string;
	prompt: string;
	validate: (value: string) => Promise<string | undefined>;
	buttons?: QuickInputButton[];
	ignoreFocusOut?: boolean;
	placeholder?: string;
	shouldResume: () => Thenable<boolean>;
}

class MultiStepInput {

	static async run<T>(start: InputStep) {
		const input = new MultiStepInput();
		return input.stepThrough(start);
	}

	//private current?: QuickInput;
	public current?: QuickInput;
	private steps: InputStep[] = [];

	private async stepThrough<T>(start: InputStep) {
		let step: InputStep | void = start;
		while (step) {
			this.steps.push(step);
			if (this.current) {
				this.current.enabled = false;
				this.current.busy = true;
			}
			try {
				step = await step(this);
			} catch (err) {
				if (err === InputFlowAction.back) {
					this.steps.pop();
					step = this.steps.pop();
				} else if (err === InputFlowAction.resume) {
					step = this.steps.pop();
				} else if (err === InputFlowAction.cancel) {
					step = undefined;
				} else {
					throw err;
				}
			}
		}
		if (this.current) {
			this.current.dispose();
		}
		
	 	const setCurrentDispose = () =>{
			if (this.current) {
				this.current.dispose();
			}

		}
	}

	async showQuickPick<T extends QuickPickItem, P extends QuickPickParameters<T>>({ title, step, totalSteps, items, activeItem, ignoreFocusOut, placeholder, buttons, shouldResume }: P) {
		const disposables: Disposable[] = [];
		try {
			return await new Promise<T | (P extends { buttons: (infer I)[] } ? I : never)>((resolve, reject) => {
				const input = window.createQuickPick<T>();
				input.title = title;
				input.step = step;
				input.totalSteps = totalSteps;
				input.ignoreFocusOut = ignoreFocusOut ?? false;
				input.placeholder = placeholder;
				input.items = items;
				if (activeItem) {
					input.activeItems = [activeItem];
				}
				input.buttons = [
					...(this.steps.length > 1 ? [QuickInputButtons.Back] : []),
					...(buttons || [])
				];
				disposables.push(
					input.onDidTriggerButton(item => {
						if (item === QuickInputButtons.Back) {
							reject(InputFlowAction.back);
						} else {
							resolve(<any>item);
						}
					}),
					input.onDidChangeSelection(items => resolve(items[0])),
					input.onDidHide(() => {
						(async () => {
							reject(shouldResume && await shouldResume() ? InputFlowAction.resume : InputFlowAction.cancel);
						})()
							.catch(reject);
					})
				);
				if (this.current) {
					this.current.dispose();
				}
				this.current = input;
				this.current.show();
			});
		} finally {
			disposables.forEach(d => d.dispose());
		}
	}

	async showInputBox<P extends InputBoxParameters>({ title, step, totalSteps, value, prompt, validate, buttons, ignoreFocusOut, placeholder, shouldResume }: P) {
		const disposables: Disposable[] = [];
		try {
			return await new Promise<string | (P extends { buttons: (infer I)[] } ? I : never)>((resolve, reject) => {
				const input = window.createInputBox();
				input.title = title;
				input.step = step;
				input.totalSteps = totalSteps;
				input.value = value || '';
				input.prompt = prompt;
				input.ignoreFocusOut = ignoreFocusOut ?? false;
				input.placeholder = placeholder;
				input.buttons = [
					...(this.steps.length > 1 ? [QuickInputButtons.Back] : []),
					...(buttons || [])
				];
				let validating = validate('');
				disposables.push(
					input.onDidTriggerButton(item => {
						if (item === QuickInputButtons.Back) {
							reject(InputFlowAction.back);
						} else {
							resolve(<any>item);
						}
					}),
					input.onDidAccept(async () => {
						const value = input.value;
						input.enabled = false;
						input.busy = true;
						if (!(await validate(value))) {
							resolve(value);
						}
						input.enabled = true;
						input.busy = false;
					}),
					input.onDidChangeValue(async text => {
						const current = validate(text);
						validating = current;
						const validationMessage = await current;
						if (current === validating) {
							input.validationMessage = validationMessage;
						}
					}),
					input.onDidHide(() => {
						(async () => {
							reject(shouldResume && await shouldResume() ? InputFlowAction.resume : InputFlowAction.cancel);
						})()
							.catch(reject);
					})
				);
				if (this.current) {
					this.current.dispose();
				}
				this.current = input;
				this.current.show();
			});
		} finally {
			disposables.forEach(d => d.dispose());
		}
	}
}
