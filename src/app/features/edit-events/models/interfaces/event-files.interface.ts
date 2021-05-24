export interface EventFilesInterface {
    eventId: number;
    eventUid: string;
    files: {
      CEMSF?: FilesData;
      CIF?: FilesData;
      EF?: FilesData;
      EMIF?: FilesData;
      FFAV?: FilesForAllVenues
      FFAS?: FilesForAllSuppliers;
      FFAE?: FilesForAllExhibitors;
    };
}

interface FileListObject {
  displayName: string;
  fileUrl: string;
  fileId: number;
  mimeType: string;
}

interface FilesData {
  key: string;
  list: FileListObject[];
}

interface VenueFile {
  name: string;
  isViewPermisssion: number; 
  venueId: number;
  FLOOR_PLAN?: FilesData;
  VSF?: FilesData;
  VIF?: FilesData;
}

interface FilesForAllVenues extends FilesData {
  venuesFiles?: VenueFile[];
}

interface SupplierFile {
  name: string;
  isViewPermisssion: number; 
  serviceId: number;
  SSF?: FilesData;
  SIF?: FilesData;
}

interface FilesForAllSuppliers extends FilesData {
  supplierFiles?: SupplierFile[];
}

interface ExhibitorFile {
  name: string;
  isViewPermisssion: number;
  exhibitorId: number;
  EBSF?: FilesData;
  EBIF?: FilesData;
}

interface FilesForAllExhibitors extends FilesData {
  exhibitorFiles: ExhibitorFile[];
}
