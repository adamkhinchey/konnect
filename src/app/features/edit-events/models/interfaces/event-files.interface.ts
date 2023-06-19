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

interface FileLinkObject{
  label:string;
  URL:string;
  fileId:number;
}

interface FilesData {
  key: string;
  list: FileListObject[];
  linklist:FileLinkObject[];
  isViewPermission: number; 
  isSelfIncludedInTab: number; 
  isSelfIncludedInSection: number; 
}

interface VenueFile {
  name: string;
  isViewPermission: number; 
  isSelfIncludedInTab: number; 
  isSelfIncludedInSection: number; 
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
  isViewPermission: number; 
  isSelfIncludedInTab: number; 
  isSelfIncludedInSection: number; 
  serviceId: number;
  SSF?: FilesData;
  SIF?: FilesData;
}

interface FilesForAllSuppliers extends FilesData {
  supplierFiles?: SupplierFile[];
}

interface ExhibitorFile {
  name: string;
  isViewPermission: number;
  isSelfIncludedInTab: number; 
  isSelfIncludedInSection: number; 
  exhibitorId: number;
  EBSF?: FilesData;
  EBIF?: FilesData;
}

interface FilesForAllExhibitors extends FilesData {
  exhibitorFiles: ExhibitorFile[];
}
