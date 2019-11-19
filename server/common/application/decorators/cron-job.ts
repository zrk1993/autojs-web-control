import 'reflect-metadata';
import { METADATA_CRON } from '../constants';

interface IOptions {
  onlyRunMaster?: boolean;
}

/**
 *
 * @param cronTime The time to fire off your job, This can be in the form of cron syntax
 * @param options @IOptions
 */
export const CronJob = (cronTime: string, options: IOptions = { onlyRunMaster: true }) => {
  return (target: any, propertyKey?: string) => {
    Reflect.defineMetadata(METADATA_CRON, { cronTime, options }, target, propertyKey);
  };
};
