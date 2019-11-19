import * as sqlstring from 'sqlstring';

export type IQueryFunction = (options: string) => Promise<any>;

export class QueryBuilder {

  private $table: string;
  private $field: string[] = ['*'];
  private $where: string;
  private $limit: number;
  private $offset: number;
  private $order: string;

  private sql: string;
  private queryFunction: IQueryFunction;

  public static table(table: string, opt: { queryFunction: IQueryFunction }): QueryBuilder {
    return new QueryBuilder({ table, queryFunction: opt.queryFunction });
  }

  private constructor({ table, queryFunction }) {
    this.$table = 't_' + table;
    this.queryFunction = queryFunction;
  }

  public async select(): Promise<any[]> {
    let sql = '';
    const inserts = [];

    sql += `SELECT ${this.$field.join(', ')} FROM ${this.$table}`;

    if (this.$where) { sql += ` WHERE ${this.$where}`; }

    if (this.$order) {
      sql += ` ORDER BY ${this.$order}`;
    }

    if (typeof this.$limit !== 'undefined') {
      sql += ` LIMIT ?`;
      inserts.push(this.$limit);
      if (this.$offset) {
        sql += `,?`;
        inserts.push(this.$offset);
      }
    }

    this.sql = sqlstring.format(sql, inserts);
    const result: any = await this.exec();
    return result;
  }

  public async findOrEmpty(): Promise<any> {
    if (!this.limit) {
      this.$limit = 1;
    }
    const result = (await this.select())[0] || null;
    return result;
  }

  public async find(): Promise<any> {
    const result = await this.findOrEmpty();
    if (!result) {
      throw new Error(`Record lookup failed！`);
    }
    return result;
  }

  public async insert(data: any): Promise<any>;
  public async insert(data: any[]): Promise<void>;
  public async insert(param: any | any[]): Promise<any> {
    const insertData: any[] = param[0] ? param : [param];
    const colums = Object.keys(insertData[0]);
    const values = insertData.map((item) => {
      return `(${colums.map(c => sqlstring.escape(item[c])).join(',')})`;
    });

    const sql = `INSERT INTO ?? (??) VALUES ${values.join(',')}`;
    const inserts = [this.$table, colums];
    this.sql = sqlstring.format(sql, inserts);
    const result = await this.exec();
    if (result.affectedRows !== insertData.length) {
      throw new Error('affectedRows not equal data length!');
    }
    return result;
  }

  public async update(data: any): Promise<void> {
    const keys = Object.keys(data);
    const inserts = [];
    inserts.push(this.$table);
    const update = keys.map(key => {
      inserts.push(key, data[key]);
      return `??=?`;
    }).join(',');
    let sql = `UPDATE ?? SET ${update}`;

    if (this.$where) { sql += ` WHERE ${this.$where}`; }

    if (this.$limit) {
      sql += ` LIMIT ?`;
      inserts.push(this.$limit);
    }

    this.sql = sqlstring.format(sql, inserts);
    const result = await this.exec();
    if (this.$limit && result.changedRows !== this.$limit) {
      throw new Error('changedRows not equal limit!');
    }
    return result.changedRows;
  }

  public async delete(): Promise<void> {
    let sql = `DELETE FROM ${this.$table}`;
    if (this.$where) { sql += ` WHERE ${this.$where}`; }

    const inserts = [];

    if (this.$limit) {
      sql += ` LIMIT ?`;
      inserts.push(this.$limit);
    }

    this.sql = sqlstring.format(sql, inserts);
    const result = await this.exec();

    if (this.$limit && result.affectedRows !== this.$limit) {
      throw new Error('affectedRows not equal limit!');
    }
    return result.affectedRows;
  }

  public where(where: any): QueryBuilder;
  public where(where: string, valus?: any[]): QueryBuilder;
  public where(...args: any): QueryBuilder {
    let sql = '';
    let values = [];
    if (typeof args[0] === 'string') {
      sql = args[0];
      values = args[1];
    } else {
      const keys = Object.keys(args[0]).filter(k => args[0][k] !== undefined);
      sql = keys.map(() => `?? = ?`).join(' AND ');
      values = [];
      keys.forEach((key) => {
        values.push(key, args[0][key]);
      });
    }

    if (this.$where) { this.$where += ' AND '; } else {
      this.$where = '';
    }

    this.$where += sqlstring.format(sql, values);
    return this;
  }

  public limit(limit: number, offset?: number) {
    this.$limit = +limit;
    this.$offset = +offset;
    return this;
  }

  public order(field: string, od: string) {
    this.$order = `${field} ${od}`;
    return this;
  }

  public field(...args: string[]) {
    this.$field = args.join(',').split(',');
    return this;
  }

  private async exec(): Promise<void | any[] | any> {
    const result: any = await this.queryFunction(this.sql);
    return result;
  }
}
