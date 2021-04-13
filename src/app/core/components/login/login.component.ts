import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, Validators} from '@angular/forms';
import {AuthService} from '../../services/auth.service';
import {devLogger} from "../../../shared/utils";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  clickedLogin = false;
  isLoggedInSubscription = this.auth.isLoggedIn.subscribe(async (value) => {
    if (!value || value.status !== true) {
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
    private auth: AuthService,
    private route: ActivatedRoute,
  ) {
    devLogger('log', {route: this.route.parent})
  }

  ngOnInit(): void {
    if (this.auth.getToken()) {
      // TODO make navigation back to home or /home/events-dashboard
      this.router.navigate(['home', 'edit-profile']);
    }
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
