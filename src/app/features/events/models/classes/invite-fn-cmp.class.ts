import {InviteFnCmpInterface} from "../interfaces";

export class InviteFnCmpClass implements InviteFnCmpInterface {
  city: string;
  companyName: string;
  contactEmail: string;
  contactName: string;
  countryId: number;

  constructor(param: InviteFnCmpInterface) {
    this.city = param.city;
    this.companyName = param.companyName;
    this.contactEmail = param.contactEmail;
    this.contactName = param.contactName;
    this.countryId = param.countryId;
  }
}
