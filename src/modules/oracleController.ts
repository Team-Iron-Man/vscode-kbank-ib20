/* Copyright (c) 2015, 2022, Oracle and/or its affiliates. */

/******************************************************************************
 *
 * You may not use the identified files except in compliance with the Apache
 * License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * NAME
 *   select2.js
 *
 * DESCRIPTION
 *   Executes queries to show array and object output formats.
 *   Gets results directly without using a ResultSet.
 *
 *   This example uses Node 8's async/await syntax.
 *
 ******************************************************************************/

'use strict';

import { QuickPickItem, window, Disposable, CancellationToken, QuickInputButton, QuickInput, ExtensionContext, QuickInputButtons, Uri } from 'vscode';

const oracledb = require('oracledb');
const oracleConfig = require('./oracleConfig');
const crypto = require("crypto"); //Bcrypt



// Oracledb properties are applicable to all connections and SQL
// executions.  They can also be set or overridden at the individual
// execute() call level

// This script sets outFormat in the execute() call but it could be set here instead:
//
// oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

 async function test01() {

    let connection;
  
    try {
      // Get a non-pooled connection
  
      connection = await oracledb.getConnection(oracleConfig);
  
      // The statement to execute
      const sql =
          `SELECT * FROM U2A_USER`;
  
      let result;
  
      // Default Array Output Format
      result = await connection.execute(sql);
      console.log("----- Banana Farmers (default ARRAY output format) --------");
      console.log(result.rows);
  
      // Optional Object Output Format
      result = await connection.execute(
        sql,
        [], // A bind parameter is needed to disambiguate the following options parameter and avoid ORA-01036
        {
          outFormat: oracledb.OUT_FORMAT_OBJECT,     // outFormat can be OBJECT or ARRAY.  The default is ARRAY
          // prefetchRows:   100,                    // internal buffer allocation size for tuning
          // fetchArraySize: 100                     // internal buffer allocation size for tuning
        }
      );
      console.log("----- Banana Farmers (default OBJECT output format) --------");
      console.log(result.rows[0].USER_ID);
  
    } catch (err) {
      console.error(err);
    } finally {
      if (connection) {
        try {
          // Connections should always be released when not needed
          await connection.close();
        } catch (err) {
          console.error(err);
        }
      }
    }
  }
  
  async function login(id: string): Promise<string>{
      // TODO - DB 로그인 조회
      // TODO - 비밀번호 암호화 비교 처리
  
      let connection;
      let passwd: string = '';
      try {
          // Get a non-pooled connection
          connection = await oracledb.getConnection(oracleConfig);
          // The statement to execute
          const sql =
              `SELECT * FROM U2A_USER WHERE USER_ID =:user_id`;
  
          let result;
          console.log("user_id: "+id);
          // Default Array Output Format
          // result = await connection.execute(sql);
          // console.log("----- U2A_USER (default ARRAY output format) --------");
          // console.log(result.rows);
  
          // Optional Object Output Format
          result = await connection.execute(
              sql,
              [id], // A bind parameter is needed to disambiguate the following options parameter and avoid ORA-01036
              {
                  outFormat: oracledb.OUT_FORMAT_OBJECT,     // outFormat can be OBJECT or ARRAY.  The default is ARRAY
                  // prefetchRows:   100,                    // internal buffer allocation size for tuning
                  // fetchArraySize: 100                     // internal buffer allocation size for tuning
              }
          );
          console.log("----- U2A_USER (default OBJECT output format) --------");
          console.log("rows : "+ result.rows.length);
          if(result.rows.length > 0){
            passwd = result.rows[0].PASSWORD;
          }
      } catch (err) {
          console.error(err);
        } finally {
          if (connection) {
            try {
              // Connections should always be released when not needed
              await connection.close();
            } catch (err) {
              console.error(err);
            }
          }
        }
        return passwd;
  }
  
//login('20160377','20160377');

export {test01, login};