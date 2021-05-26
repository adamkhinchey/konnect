import {EventFileTypes} from '../types';

export interface EventFilesSignedURLReq {
  fileName: string;
  key: EventFileTypes;
  eventId: number;
  venueId?: number;
  serviceId?: number;
  exhibitorId?: number;
  mimeType: string;
  eventUid: string;
}
