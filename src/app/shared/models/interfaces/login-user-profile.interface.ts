import {CreateProfilePersonalDetails} from './create-profile-personal-details.interface';

export interface LoginUserProfile extends CreateProfilePersonalDetails {
  timeZone: string;
  id: number;
  roleId: number;
  createdDate?: string | null;
  headline?: string | null;
  aboutMe?: string | null;
  defaultCompanyId?: number | null;
  msg?: string | null;
  authrizationToken: string;
  inviteUID?:any;

}
