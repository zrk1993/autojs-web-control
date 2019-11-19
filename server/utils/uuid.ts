/**
 * @Author: kun
 * @Date: 2019-10
 */

import * as uuid from 'uuid';

export default () => {
  return uuid.v1().replace(/-/gi, '');
};
