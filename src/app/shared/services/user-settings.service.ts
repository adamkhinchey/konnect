import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {UserSettingsInterface} from '../models';

@Injectable({
  providedIn: 'root'
})
export class UserSettingsService {
  settings = new BehaviorSubject<UserSettingsInterface>({});

  constructor() {
  }

  public populateSettings(userInfo: any): void {
    const userSettings: UserSettingsInterface = this.settings.getValue();
    const currentDefaultCompany = (userInfo.associatedCompanies as Array<any>).find((cmp: any) => cmp.id = userInfo.defaultCompanyId);
    this.settings.next({
      ...this.settings.getValue(),
      defaultCompany: currentDefaultCompany ? currentDefaultCompany : userSettings.defaultCompany,
      associatedCompanies: userInfo.associatedCompanies,
      firstName: userInfo.firstName,
      lastName: userInfo.lastName,
      profileImage: userInfo.profileImage
    });
  }
}
