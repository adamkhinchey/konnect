import timeZones from './timeZones';
import countries from './countries';
import companyCategories from './company-categories';
import eventContactLabels from './event-contact-label-list';

const APIURL = 'https://zfyd7d1tbb.execute-api.ap-southeast-2.amazonaws.com/uat';
const siteURL = 'http://uat-user-website.s3-website-ap-southeast-2.amazonaws.com';
const importLambdaUrl = 'https://6fwultw46lxcz6vzrih5pf4qjq0sqhoy.lambda-url.ap-southeast-2.on.aws/';

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
  eventFileAllowedSize: 200 * 1024 * 1024, // 200MB,
  eventFileAllowedFormat: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/msword',
    'application/application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/rtf',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.oasis.opendocument.presentation',
    'application/vnd.oasis.opendocument.spreadsheet',
    'application/vnd.oasis.opendocument.text'
  ],
  eventXLSXAllowedFormat: [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ],
  siteURL,
  importLambdaUrl,
  eventContactLabels,
  headerName:'Konnect UAT'
};
