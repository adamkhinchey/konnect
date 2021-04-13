import {ConnectionType} from './connection-type.types';

export type SearchGlobalPayload = {
  companyId: any,
  isExternal: number,
  regionId: null | number,
  entityType: ConnectionType,
  pageNo: number,
  pageSize: number,
  keyword: string | null
}
