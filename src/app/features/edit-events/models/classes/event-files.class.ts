import {EventFilesInterface} from '../interfaces';

export class EventFiles {
  data: Partial<EventFilesInterface>;

  constructor(param: Partial<EventFilesInterface>) {
    this.data = param;
  }

}
