export interface Company {
    id: number;
    companyName: string;
    companyTaxNumber: string;
    streetAddress1: null | string;
    streetAddress2: null | string;
    city: string;
    state: null | string;
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
    isViewPermission?:any;
    isPrivate?:any;
}

