export class JDBError extends Error {};

export class JDB_DBINIT_INVPATH extends JDBError {};
export class JDB_DB_INVALIDCONTROLFLOW extends JDBError {};
export class JDB_DBINIT_INVALIDCONTROLFLOW extends JDB_DB_INVALIDCONTROLFLOW {};
export class JDB_DB_MKTABLE_F1 extends JDBError {};
export class JDB_DB_MKTABLE_EXISTS extends JDBError {};

export class JDB_INTERNALERROR extends JDBError {};
export class JDB_INTERNAL_B64_WRONGINPUTSIZE extends JDB_INTERNALERROR {};
