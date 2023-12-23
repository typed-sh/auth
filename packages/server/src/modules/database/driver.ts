import Sqlite from 'better-sqlite3';

export const createDatabaseDriver = (filepath: string) => new Sqlite(filepath);
