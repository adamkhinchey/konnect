import {CreateProfilePersonalDetails} from './create-profile-personal-details.interface';

export interface SignupUserProfile extends CreateProfilePersonalDetails {
  _user_date_time: string;
  _tz: string;
  id: number;
  roleId: number;
  authrizationToken: string;
}
