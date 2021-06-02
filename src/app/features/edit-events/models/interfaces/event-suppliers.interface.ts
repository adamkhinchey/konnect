import {InviteFnCmpCntInterface} from './invite-fn-cmp-cnt.interface';
import {InviteFnCmpInterface} from './invite-fn-cmp-interface';
import {SuppExhTimeWindowFormatInterface} from './time-window.format.interface';

export interface EventSuppliersInterface {
  notesToAll: string;
  services: {
    name: string;
    requirement: string;
    companyId: number | null;
    contacts: null | InviteFnCmpCntInterface[];
    shouldInvite: null | number,
    invited: null | InviteFnCmpInterface,
    timeWindows: SuppExhTimeWindowFormatInterface,
    isViewPermission?:any
  }[];
}
