/* eslint-disable @typescript-eslint/naming-convention */
// import * as vscode from 'vscode';
//import { acquireVsCodeApi } from 'vscode';

import {u2csqlmapconfigSelect, U2CSQLMAPCONFIG} from '../modules/db/controllers/sqlconfController';

/*
//tsconfig.json module에 commonjs 사용하므로, 빌드과정에서 import, export가 에러남... 그래서 그냥 jsonData 하드코딩했다.
//sqlconfigExplorer.ts에서 jsonData가져와도, 여기로 전달할 방법이 없음.
import * as fs from 'fs';
import * as path from 'path';

const jsonFilePath = path.join(__dirname, 'sampleData.json');//mock Data(추후 DB연결)
// /Users/ALEMI/workspace/kbank-isb-sql/out/views/explorer/sampleData.json
//const jsonData = fs.readFileSync(jsonFilePath, 'utf-8');
const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));
*/

const jsonData = [
  {
    "SQL_CONFIG": "APP_SQL_CONFIG",
    "SQL_NAMESPACE": "MGT_AMT_001",
    "QUERY_NAME": "z29m8k7",
    "SQL_0": "d6t2e8x"
  },
  {
    "SQL_CONFIG": "APP_SQL_CONFIG",
    "SQL_NAMESPACE": "MGT_AMT_001",
    "QUERY_NAME": "z29m8k777777",
    "SQL_0": "d6t2e8x"
  },
  {
    "SQL_CONFIG": "APP_SQL_CONFIG",
    "SQL_NAMESPACE": "MGT_AMT_001",
    "QUERY_NAME": "z29m8k888888",
    "SQL_0": "d6t2e8x"
  },
  {
    "SQL_CONFIG": "APP_SQL_CONFIG",
    "SQL_NAMESPACE": "MGT_AMT_001",
    "QUERY_NAME": "z29m8k12345",
    "SQL_0": "d6t2e8x"
  },

  {
    "SQL_CONFIG": "CMN_SQL_CONFIG",
    "SQL_NAMESPACE": "ISB_CMN_001",
    "QUERY_NAME": "g7u1h5fffff",
    "SQL_0": "select"
  },
  {
    "SQL_CONFIG": "CMN_SQL_CONFIG",
    "SQL_NAMESPACE": "ISB_CMN_001",
    "QUERY_NAME": "g7u1h5aaaaaaa",
    "SQL_0": "update"
  },
  {
    "SQL_CONFIG": "CMN_SQL_CONFIG",
    "SQL_NAMESPACE": "ISB_CMN_001",
    "QUERY_NAME": "g7u1h5bbbbbb",
    "SQL_0": "delete"
  },
  {
    "SQL_CONFIG": "CMN_SQL_CONFIG",
    "SQL_NAMESPACE": "ISB_CMN_001",
    "QUERY_NAME": "g7u1h5Cccccccc",
    "SQL_0": "insert"
  },


  {
    "SQL_CONFIG": "MGT_SQL_CONFIG",
    "SQL_NAMESPACE": "MGT_PRD_001",
    "QUERY_NAME": "x4q3a6p",
    "SQL_0": "s5e9z1u"
  },

  {
    "SQL_CONFIG": "MGT_SQL_CONFIG",
    "SQL_NAMESPACE": "MGT_PRD_002",
    "QUERY_NAME": "product_one",
    "SQL_0": "select * from table"
  },
  {
    "SQL_CONFIG": "MGT_SQL_CONFIG",
    "SQL_NAMESPACE": "MGT_PRD_002",
    "QUERY_NAME": "product_two",
    "SQL_0": "select * from table2"
  },
  {
    "SQL_CONFIG": "MGT_SQL_CONFIG",
    "SQL_NAMESPACE": "MGT_PRD_002",
    "QUERY_NAME": "product_three",
    "SQL_0": "select * from table3"
  },
  {
    "SQL_CONFIG": "MGT_SQL_CONFIG",
    "SQL_NAMESPACE": "MGT_PRD_003",
    "QUERY_NAME": "product_four",
    "SQL_0": "select * from table4"
  },
  {
    "SQL_CONFIG": "MGT_SQL_CONFIG",
    "SQL_NAMESPACE": "MGT_PRD_003",
    "QUERY_NAME": "product_five",
    "SQL_0": "select * from table5"
  }

];

let sqlcfgIds: Set<string> = new Set();
const vscode = acquireVsCodeApi();

(function () {

//  SqlMapConfigResult();
  for (let i = 0; i < jsonData.length; i++) {
    const item = jsonData[i];
    sqlcfgIds.add(item.SQL_CONFIG);
    console.log("sqlcfgIds:" + item.SQL_CONFIG);
  }
  

  getConfigtoHTML(sqlcfgIds);

  //TO DO : selected된 항목 EventListen -> Namspasce&sql리스트 조회...

  //select evt
  const selectElement = document.getElementById('sqlconfig-list-dropdown') as HTMLSelectElement;
  selectElement.addEventListener('change', (event: Event) => {
    const selectedOption = (event.target as HTMLSelectElement).value;
    console.log(`1. getsqlconfigLists: Select Evt Listen -> POST MESSAGE [` + selectedOption + `]`);
    //window.postMessage(selectedOption);

    //SQL N.S, 쿼리명 조회.
    //let queryList: Map<string, string> = new Map();
    let queryList: {[key: string]: string[]} = {};
    for (let i = 0 ; i < jsonData.length; i++) {
      const item = jsonData[i];
      if(selectedOption === item.SQL_CONFIG){
        if(queryList.hasOwnProperty(item.SQL_NAMESPACE)) {
          queryList[item.SQL_NAMESPACE].push(item.QUERY_NAME);
        } else {
          queryList[item.SQL_NAMESPACE] = [item.QUERY_NAME];
        }
      }
    }
    // for (let i = 0; i < jsonData.length; i++) {
    //   const item = jsonData[i];
    //   if (selectedOption === item.SQL_CONFIG) {
    //     queryList.set(item.SQL_NAMESPACE, item.QUERY_NAME);
    //     console.log("SQL NAMESPACE:" + item.SQL_NAMESPACE + " , QUERY_NAME:" + item.QUERY_NAME);
    //   }
    // }
    // const jsonObj = Object.fromEntries(queryList.entries());
    // const jsonQueryList = JSON.stringify(jsonObj);

    // Webview에서 메시지 전달
    //window.postMessage({ type: 'myEvent', data: { foo: 'bar' } }, '*');
    vscode.postMessage({ type: 'myEvent', queryList: queryList }, '*');

    //window.postMessage(selectedOption);
  });
  

}());

// Listen for messages from the extension
window.addEventListener('message', (event: MessageEvent) => {
  let reqData = event.data;
  console.log('Post Evt Listen -> Received RESULT:' + reqData);
  //TODO: reqData(SQL CONFIG)통해서, namespace,query DB조회.
  let queryList: Map<string, string> = new Map();
  for (let i = 0; i < jsonData.length; i++) {
    const item = jsonData[i];
    if (reqData === item.SQL_CONFIG) {
      queryList.set(item.SQL_NAMESPACE, item.QUERY_NAME);
      console.log("SQL NAMESPACE:" + item.SQL_NAMESPACE + " , QUERY_NAME:" + item.QUERY_NAME);
    }
  }
  getSqlNametoHTML(queryList);

});

function getConfigtoHTML(sqlcfgIds: Set<string>) {
//  function getConfigtoHTML(sqlcfgIds: string[]) {

  const dropDown = document.getElementById('sqlconfig-list-dropdown') as HTMLElement;

  for (let i of sqlcfgIds) {
    const dropItem = document.createElement('option');
    const textItem = document.createTextNode(i as string);
    dropItem.appendChild(textItem);
    dropItem.setAttribute("id", i as string);
    dropItem.setAttribute("value", i as string);
    dropItem.setAttribute("data-id", i as string);
    dropDown.appendChild(dropItem);
  }

}
function getSqlNametoHTML(lst: Map<string,string>){

  const dropDown = document.getElementById('sqlnmspace-list') as HTMLElement;
  //sqlnmspace-list
  for (const [key, value] of lst) {
    console.log(`${key} = ${value}`);
    const dropItem = document.createElement('li');
    const textItem = document.createTextNode(key as string);
    dropItem.appendChild(textItem);
    dropItem.setAttribute("value", value as string);
    dropDown.appendChild(dropItem);
    
  }
}
async function SqlMapConfigResult() {
 let u2cconfigList:U2CSQLMAPCONFIG[];
 u2cconfigList = await u2csqlmapconfigSelect();
 console.log(u2cconfigList);

 let item: string[] = u2cconfigList.map((row:any) => {
    return row.CONFIG_ID;
  });
getConfigtoHTML(item);

//  const getSqlMapConfig = 'SELECT CONFIG_ID ,CONFIG_NAME ,DATA_SOURCE ,USE_YN FROM U2C_SQLMAP_CONFIG ORDER BY CONFIG_NAME';

}

