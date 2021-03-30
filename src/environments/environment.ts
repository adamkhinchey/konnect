import timeZones from './timeZones';
import countries from './countries';
import companyCategories from './company-categories';

export const environment = {
  production: false,
  env: 'development',
  timeZones,
  countries,
  companyCategories,
  apiBaseURL: 'https://yxraels57k.execute-api.ap-southeast-2.amazonaws.com/dev',
  jwtKey: 'tkn'
};
