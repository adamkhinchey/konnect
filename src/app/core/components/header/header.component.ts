import {Component, Inject, Input, OnInit} from '@angular/core';
import {AuthService} from "../../services/auth.service";
import {ActivatedRoute, Router} from "@angular/router";
import {ActivatedUserModuleRouteService} from "../../../shared/services";
import {devLogger} from "../../../shared/utils";
import {WINDOW} from 'ngx-window-token';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @Input() showHeader = false;
  status: boolean = false;
  status2: boolean = false;
  status3: boolean = false;

  clickEvent() {
    this.status = !this.status;
  }

  clickEvent2() {
    this.status2 = !this.status2;
  }

  clickEvent3() {
    this.status3 = !this.status3;
  }

  constructor(
    // tslint:disable-next-line:variable-name
    @Inject(WINDOW) private _window: any,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private actUsrMdlRouteService: ActivatedUserModuleRouteService,
  ) {
  }

  ngOnInit(): void {
  }

  navToEditProfile(event: MouseEvent): void {
    event.preventDefault();
    this.router.navigate([{outlets: {dashboard: 'edit-profile'}}], {
      relativeTo: this.actUsrMdlRouteService.userModuleRoute,
    });
  }

  logout(event: MouseEvent): void {
    this.authService.logout();
  }
}
