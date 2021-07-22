import { InviteFnCmpCntInterface } from "./invite-fn-cmp-cnt.interface";
import { TimeWindowFormatInterface } from "./time-window.format.interface";
import { InviteFnCmpInterface } from "./invite-fn-cmp-interface";
import { EventSuppliersInterface } from "./event-suppliers.interface";
import { EventExhibitorListInterface } from "./event-exhibitor-list.interface";

export interface VenueListItemInterface {

  companyId: null | number;
  contacts: null | InviteFnCmpCntInterface[];
  preEventAccessDateTimes: TimeWindowFormatInterface[];
  eventAccessDateTimes: TimeWindowFormatInterface[];
  postEventAccessDateTimes: TimeWindowFormatInterface[];
  requirements: '';
  internalCmpNotes?: null | string;
  shouldInvite: null | number;
  invited: null | InviteFnCmpInterface;
  suppliers: EventSuppliersInterface[];
  exhibitorList: EventExhibitorListInterface[];
  status?: null | number;
  isStaffOrAdmin?: null | number;
  isViewPermission?: null | number;
  streetAddress1?: null | string;
  streetAddress2?: null | string;
  state?: null | string;
}
