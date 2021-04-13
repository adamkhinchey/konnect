export type AssociateToCompany = {
  userId: number,
  companyId: number | string,
  assignType: AssociationType.CLAIM | AssociationType.JOIN | AssociationType.INVITES,
  positions?: string | null
};

export enum AssociationType {
  CLAIM = 'claim',
  JOIN = 'join_request',
  INVITES = 'invites'
}
