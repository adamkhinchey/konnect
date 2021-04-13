import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AuthService} from '../../services/auth.service';
import {Router} from '@angular/router';
import {ToastrService} from 'ngx-toastr';
import {checkRxFormValidation} from "../../../shared/utils";

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private toaster: ToastrService) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    if (this.auth.getToken()) {
      this.router.navigate(['home']);
    }
  }

  checkValidity(): boolean {
    return checkRxFormValidation(this.forgotPasswordForm);
  }

  async sendResetPassLink(event: MouseEvent): Promise<void> {
    event.preventDefault();
    this.auth.requestPasswordResetLink(this.forgotPasswordForm.get('email')?.value)
      .subscribe(async _ => {
        this.toaster.success('Password instructions will be sent if email is registered with the us!');
        await this.router.navigate(['login']);
      });
  }
}
