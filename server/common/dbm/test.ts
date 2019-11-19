import { Orm } from './orm';

export const db = new Orm({
  connectionLimit: 10,
  host: 'localhost',
  user: 'root',
  password: 'Mysql@123qwer',
  database: 'application',
});

async function main() {

  db.reCartesian([], { id: '' });

  const users2 = await db.table('user').where({ name: 'jake' }).order('age', 'desc').select();
  const users3 = await db.table('user').where('name = ?', ['jake']).limit(10, 20).select();
  const user4 = await db.table('user').where({ name: 'jake' }).field('name', 'age').find();
  const user5 = await db.table('user').where({ name: 'jake' }).findOrEmpty();
  // insert
  await db.table('user').insert({ name: 'jake', age: '22' });
  await db.table('user').insert([{ name: 'jake', age: '22' }, { name: 'jake', age: '22' }]);
  // update
  await db.table('user').where({ name: 'jake' }).update({ name: 'new name' });
  // delete
  await db.table('user').where({ name: 'jake' }).delete();
  // transaction
  const tx = await db.beginTx();
  try {
    await tx.table('user').insert({ name: 'jake' });
    await tx.table('user').where({ name: 'jake' }).update({ name: 'new name' });
    await tx.commit();
  } catch (error) {
    await tx.rollback();
  }
  // row query
  const result = await db.query(`SELECT * FROM user U LEFT JOIN user_roles UR ON UR.user_id = U.id WHERE U.type = ?`, ['type']);
}

main();
