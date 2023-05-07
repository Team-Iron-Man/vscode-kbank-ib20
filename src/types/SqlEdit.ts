/**
 * Custom type declaration representing a Notepad note.
 */
export type SqlEdit = {
    title: string;
    id: string;
    type: string;
    use: string;
    sql: string;
    sqlnamespace: string;
    tags?: string[];
  };
  