import {SuppExhTimeWindowFormatInterface} from "./time-window.format.interface";
import {InviteFnCmpCntInterface} from "./invite-fn-cmp-cnt.interface";
import {InviteFnCmpInterface} from "./invite-fn-cmp-interface";

export interface ExhibitorInterface {
  name: string;
  requirement: string;
  companyId: number | null;
  contacts: null | InviteFnCmpCntInterface[];
  shouldInvite: null | number;
  invited: null | InviteFnCmpInterface;
  standNumber: number | null;
  timeWindows: SuppExhTimeWindowFormatInterface;
}


export interface EventExhibitorListInterface {
  notesToAll: string;
  timeWindowsToAll: SuppExhTimeWindowFormatInterface;
  exhibitors: ExhibitorInterface[];
}
