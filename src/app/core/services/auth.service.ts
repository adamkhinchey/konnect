import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {HttpErrRespHandlerService, UserInfoService, UserSettingsService} from '../../shared/services';
import {Observable, Subject, Subscription, throwError} from 'rxjs';
import {
  ApiResponseModelInterface,
  CreateProfilePersonalDetails,
  LoginUserProfile,
  SignupUserProfile, UserSettingsInterface
} from '../../shared/models';
import {catchError, map, pluck, take, tap} from 'rxjs/operators';
import {devLogger} from '../../shared/utils';
import {Router} from "@angular/router";
import {NgxSpinnerService} from "ngx-spinner";


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
  public isLoggedIn = new Subject<Partial<{ status: boolean, user: LoginUserProfile | SignupUserProfile }>>();
  public loggedIn = false;
  public user: any = null;
  public userInfo: any = null;

  loginObserver = {
    next: (user: SignupUserProfile | LoginUserProfile) => {
      this.saveToken(user);
      this.loggedIn = true;
      // TODO make navigation back to home or /home/events-dashboard
      this.router.navigate(['home', 'edit-profile']);
    },
    error: (err: Error) => {
      this.isLoggedIn.next({status: false});
      devLogger('error', err);
      this.spinner.hide();
    },
    complete: () => {
    }
  };

  signupAndLoginObserver = {
    next: (user: SignupUserProfile | LoginUserProfile) => {
      this.saveToken(user);
      this.loggedIn = true;
    },
    error: (err: Error) => {
      this.isLoggedIn.next({status: false});
      devLogger('error', err);
      this.spinner.hide();
    },
    complete: () => {
    }
  };

  constructor(
    private http: HttpClient,
    private httpErrRespHandler: HttpErrRespHandlerService,
    private router: Router,
    private userInfoService: UserInfoService,
    private userSettingsService: UserSettingsService,
    private spinner: NgxSpinnerService) {
  }

  signup(personalDetails: CreateProfilePersonalDetails): Observable<any> | void {
    this.spinner.show();
    this.signupSubscription = this.http.post<SignupResponse>(`${this.apiBaseURL}/signup`,
      {...personalDetails})
      .pipe(
        tap(() => {
          this.spinner.hide();
        }, () => {
          this.spinner.hide();
        }),
        take(1),
        this.httpErrRespHandler.processError(true),
        pluck('data', 'user'),
        map(user => user as SignupUserProfile)
      )
      .subscribe(this.signupAndLoginObserver);
  }

  login(payload: { email: string, password: string }): Observable<any> | void {
    this.spinner.show();
    this.loginSubscription = this.http.post<LoginResponse>(
      `${this.apiBaseURL}/login`,
      {email: payload.email, password: payload.password}
    ).pipe(
      tap(() => {
        this.spinner.hide();
      }, () => {
        this.spinner.hide();
      }),
      take(1),
      this.httpErrRespHandler.processError(true),
      pluck('data', 'user'),
      map(user => {
        if (!user) {
          throw new Error('Nondeterministic response');
        } else {
          return user as LoginUserProfile;
        }
      }),
    ).subscribe(this.loginObserver);
  }

  private saveToken(user: SignupUserProfile | LoginUserProfile): void {
    localStorage.setItem(this.jwtKey, user.authrizationToken);
    this.isLoggedIn.next({status: true, user});
  }

  public getToken(): string | null {
    return localStorage.getItem(this.jwtKey);
  }

  requestPasswordResetLink(email: string): Observable<ApiResponseModelInterface> {
    this.spinner.show();
    return this.http.post<ApiResponseModelInterface>(
      `${this.apiBaseURL}/sendResetPasswordLink`,
      {email}
    ).pipe(
      tap(() => {
        this.spinner.hide();
      }, () => {
        this.spinner.hide();
      }),
      take(1),
      this.httpErrRespHandler.processError(false)
    );
  }

  resetPassword(param: { resetPasswordToken: string | null; password: string }): Observable<any> {
    this.spinner.show();
    return this.http.post<ApiResponseModelInterface>(
      `${this.apiBaseURL}/resetPassword`,
      {...param}
    ).pipe(
      tap(() => {
        this.spinner.hide();
      }, () => {
        this.spinner.hide();
      }),
      take(1),
      this.httpErrRespHandler.processError(true)
    );
  }

  getUserInfo(): any {
    return this.userInfo;
  }

  setUserInfo(userInfo: any): void {
    this.userInfo = userInfo;
    this.isLoggedIn.next({status: true});
    this.userSettingsService.populateSettings(this.userInfo);
  }


  async redirectToLogin(): Promise<void> {
    localStorage.clear();
    this.isLoggedIn.next({status: false});
    this.userInfo = null;
    this.user = null;
    this.loggedIn = false;
    await this.router.navigate(['login']);
  }

  logout(): void {
    this.redirectToLogin();
  }

  async checkSession(): Promise<boolean> {
    try {
      this.userInfo = await this.userInfoService.getInfo().toPromise();
      return !!this.userInfo;
    } catch (err) {
      devLogger('error', {authServiceCheckSession: err});
      return false;
    }
  }

  deleteUserProfile(param: { userId: number }): Observable<any> {
    this.spinner.show();
    return this.http.post<ApiResponseModelInterface>(
      `${this.apiBaseURL}/deleteProfile`,
      {...param}
    ).pipe(
      tap(() => {
        this.spinner.hide();
      }, () => {
        this.spinner.hide();
      }),
      this.httpErrRespHandler.processError()
    );
  }
}
