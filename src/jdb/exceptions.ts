export class JDBError extends Error {};

export class JDB_DBINIT_INVPATH extends JDBError {};
export class JDB_DB_INVALIDCONTROLFLOW extends JDBError {};
export class JDB_DBINIT_INVALIDCONTROLFLOW extends JDB_DB_INVALIDCONTROLFLOW {};
