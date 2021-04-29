import {InviteFnCmpCntInterface} from "../interfaces/invite-fn-cmp-cnt.interface";
import {
  EventSuppliersInterface,
  InviteFnCmpInterface,
  TimeWindowFormatInterface,
  VenueListItemInterface
} from "../interfaces";

export class SaveEventClass {
  title = '';
  description = '';
  hasExhibitors = false;
  // @ts-ignore
  createrUserId: number;
  // @ts-ignore
  creatorFromCompanyId: number;
  // @ts-ignore
  client: null | {
    id: null | number,
    contacts: null | InviteFnCmpCntInterface[],
    isOwnCompany: boolean,
    shouldInvite: null | number,
    invited: null | InviteFnCmpInterface
  };
  // @ts-ignore
  eventManager: null | {
    id: null | number;
    contacts: null | InviteFnCmpCntInterface[],
    isOwnCompany: boolean,
    shouldInvite: null | number,
    requirements: string,
    invited: null | InviteFnCmpInterface
  };

  // @ts-ignore
  venues: null | {
    notesToAll: '',
    list: VenueListItemInterface[]
  };

  constructor(param?: Partial<SaveEventClass>) {
    Object.assign(this, param);
  }
}
