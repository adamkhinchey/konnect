import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {HttpErrRespHandlerService} from '../../shared/services/http-err-resp-handler.service';
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

  signupAndLoginObserver = {
    next: (user: SignupUserProfile | LoginUserProfile) => {
      this.saveToken(user);
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
    private router: Router) {
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
    ).subscribe(this.signupAndLoginObserver);
  }

  private saveToken(user: SignupUserProfile | LoginUserProfile): void {
    localStorage.setItem(this.jwtKey, user.authrizationToken);
    this.isLoggedIn.next({status: true, user});
  }

  public getToken(): string {
    return localStorage.getItem(this.jwtKey) || '';
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

  async redirectToLogin(): Promise<void> {
    localStorage.clear();
    await this.router.navigate(['login']);
  }
}
