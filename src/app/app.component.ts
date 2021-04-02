import {Component, NgZone} from '@angular/core';
import {NavigationEnd, Router} from "@angular/router";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  onLogin = false;

  constructor(private zone: NgZone, private router: Router) {
    this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd) {
        if (event.url === '/login' ||
          event.url.includes('/forgot-password') ||
          event.url.includes('/create-konnect-profile')) {
          this.onLogin = true;
        } else {
          this.onLogin = false;
        }
      }
    });
  }

  title = 'konnectapp-user-frontend';
}
