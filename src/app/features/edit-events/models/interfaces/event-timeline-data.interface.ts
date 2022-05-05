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
  companyWebsite?: string;
  companyName?: string;
  startDateTime: Date; // actual start date time
  endDateTime: Date; //actual end date time
  group: string;
  data?: ServicesData1[];
}

interface ServicesData1 {
  id: number; //serviceId
  content?: string;
  primaryContact: null | {
    name: string;
    mobile: string;
    email: string;
  };
  companyWebsite?: string;
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
  companyWebsite?: string;
  startDateTime: Date; // actual start date time
  endDateTime: Date; //actual end date time
  group: string;
  data?: ServicesData1[];
}

export const mockTimeLineData: EventTimelineDataInterface = {
  maxDateTime: new Date('2022-08-31T13:30:59.000Z'),
  startDateTime: new Date('2022-08-31T02:30:22.000Z'),
  minimumDateTime: new Date('2022-08-31T02:30:22.000Z'),
  groups: [
    {
      date: '31 Aug',
      data: {
        preTime: [
          {
            id: 1392,
            content: '02.30 - 06.30',
            className: 'bumpIn',
            type: 'background',
            startDateTime: new Date('2022-08-31T02:30:22.000Z'),
            endDateTime: new Date('2022-08-31T08:30:38.000Z'),
            services: [
              {
                id: 127, //serviceId
                content: `Catering`,
                primaryContact: {
                  email: "testeight8thr@gmail.com",
                  mobile: '',
                  name: '',
                },
                companyWebsite: 'www.motupatlu.com',
                startDateTime: new Date('2022-08-31T03:30:38.000Z'),// actual start date time
                endDateTime: new Date('2022-08-31T06:30:38.000Z'),//actual end date time
                group: '31 Aug',
                data: [
                  {
                    id: 127, //serviceId
                    content: `Catering`,
                    primaryContact: {
                      email: "testeight8thr@gmail.com",
                      mobile: '',
                      name: '',
                    },
                    companyWebsite: 'www.motupatlu.com',
                    startDateTime: new Date('2022-08-31T06:30:38.000Z'),// actual start date time
                    endDateTime: new Date('2022-08-31T08:30:38.000Z'),//actual end date time
                    group: '31 Aug'
                  },
                  {
                    id: 127, //serviceId
                    content: `Catering`,
                    primaryContact: {
                      email: "testeight8thr@gmail.com",
                      mobile: '',
                      name: '',
                    },
                    companyWebsite: 'www.motupatlu.com',
                    startDateTime: new Date('2022-08-31T02:30:38.000Z'),// actual start date time
                    endDateTime: new Date('2022-08-31T03:30:38.000Z'),//actual end date time
                    group: '31 Aug'
                  },
                ]
              },
              {
                id: 127, //serviceId
                content: `Catering`,
                primaryContact: {
                  email: "testeight8thr@gmail.com",
                  mobile: '',
                  name: '',
                },
                companyWebsite: 'www.motupatlu.com',
                startDateTime: new Date('2022-08-31T03:30:38.000Z'),// actual start date time
                endDateTime: new Date('2022-08-31T06:30:38.000Z'),//actual end date time
                group: '31 Aug',
                data: [
                  {
                    id: 127, //serviceId
                    content: `Catering`,
                    primaryContact: {
                      email: "testeight8thr@gmail.com",
                      mobile: '',
                      name: '',
                    },
                    companyWebsite: 'www.motupatlu.com',
                    startDateTime: new Date('2022-08-31T04:30:38.000Z'),// actual start date time
                    endDateTime: new Date('2022-08-31T08:30:38.000Z'),//actual end date time
                    group: '31 Aug'
                  },
                  {
                    id: 127, //serviceId
                    content: `Catering`,
                    primaryContact: {
                      email: "testeight8thr@gmail.com",
                      mobile: '',
                      name: '',
                    },
                    companyWebsite: 'www.motupatlu.com',
                    startDateTime: new Date('2022-08-31T06:30:38.000Z'),// actual start date time
                    endDateTime: new Date('2022-08-31T07:30:38.000Z'),//actual end date time
                    group: '31 Aug'
                  },
                ]
              },
              {
                id: 127, //serviceId
                content: `Catering`,
                primaryContact: {
                  email: "testeight8thr@gmail.com",
                  mobile: '',
                  name: '',
                },
                companyWebsite: 'www.motupatlu.com',
                startDateTime: new Date('2022-08-31T03:30:38.000Z'),// actual start date time
                endDateTime: new Date('2022-08-31T06:30:38.000Z'),//actual end date time
                group: '31 Aug',
              },
            ],
            exhibitors: [
              // {
              //   id: 100, //serviceId
              //   content: `Exhibitor - 2`,
              //   primaryContact: null,
              //   companyWebsite: 'www.motupatlu.com',
              //   startDateTime: new Date('2021-04-12T05:38:56'),// actual start date time
              //   endDateTime: new Date('2021-04-12T06:30:56'),//actual end date time
              //   group: '12 APR'
              // }
            ]
          }
        ],
        eventTime: [
          {
            id: 1418,
            content: '07.30 - 09.30',
            className: 'eventTimes',
            type: 'background',
            startDateTime: new Date('2022-08-31T09:30:37.000Z'),
            endDateTime: new Date('2022-08-31T12:30:37.000Z'),
            services: [
              {
                id: 127, //serviceId
                content: `Catering`,
                primaryContact: {
                  email: "testeight8thr@gmail.com",
                  mobile: '',
                  name: '',
                },
                companyWebsite: 'www.motupatlu.com',
                startDateTime: new Date('2022-08-31T09:30:13.000Z'),// actual start date time
                endDateTime: new Date('2022-08-31T10:30:13.000Z'),//actual end date time
                group: '31 Aug',
                data: [
                  {
                    id: 127, //serviceId
                    content: `Catering`,
                    primaryContact: {
                      email: "testeight8thr@gmail.com",
                      mobile: '',
                      name: '',
                    },
                    companyWebsite: 'www.motupatlu.com',
                    startDateTime: new Date('2022-08-31T11:30:13.000Z'),// actual start date time
                    endDateTime: new Date('2022-08-31T12:30:13.000Z'),//actual end date time
                    group: '31 Aug'
                  },
                ]
              },
              {
                id: 127, //serviceId
                content: `Catering`,
                primaryContact: {
                  email: "testeight8thr@gmail.com",
                  mobile: '',
                  name: '',
                },
                companyWebsite: 'www.motupatlu.com',
                startDateTime: new Date('2022-08-31T09:30:13.000Z'),// actual start date time
                endDateTime: new Date('2022-08-31T10:30:13.000Z'),//actual end date time
                group: '31 Aug',
                data: [
                  {
                    id: 127, //serviceId
                    content: `Catering`,
                    primaryContact: {
                      email: "testeight8thr@gmail.com",
                      mobile: '',
                      name: '',
                    },
                    companyWebsite: 'www.motupatlu.com',
                    startDateTime: new Date('2022-08-31T11:30:13.000Z'),// actual start date time
                    endDateTime: new Date('2022-08-31T12:30:13.000Z'),//actual end date time
                    group: '31 Aug'
                  },
                ]
              },
              {
                id: 127, //serviceId
                content: `Catering`,
                primaryContact: {
                  email: "testeight8thr@gmail.com",
                  mobile: '',
                  name: '',
                },
                companyWebsite: 'www.motupatlu.com',
                startDateTime: new Date('2022-08-31T09:30:13.000Z'),// actual start date time
                endDateTime: new Date('2022-08-31T10:30:13.000Z'),//actual end date time
                group: '31 Aug',
              },
            ],
            exhibitors: [
            ]
          }
        ],
        postTime: [
          {
            id: 1419,
            content: '10.30 - 11.30',
            className: 'bumpOut',
            type: 'background',
            startDateTime: new Date('2022-08-31T12:30:37.000Z'),
            endDateTime: new Date('2022-08-31T15:30:37.000Z'),
            services: [
              {
                id: 127, //serviceId
                content: `Catering`,
                primaryContact: {
                  email: "testeight8thr@gmail.com",
                  mobile: '',
                  name: '',
                },
                companyWebsite: 'www.motupatlu.com',
                startDateTime: new Date('2022-08-31T12:30:03.000Z'),// actual start date time
                endDateTime: new Date('2022-08-31T13:30:03.000Z'),//actual end date time
                group: '31 Aug',
                data: [
                  {
                    id: 127, //serviceId
                    content: `Catering`,
                    primaryContact: {
                      email: "testeight8thr@gmail.com",
                      mobile: '',
                      name: '',
                    },
                    companyWebsite: 'www.motupatlu.com',
                    startDateTime: new Date('2022-08-31T13:30:03.000Z'),// actual start date time
                    endDateTime: new Date('2022-08-31T14:30:03.000Z'),//actual end date time
                    group: '31 Aug',
                  },
                  {
                    id: 127, //serviceId
                    content: `Catering`,
                    primaryContact: {
                      email: "testeight8thr@gmail.com",
                      mobile: '',
                      name: '',
                    },
                    companyWebsite: 'www.motupatlu.com',
                    startDateTime: new Date('2022-08-31T14:30:03.000Z'),// actual start date time
                    endDateTime: new Date('2022-08-31T14:15:03.000Z'),//actual end date time
                    group: '31 Aug',
                  },
                  {
                    id: 127, //serviceId
                    content: `Catering`,
                    primaryContact: {
                      email: "testeight8thr@gmail.com",
                      mobile: '',
                      name: '',
                    },
                    companyWebsite: 'www.motupatlu.com',
                    startDateTime: new Date('2022-08-31T14:18:03.000Z'),// actual start date time
                    endDateTime: new Date('2022-08-31T15:30:03.000Z'),//actual end date time
                    group: '31 Aug',
                  },
                ]
              },
              {
                id: 127, //serviceId
                content: `Catering`,
                primaryContact: {
                  email: "testeight8thr@gmail.com",
                  mobile: '',
                  name: '',
                },
                companyWebsite: 'www.motupatlu.com',
                startDateTime: new Date('2022-08-31T12:30:03.000Z'),// actual start date time
                endDateTime: new Date('2022-08-31T13:30:03.000Z'),//actual end date time
                group: '31 Aug',
                data: [
                  {
                    id: 127, //serviceId
                    content: `Catering`,
                    primaryContact: {
                      email: "testeight8thr@gmail.com",
                      mobile: '',
                      name: '',
                    },
                    companyWebsite: 'www.motupatlu.com',
                    startDateTime: new Date('2022-08-31T13:30:03.000Z'),// actual start date time
                    endDateTime: new Date('2022-08-31T14:30:03.000Z'),//actual end date time
                    group: '31 Aug',
                  },
                  {
                    id: 127, //serviceId
                    content: `Catering`,
                    primaryContact: {
                      email: "testeight8thr@gmail.com",
                      mobile: '',
                      name: '',
                    },
                    companyWebsite: 'www.motupatlu.com',
                    startDateTime: new Date('2022-08-31T14:30:03.000Z'),// actual start date time
                    endDateTime: new Date('2022-08-31T14:15:03.000Z'),//actual end date time
                    group: '31 Aug',
                  },
                  {
                    id: 127, //serviceId
                    content: `Catering`,
                    primaryContact: {
                      email: "testeight8thr@gmail.com",
                      mobile: '',
                      name: '',
                    },
                    companyWebsite: 'www.motupatlu.com',
                    startDateTime: new Date('2022-08-31T14:18:03.000Z'),// actual start date time
                    endDateTime: new Date('2022-08-31T15:30:03.000Z'),//actual end date time
                    group: '31 Aug',
                  },
                ]
              },
              {
                id: 127, //serviceId
                content: `Catering`,
                primaryContact: {
                  email: "testeight8thr@gmail.com",
                  mobile: '',
                  name: '',
                },
                companyWebsite: 'www.motupatlu.com',
                startDateTime: new Date('2022-08-31T12:30:03.000Z'),// actual start date time
                endDateTime: new Date('2022-08-31T13:30:03.000Z'),//actual end date time
                group: '31 Aug',
              },
            ],
            exhibitors: [
            ]
          }
        ]
      }
    }
  ]
};

