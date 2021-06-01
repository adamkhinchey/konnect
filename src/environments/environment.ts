import timeZones from './timeZones';
import countries from './countries';
import companyCategories from './company-categories';
import eventContactLabels from './event-contact-label-list';

const APIURL = 'https://yxraels57k.execute-api.ap-southeast-2.amazonaws.com/dev';
  // const localProxyURL = 'http://localhost:4202/api';
  // const siteURL = 'http://localhost:4202';
const localProxyURL = 'http://localhost:3000/dev';
const siteURL = 'http://localhost:4200';

export const environment = {
  production: false,
  env: 'development',
  timeZones,
  countries,
  companyCategories,
  apiBaseURL: localProxyURL,
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
