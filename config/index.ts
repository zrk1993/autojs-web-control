import testConfig from './config.test';
import prodConfig from './config.prod';
import defaultConfig from './config';
import { NODE_ENV } from '../utils/enums';

const assignDeep = require('assign-deep');

let envConfig: any;
const env = process.env.NODE_ENV;
switch (env) {
  case NODE_ENV.test:
    envConfig = testConfig;
    break;
  case NODE_ENV.prod:
    envConfig = prodConfig;
  default:
}

assignDeep(defaultConfig, envConfig);

export default defaultConfig;
