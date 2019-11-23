import db from '@/utils/db';

export default class BaseService<T> {
  $tableName: string;
  $tableStructure: T;

  constructor({ tableName }) {
    this.$tableName = tableName;
  }

  async getById(id: string | number): Promise<T> {
    return await db.table(this.$tableName).where({ id }).findOrEmpty();
  }

  async getAll(): Promise<T[]> {
    return await db.table(this.$tableName).select();
  }

  async getPage(): Promise<T[]> {
    return await db.table(this.$tableName).select();
  }

  async deleteById(id: string | number) {
    return await db.table(this.$tableName).where({ id }).delete();
  }

  async insert(data: T): Promise<any>;
  async insert(data: T[]): Promise<void>;
  async insert(data: T|T[]): Promise<any> {
    return await db.table(this.$tableName).insert(data);
  }

  async updateById(id: string|number, data: T) {
    return await db.table(this.$tableName).where({ id }).update(data);
  }  

}