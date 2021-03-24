import {Injectable} from '@angular/core';
import UserToken from './user-token.class';

@Injectable()
export default class UserPermission {
  canActivate(user: UserToken, id: string): boolean {
    return false;
  }
}
