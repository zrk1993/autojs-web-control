import BaseModel from './base.model';

export const tableName = 'admin';
export interface ITableStructure {
  admin_id?: number,
  uname?: string,
  password?: string,
};

export class DeviceModel extends BaseModel<ITableStructure> {

  constructor() {
    super({ tableName });
  }

  async getByName(uname: string): Promise<ITableStructure> {
    return this.$db.table(tableName).where({ uname }).findOrEmpty();
  }

  async changePassword(admin_id: number, newPassword: string) {
    return this.$db.table(tableName).where({ admin_id }).update({
      password: newPassword
    });;
  }

}

export default new DeviceModel();

