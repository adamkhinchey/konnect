import {CompanyType} from '../types';

export interface CreateCompanyInterface {
  userId: number;
  companyName: string;
  countryId: number;
  city: string;
  categoryIds: number[];
  website: string;
  description: string;
  companyProfileImage: string;
  companyType: CompanyType;

}
