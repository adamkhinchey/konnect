import timeZones from './timeZones';
import countries from './countries';
import companyCategories from './company-categories';

const APIURL = 'https://yxraels57k.execute-api.ap-southeast-2.amazonaws.com/dev';
const siteURL = 'http://dev-user-website.s3-website-ap-southeast-2.amazonaws.com';

export const environment = {
  production: false,
  env: 'development',
  timeZones,
  countries,
  companyCategories,
  apiBaseURL: APIURL,
  jwtKey: 'tkn',
  imageFileUploadSize: 5 * 1024 * 1024, // 5MB
  imageFileAllowedFormats: ['image/jpeg', 'image/png'],
  siteURL
};
