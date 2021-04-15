import {InviteFnCmpCntInterface} from "../interfaces/invite-fn-cmp-cnt.interface";

export class SaveEventClass {
  title = '';
  description = '';
  hasExhibitors = false;
  // @ts-ignore
  createrUserId: number;
  // @ts-ignore
  creatorFromCompanyId: number;
  // @ts-ignore
  client: {
    id: null | number,
    contacts: null | InviteFnCmpCntInterface[],
    isOwnCompany: boolean,
    shouldInvite: null | number,
    invited: null | {
      companyName: string,
      countryId: number,
      city: string,
      contactName: string,
      contactEmail: string
    }
  };

  constructor(param?: Partial<SaveEventClass>) {
    Object.assign(this, param);
  }
}
