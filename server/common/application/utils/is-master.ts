/**
 * @Author: kun
 */

import * as cluster from 'cluster';

export function isPM2Master(): boolean {
  return parseInt(process.env.INSTANCE_ID, 10) === 0;
}

export default function isMaster(): boolean {
  return cluster.isMaster || isPM2Master();
}
