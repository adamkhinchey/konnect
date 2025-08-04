export interface EventurlToDbReqInterface {
  eventId?: number;
  venueId?: number;
  supplierId?: number;
  exhibitorId?: number;
  filelinkdata?: {
    fileLinks?: {
        label?:string,
        URL?:string
    };
  } [];
}
