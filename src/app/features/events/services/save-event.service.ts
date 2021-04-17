import {Injectable} from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {EventFunctionTypes} from "../models/types";

@Injectable({
  providedIn: 'root'
})
export class SaveEventService {

  private ownCompanyStatusMap = new Map<EventFunctionTypes, null |boolean | boolean[]>([
    [EventFunctionTypes.CLIENT, true],
    [EventFunctionTypes.EVENT_MANAGER, null]
  ]);

  setIsFnOwnCompany = new BehaviorSubject<Map<EventFunctionTypes, null|boolean | boolean[]>>(this.ownCompanyStatusMap);

  constructor() {
  }
}
