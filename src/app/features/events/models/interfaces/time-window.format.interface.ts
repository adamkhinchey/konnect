export interface TimeWindowFormatInterface {
  startDateTime: null | Date;
  notes?: string;
  endDateTime: null | Date;
}

export interface SuppExhTimeWindowFormatInterface {
  bumpIn: {
    sameAsVenue: number | null;
    timings: TimeWindowFormatInterface[]
  };
  eventTime: {
    sameAsVenue: number | null;
    timings: TimeWindowFormatInterface[]
  };
  bumpOut: {
    sameAsVenue: number | null;
    timings: TimeWindowFormatInterface[]
  };
}
