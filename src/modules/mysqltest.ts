const mysqlConfig = require('./mysqlConfig');
import MySQL from './mysqlController';

async function getEmployees() {
  const db = new MySQL(mysqlConfig);
  const sql = 'SELECT * FROM U2A_USER';
  const employees = await db.query(sql);
  console.log(employees);
}
async function login(id: string) {
  const db = new MySQL(mysqlConfig);
  const sql = 'SELECT * FROM U2A_USER WHERE USER_ID = ?';
  const employees = await db.query(sql,[id]);
  //console.log("login result : "+employees);
}

login('20160377');