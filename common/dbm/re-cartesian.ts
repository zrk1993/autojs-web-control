/**
 * kun
 * 2019-02-13
 */

interface IStructure {
  id: string;
  [k: string]: IStructure | IStructure[] | string;
}

/**
 * 反笛卡尔积
 * @param dataList sql查询结果集
 * @param structure 结构描述
 * @param results - 递归需要
 */
export function reCartesian(dataList: any[], structure: IStructure, results: any[] = []): any[] {
  const keyMap = {};

  dataList.forEach(row => {
    const [table, id] = structure.id.split('.');
    const key = row[table][id];
    if (key === null) { return; }
    if (!keyMap[key]) {
      keyMap[key] = [];
      row[table].groups = () => keyMap[key];
      results.push(row[table]);
    }
    keyMap[key].push(row);
  });

  Object.keys(structure)
    .filter(k => !['id'].find(it => k === it))
    .forEach((key) => {
      const value = structure[key];
      const stru: any = Array.isArray(value) ? value[0] : value;
      results.forEach(row => {
        const data = reCartesian(row.groups(), typeof stru === 'string' ? { id: stru } : stru);
        row[key] = Array.isArray(value) ? data : data[0];
      });
    });

  return results;
}
