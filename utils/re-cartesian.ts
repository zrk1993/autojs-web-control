/**
 * mysql关联查询的结果，可能是个笛卡尔积的形式，这种数据格式并不友好。
 * 这是个辅助工具，来改变这种状况, 要配合{ nestTables: true }使用
 * kun
 * 2019-02-13
 */

interface IStructure {
  table: string;
  id: string;
  [k: string]: IStructure | IStructure[] | string;
}

/**
 * 反笛卡尔积
 * @param dataList sql查询结果集
 * @param structure 结构描述
 * @param results - 递归需要
 */
export default function reCartesian(dataList: any[], structure: IStructure, results: any[] = []): any[] {
  const keyMap = {};

  dataList.forEach(row => {
    const key = row[structure.table][structure.id];
    if (!keyMap[key]) {
      keyMap[key] = [];
      row[structure.table].groups = () => keyMap[key];
      results.push(row[structure.table]);
    }
    keyMap[key].push(row);
  });

  Object.keys(structure)
    .filter(k => !['table', 'id'].find(it => k === it))
    .forEach(key => {
      const value = structure[key];
      const stru: any = Array.isArray(value) ? value[0] : value;
      results.forEach(row => {
        const data = reCartesian(row.groups(), stru);
        row[key] = Array.isArray(value) ? data : data[0];
      });
    });

  return results;
}
