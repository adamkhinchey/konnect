import {Component, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {FormBuilder, Validators} from '@angular/forms';
import {AuthService} from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  clickedLogin = false;
  isLoggedInSubscription = this.auth.isLoggedIn.subscribe(async (value) => {
    if (value && value === true) {
      //await this.router.navigate(['home']);
    } else {
      this.clickedLogin = false;
    }
  });

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });


  constructor(
    private readonly router: Router,
    private readonly fb: FormBuilder,
    private auth: AuthService) {
  }

  ngOnInit(): void {
  }

  checkValidation(): boolean {
    this.loginForm.markAllAsTouched();
    return this.loginForm.valid;
  }

  login(): void {
    this.clickedLogin = true;
    this.auth.login(this.loginForm.value);
  }

  checkIfLoggingIn($event: MouseEvent): void {
    if (this.clickedLogin) {
      $event.preventDefault();
    }
  }

  ngOnDestroy(): void {
    this.isLoggedInSubscription.unsubscribe();
  }
}
