/**
 * Custom type declaration representing a Notepad note.
 */
export type Note = {
  queryid: "id",
		type: "Query",
		use: "",
		tags: ["queryEdit"],
};
export type SqlEditor = {
  QUERY_ID: string,
  USE_YN: string,
  DESCRIPTION: string,
  QUERY_NAME: string,
  QUERY_TYPE: string,
  SQL_0: string,
  SQL_1: string,
  SQL_2: string,
  SQL_3: string,
  SQL_4: string,
  SQLMAP_ID: string,
	tags: ["sqlEdit"],
};