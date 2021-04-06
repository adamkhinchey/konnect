import {Component, Inject, Input, OnInit} from '@angular/core';
import {animate, style, transition, trigger} from '@angular/animations';
import {AuthService} from "../../services/auth.service";
import {ActivatedRoute, Router} from "@angular/router";
import {ActivatedUserModuleRouteService, UserSettingsService} from "../../../shared/services";
import {devLogger} from "../../../shared/utils";
import {WINDOW} from 'ngx-window-token';
import {UserSettingsInterface} from "../../../shared/models";
import {take} from "rxjs/operators";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  animations: [
    trigger('fade', [
      transition('void => active', [ // using status here for transition
        style({opacity: 0}),
        animate(1000, style({opacity: 1}))
      ]),
      transition('* => void', [
        animate(1000, style({opacity: 0}))
      ])
    ])
  ]
})
export class HeaderComponent implements OnInit {
  @Input() showHeader = false;
  status: boolean = false;
  status2: boolean = false;
  status3: boolean = false;

  activeMenu = '';


  clickEvent() {
    this.status = !this.status;
    this.status2 = false;
    this.status3 = false;
  }

  clickEvent2() {
    this.status2 = !this.status2;
    this.status = false;
    this.status3 = false;
  }

  clickEvent3() {
    this.status3 = !this.status3;
    this.status = false;
    this.status2 = false;
  }

  constructor(
    // tslint:disable-next-line:variable-name
    @Inject(WINDOW) private _window: any,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private actUsrMdlRouteService: ActivatedUserModuleRouteService,
    public userSettingsService: UserSettingsService
  ) {
  }

  ngOnInit(): void {

  }

  trackByDefCmpFn(index: any, item: any): any {
    return item.isDefault;
  }

  navToEditProfile(event: MouseEvent): boolean {
    event.preventDefault();
    this.router.navigate(['home', 'edit-profile']);
    return true;
  }

  logout(event: MouseEvent): void {
    this.authService.logout();
    this.showHeader = false;
    this.hideAllMenus();
  }

  hideAllMenus(): void {
    this.status = false;
    this.status2 = false;
    this.status3 = false;
  }

  switchCompany(event: MouseEvent, company: any): void {
    const currentUserSettings = this.userSettingsService.settings.getValue();
    if (currentUserSettings.defaultCompany.id !== company.id) {
      this.userSettingsService.settings.next({
        ...currentUserSettings,
        defaultCompany: company
      });
    }
  }
}
