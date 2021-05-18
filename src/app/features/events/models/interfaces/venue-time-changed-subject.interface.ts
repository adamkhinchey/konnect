import {EventTimeSlotTypes} from "../types";
import {TimeWindowFormatInterface} from "./time-window.format.interface";

export interface VenueTimeChangedSubjectInterface {
  venueIndex: number;
  data: TimeWindowFormatInterface[];
}

