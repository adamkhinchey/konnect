import {EventFileTypes} from '../types';

export interface EventFileToDbReqInterface {
  eventFileType?: EventFileTypes;
  eventId?: number;
  venueId?: number;
  supplierId?: number;
  exhibitorId?: number;
  filesList?: {
    displayName?: string;
    fileUrl?: string;
    mimeType?: string;
  } [];
}
