/**
 * @Author: kun
 */

import md5 from './md5';

export default function createSign(data: any, key: string): string {
  const keys = Object.keys(data);
  keys.sort(); // 将所有字段按照ascii码排序
  const signStr = keys.map(k => `${k}=${data[k]}`).join('&');
  const sign = md5(signStr + '&key=' + key);
  return sign;
}
