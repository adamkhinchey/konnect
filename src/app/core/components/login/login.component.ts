import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  constructor(private readonly router: Router) {
  }

  ngOnInit(): void {
  }

  async navigateToCreateKonnectProfile(): Promise<void> {
    await this.router.navigate(['create-konnect-profile']);
  }
}
