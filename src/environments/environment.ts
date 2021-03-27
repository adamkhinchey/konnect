import timeZones from './timeZones';
import countries from './countries';

export const environment = {
  production: false,
  env: 'development',
  timeZones,
  countries,
  apiBaseURL: 'https://yxraels57k.execute-api.ap-southeast-2.amazonaws.com/dev',
  jwtKey: 'tkn'
};
