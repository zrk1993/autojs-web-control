import * as mysql from 'mysql';
import { QueryBuilder, Tx, reCartesian } from './';

let pool: mysql.Pool;

export class Orm {
  private logger = console;

  public reCartesian = reCartesian;

  constructor(poolConfig: mysql.PoolConfig) {
    pool = mysql.createPool(poolConfig);

    pool.on('error', error => {
      this.logger.error('soul-orm: ', error.message);
    });

    pool.query('SELECT 1', error => {
      if (error) {
        this.logger.error('soul-orm: ', error.message);
      } else {
        this.logger.info('mysql连接成功！');
      }
    });
  }

  setLogger(logger: Console) {
    this.logger = logger;
  }

  async query(sql: string, values?: any | mysql.QueryOptions, options?: mysql.QueryOptions): Promise<any[]> {
    let opt = null;
    if (arguments.length === 3) {
      opt = Object.assign(options, { sql: options, values });
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
