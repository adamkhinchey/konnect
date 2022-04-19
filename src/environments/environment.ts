import timeZones from './timeZones';
import countries from './countries';
import companyCategories from './company-categories';
import eventContactLabels from './event-contact-label-list';

 const APIURL = 'https://yxraels57k.execute-api.ap-southeast-2.amazonaws.com/dev';
//const APIURL = 'http://127.0.0.1:3000/dev';
const siteURL = 'http://dev-user-website.s3-website-ap-southeast-2.amazonaws.com';


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
  eventFileAllowedSize: 100 * 1024 * 1024, // 100MB,
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
  siteURL,
  eventContactLabels
};
