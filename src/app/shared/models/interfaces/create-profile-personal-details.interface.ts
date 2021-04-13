export interface CreateProfilePersonalDetails {
  email: string;
  password: string;
  firstName: string;
  lastName?: string;
  profileImage?: string;
  countryId: number;
  city: string;
  timeZone: {
    name: string;
    val: string
  } | string;
  mobileNumber: string;
}
