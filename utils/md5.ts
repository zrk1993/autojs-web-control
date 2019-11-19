/**
 * @Author: kun
 * @Date: 2019-10
 */

import * as crypto from 'crypto';

export default (str: string): string => {
  const md5 = crypto.createHash('md5');
  md5.update(str);
  return md5.digest('hex');
};
