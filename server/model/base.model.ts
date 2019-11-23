import db from '@/utils/db';

export default class BaseModel<T> {
  db = db;
  tableName: string;
  tableStructure: T;

  constructor(args: { tableName: string}) {
    this.tableName = args.tableName;
  }

  async getById(id: string | number) {}

  async getAll() {}

  async getPage() {}

  async deleteById(id: string | number) {}

}