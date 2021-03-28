import {Injectable} from '@angular/core';
import {CoreModule} from '../core.module';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {HttpErrRespHandlerService} from '../../shared/services/http-err-resp-handler.service';
import {Observable, Subject, Subscription, throwError} from 'rxjs';
import {ApiResponseModelInterface, CreateProfilePersonalDetails} from '../../shared/models';
import {catchError, map, pluck, take} from 'rxjs/operators';
import {devLogger} from '../../shared/utils';

interface SignupUserProfile extends CreateProfilePersonalDetails {
  _user_date_time: string;
  _tz: string;
  id: number;
  roleId: number;
  authrizationToken: string;
}

interface LoginUserProfile extends CreateProfilePersonalDetails {
  timeZone: string;
  id: number;
  roleId: number;
  createdDate?: string | null;
  headline?: string | null;
  aboutMe?: string | null;
  defaultCompanyId?: number | null;
  msg?: string | null;
  authrizationToken: string;
}

interface SignupResponse extends ApiResponseModelInterface {
  data: {
    user: SignupUserProfile;
  };
}

interface LoginResponse extends ApiResponseModelInterface {
  data: {
    user: LoginUserProfile;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiBaseURL = environment.apiBaseURL;
  private jwtKey = environment.jwtKey;
  private signupSubscription = new Subscription();
  private loginSubscription = new Subscription();
  public isLoggedIn = new Subject<boolean>();

  signupAndLoginObserver = {
    next: (user: SignupUserProfile | LoginUserProfile) => {
      this.saveToken(user.authrizationToken);
    },
    error: (err: Error) => {
      this.isLoggedIn.next(false);
      devLogger('error', err);
    },
    complete: () => {
    }
  };

  constructor(private http: HttpClient, private httpErrRespHandler: HttpErrRespHandlerService) {
  }

  signup(personalDetails: CreateProfilePersonalDetails): Observable<any> | void {
    this.signupSubscription = this.http.post<SignupResponse>(`${this.apiBaseURL}/signup`,
      {...personalDetails})
      .pipe(
        take(1),
        catchError(this.httpErrRespHandler.handleError),
        pluck('data', 'user'),
        map(user => user as SignupUserProfile)
      )
      .subscribe(this.signupAndLoginObserver);
  }

  login(payload: { email: string, password: string }): Observable<any> | void {
    this.loginSubscription = this.http.post<LoginResponse>(
      `${this.apiBaseURL}/login`,
      {email: payload.email, password: payload.password}
    ).pipe(
      take(1),
      catchError(this.httpErrRespHandler.handleError),
      pluck('data', 'user'),
      map(user => {
        if (!user) {
          throw new Error('Nondeterministic response');
        } else {
          return user as LoginUserProfile;
        }
      }),
    ).subscribe(this.signupAndLoginObserver);
  }

  private saveToken(token: string): void {
    localStorage.setItem(this.jwtKey, token);
    this.isLoggedIn.next(true);
  }

  private getToken(): string | null {
    return localStorage.getItem(this.jwtKey);
  }

  requestPasswordResetLink(email: string): Observable<ApiResponseModelInterface> {
    return this.http.post<ApiResponseModelInterface>(
      `${this.apiBaseURL}/sendResetPasswordLink`,
      {email}
    ).pipe(
      take(1),
      catchError(this.httpErrRespHandler.handleError)
    );
  }

  resetPassword(param: { resetPasswordToken: string | null; password: string }): Observable<any> {
    return this.http.post<ApiResponseModelInterface>(
      `${this.apiBaseURL}/resetPassword`,
      {...param}
    ).pipe(
      take(1),
      catchError(this.httpErrRespHandler.handleError)
    );
  }
}
