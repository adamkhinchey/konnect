import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {HttpErrRespHandlerService, UserInfoService} from '../../shared/services';
import {Observable, Subject, Subscription, throwError} from 'rxjs';
import {
  ApiResponseModelInterface,
  CreateProfilePersonalDetails,
  LoginUserProfile,
  SignupUserProfile
} from '../../shared/models';
import {catchError, map, pluck, take} from 'rxjs/operators';
import {devLogger} from '../../shared/utils';
import {Router} from "@angular/router";


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
      this.router.navigate(['home']);
    },
    error: (err: Error) => {
      this.isLoggedIn.next({status: false});
      devLogger('error', err);
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
    },
    complete: () => {
    }
  };

  constructor(
    private http: HttpClient,
    private httpErrRespHandler: HttpErrRespHandlerService,
    private router: Router,
    private userInfoService: UserInfoService) {
  }

  signup(personalDetails: CreateProfilePersonalDetails): Observable<any> | void {
    this.signupSubscription = this.http.post<SignupResponse>(`${this.apiBaseURL}/signup`,
      {...personalDetails})
      .pipe(
        take(1),
        this.httpErrRespHandler.processError(true),
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

  public getToken(): string {
    return localStorage.getItem(this.jwtKey) || '""' ;
  }

  requestPasswordResetLink(email: string): Observable<ApiResponseModelInterface> {
    return this.http.post<ApiResponseModelInterface>(
      `${this.apiBaseURL}/sendResetPasswordLink`,
      {email}
    ).pipe(
      take(1),
      this.httpErrRespHandler.processError(false)
    );
  }

  resetPassword(param: { resetPasswordToken: string | null; password: string }): Observable<any> {
    return this.http.post<ApiResponseModelInterface>(
      `${this.apiBaseURL}/resetPassword`,
      {...param}
    ).pipe(
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
    return this.http.post<ApiResponseModelInterface>(
      `${this.apiBaseURL}/deleteProfile`,
      {...param}
    ).pipe(
      this.httpErrRespHandler.processError()
    );
  }
}
