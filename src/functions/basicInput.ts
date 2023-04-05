/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { window } from 'vscode';
import MySQL from '../modules/db/controllers/mysqlController';
const mysqlConfig = require('../modules/db/connection/config/mysqlConfig');
const crypto = require("crypto"); //Bcrypt

/**
 * Shows a pick list using window.showQuickPick().
 */
export async function showQuickPick() {
	let i = 0;
	const result = await window.showQuickPick(['eins', 'zwei', 'drei'], {
		placeHolder: 'eins, zwei or drei',
		onDidSelectItem: item => window.showInformationMessage(`Focus ${++i}: ${item}`)
	});
	window.showInformationMessage(`Got: ${result}`);
}

/**
 * Shows an input box using window.showInputBox().
 */
export async function showInputBox():Promise<boolean>{
	let showData : boolean = false;
	showData = await showIDInputBox(false);
	return showData;	
}

async function showIDInputBox(sd: boolean):Promise<boolean>{
	
		let showData:boolean =false;
		const input = window.createInputBox();
		input.password = false;
		input.title = 'IB20 DBIO Login';
		input.step = 1;
		input.totalSteps = 2;
		input.ignoreFocusOut = true;
		input.placeholder = 'ID를 입력해 주세요.';
		input.onDidChangeValue((value) => {
			//window.showInformationMessage(`Changed value: ${value}`);
		});
		
		input.onDidAccept(async (value) => {
			
			window.showInformationMessage(`Dhanged value: ${input.value}`);
			
			let pw:string = await login(input.value);
			
			if(pw === ''){
				input.prompt = '계정이 존재하지 않습니다.';
			}else{
				input.dispose();
				showData = await showPWInputBox(pw);
				if(!showData){
					input.show();
				}
			}
			window.showInformationMessage(`Got: ${pw}`);
			//input.hide();
		});
		input.show();

		return showData;
}


async function showPWInputBox (pw: string): Promise<boolean>{ 
	let showData = false;

	const input = window.createInputBox();
	input.password = false;
	input.title = 'IB20 DBIO Login';
	input.step = 2;
	input.totalSteps = 2;
	input.ignoreFocusOut = true;
	input.placeholder = '패스워드 입력해 주세요.';
	input.onDidChangeValue((value) => {
		//window.showInformationMessage(`Changed value: ${value}`);
	});
	
	input.onDidAccept(async (value) => {
		window.showInformationMessage(`Dhanged value: ${input.value}`);
		let mdValue: String = crypto.createHash('md5').update(input.value).digest("hex");
		window.showInformationMessage(`입력비밀번호:`+ mdValue.toUpperCase());
		if(mdValue.toUpperCase() === pw){
			window.showInformationMessage(`로그인 성공`);
			input.dispose();
			showData = true;
		}else{
			input.prompt = '비밀번호가 틀렸습니다.';
			window.showInformationMessage(`로그인 실패`);
			//input.show();
		}
		
	});

	input.show();
	return showData;
}

async function login(id: string) {
	let password: string  = '';

	const db = new MySQL(mysqlConfig);
	const sql = 'SELECT * FROM U2A_USER WHERE USER_ID = ?';
	const resultData = await db.query(sql,[id]);
	console.log("resultData"+resultData);
	if(resultData === null || resultData.length > 0){
		console.log("login result : "+resultData[0].PASSWORD);
		password = resultData[0].PASSWORD;
	}
	return password; 
  }