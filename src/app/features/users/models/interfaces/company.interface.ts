export interface Company{
    id: number;
    companyName: string;
    companyTaxNumber: string;
    streetAddress_1: string;
    streetAddress_2: string;
    city: string;
    state: string;
    countryId: number;
    postcode: string;
    phone: string;
    website: string;
    companyProfileImage?: string | null;
    description: string;
    createdDate: string;
    updatedDate: string;
    companyUID: string;
    companyType: string;
    canClaim: number;
    canJoin: number;
}

