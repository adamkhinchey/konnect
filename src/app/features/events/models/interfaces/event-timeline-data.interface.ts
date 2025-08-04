export interface EventTimelineDataInterface {
  startDateTime: Date;
  minimumDateTime: Date;
  maxDateTime: Date;
  groups: {
    date: string;
    data: {
      preTime: GroupData[];
      eventTime: GroupData[];
      postTime: GroupData[];
    }
  }[];
}

interface GroupData {

  id: number;
  content?: string;
  startDateTime: Date;
  endDateTime: Date;
  type?: string;
  className?: string;
  services?: ServicesData[];
  exhibitors?: ExhibitorsData[];
}

interface ServicesData {
  id: number; //serviceId
  content?: string;
  primaryContact: null | {
    name: string;
    mobile: string;
    email: string;
  };
  companyWebSite?: string;
  companyName?: string;
  startDateTime: Date; // actual start date time
  endDateTime: Date; //actual end date time
  group: string;
}

interface ExhibitorsData {
  id: number;
  content?: string;
  primaryContact: null | {
    name: string;
    mobile: string;
    email: string;
  };
  companyName?: string;
  companyWebSite?: string;
  startDateTime: Date; // actual start date time
  endDateTime: Date; //actual end date time
  group: string;
}

export const mockTimeLineData: EventTimelineDataInterface = {
  maxDateTime: new Date('2021-06-12T05:38:56'),
  startDateTime: new Date('2021-04-12T05:38:56'),
  minimumDateTime: new Date('2021-04-12T05:38:56'),
  groups: [
    {
      date: '12 APR',
      data: {
        preTime: [
          {
            id: 55,
            content: 'Some content 55',
            className: 'bumpIn',
            type: 'background',
            startDateTime: new Date('2021-04-12T05:38:56'),
            endDateTime: new Date('2021-04-12T06:38:56.'),
            services: [
              {
                id: 99, //serviceId
                content: `service - 1`,
                primaryContact: null,
                companyWebSite: 'www.motupatlu.com',
                startDateTime: new Date('2021-04-12T05:38:56'),// actual start date time
                endDateTime: new Date('2021-04-12T06:30:56'),//actual end date time
                group: '12 APR'
              }
            ],
            exhibitors: [
              {
                id: 100, //serviceId
                content: `Exhibitor - 2`,
                primaryContact: null,
                companyWebSite: 'www.motupatlu.com',
                startDateTime: new Date('2021-04-12T05:38:56'),// actual start date time
                endDateTime: new Date('2021-04-12T06:30:56'),//actual end date time
                group: '12 APR'
              }
            ]
          }
        ],
        eventTime: [],
        postTime: []
      }
    }
  ]
};
