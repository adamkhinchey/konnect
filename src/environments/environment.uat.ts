import timeZones from './timeZones';
import countries from './countries';
import companyCategories from './company-categories';

const APIURL = 'https://zfyd7d1tbb.execute-api.ap-southeast-2.amazonaws.com/uat';
const siteURL = 'http://uat-user-website.s3-website-ap-southeast-2.amazonaws.com';

export const environment = {
  production: false,
  env: 'uat',
  timeZones,
  countries,
  companyCategories,
  apiBaseURL: APIURL,
  jwtKey: 'tkn',
  imageFileUploadSize: 5 * 1024 * 1024, // 5MB
  imageFileAllowedFormats: ['image/jpeg', 'image/png'],
  siteURL
};
