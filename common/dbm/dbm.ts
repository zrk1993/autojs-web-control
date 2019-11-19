import * as mysql from 'mysql';
import * as sqlstring from 'sqlstring';
import { QueryBuilder, Tx, reCartesian } from '.';

let pool: mysql.Pool;
let isDebug = false;

export class DBM {
  private logger = console;

  public reCartesian = reCartesian;

  constructor(poolConfig: mysql.PoolConfig & { isDebug: boolean }) {
    isDebug = poolConfig.isDebug;

    pool = mysql.createPool(poolConfig);

    pool.on('error', error => {
      this.logger.error('soul-dbm: ', error.message);
    });

    pool.query('SELECT 1', error => {
      if (error) {
        this.logger.error('soul-dbm: ', error.message);
      } else {
        this.logger.info('mysql连接成功！');
      }
    });
  }

  format(sql: string, args: object | any[]): string {
    return sqlstring.format(sql, args);
  }

  escape(val: any) {
    return sqlstring.escape(val);
  }

  setLogger(logger: Console) {
    this.logger = logger;
  }

  async query(sql: string, values?: any, options?: any): Promise<any[]> {
    let opt = null;
    if (arguments.length === 3) {
      opt = Object.assign(options, { sql, values });
    } else if (arguments.length === 2) {
      if (Array.isArray(values)) {
        opt = { sql, values };
      } else {
        opt = Object.assign(values, { sql });
      }
    } else {
      opt = { sql };
    }
    return new Promise((resolve, reject) => {
      pool.query(opt, (err: Error, results: any[]) => {
        if (isDebug) { console.info(opt.sql); }
        if (err) {
          err.message += sql;
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  }

  table(tb: string): QueryBuilder {
    return QueryBuilder.table(tb, { queryFunction: this.query });
  }

  private async getPoolConnection(): Promise<mysql.PoolConnection> {
    return new Promise((res, rej) => {
      pool.getConnection((err: Error, connection: mysql.PoolConnection) => {
        if (err) {
          rej(err);
        } else {
          res(connection);
        }
      });
    });
  }

  async beginTx() {
    const conn = await this.getPoolConnection();

    await new Promise((resolve, reject) => {
      conn.beginTransaction((err: Error) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });

    return new Tx({
      query: async (sql: string): Promise<any> => {
        return new Promise((resolve, reject) => {
          conn.query(sql, (err: Error, results: any[]) => {
            if (err) {
              err.message += sql;
              reject(err);
            } else {
              resolve(results);
            }
          });
        });
      },
      commit: async () => {
        return new Promise((resolve, reject) => {
          conn.commit((err: Error) => {
            conn.release();
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        });
      },
      rollback: async () => {
        return new Promise((resolve) => {
          conn.rollback(() => {
            conn.release();
            resolve();
          });
        });
      },
    });
  }
}
