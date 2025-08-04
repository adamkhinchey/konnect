import {Component, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {matchControlValues} from '../../../shared/validators';
import {AuthService} from '../../services/auth.service';
import {ToastrService} from 'ngx-toastr';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  sendingRequest = false;
  resetPasswordForm: FormGroup;

  password = new FormControl('', [
    Validators.required,
    Validators.minLength(6),
    Validators.maxLength(12),
  ]);

  repeatPassword = new FormControl('', [
    Validators.required,
    matchControlValues(this.password)
  ]);

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private auth: AuthService,
    private route: ActivatedRoute,
    private toaster: ToastrService) {
    this.resetPasswordForm = this.fb.group({
      password: this.password,
      repeatPassword: this.repeatPassword
    });
  }

  ngOnInit(): void {
    if (this.auth.getToken()) {
      this.router.navigate(['home']);
      return;
    }
    this.password.valueChanges.subscribe(Value => {
      this.resetPasswordForm.get('repeatPassword')?.updateValueAndValidity({onlySelf: true});
    });
  }

  checkValidation(): boolean {
    this.resetPasswordForm.markAllAsTouched();
    return this.resetPasswordForm.valid;
  }

  resetPassword(event: MouseEvent): void | boolean {
    event.preventDefault();
    event.stopPropagation();
    event.preventDefault();
    if (this.sendingRequest) {
      return false;
    }
    this.sendingRequest = true;

    const resetPasswordToken = this.route.snapshot.paramMap.get('token');
    this.auth.resetPassword({resetPasswordToken, password: this.password.value})
      .subscribe(async response => {
        if (response) {
          this.toaster.success('Password changed successfully!');
          await this.router.navigate(['login']);
        } else {
          this.sendingRequest = false;
        }
      }, error => {
        this.sendingRequest = false;
      });
  }
}
