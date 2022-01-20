import { Component, Inject, Input, OnDestroy, OnInit } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { AuthService } from "../../services/auth.service";
import { ActivatedRoute, Router } from "@angular/router";
import { ActivatedUserModuleRouteService, UserSettingsService } from "../../../shared/services";
import { devLogger } from "../../../shared/utils";
import { WINDOW } from 'ngx-window-token';
import { UserSettingsInterface } from "../../../shared/models";
import { take } from "rxjs/operators";
import { Subscription } from "rxjs";
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  animations: [
    trigger('fade', [
      transition('void => active', [ // using status here for transition
        style({ opacity: 0 }),
        animate(1000, style({ opacity: 1 }))
      ]),
      transition('* => void', [
        animate(1000, style({ opacity: 0 }))
      ])
    ])
  ]
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Input() showHeader = false;
  status: boolean = false;
  status2: boolean = false;
  status3: boolean = false;
  isApproved = false;
  isHeaderDisable: boolean = false;

  activeMenu = '';
  isView = false;
  isViewPermission =false;
  isEmailVerified:boolean | undefined =true
  private userSettingsSub: Subscription | undefined;


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
    @Inject(DOCUMENT) private document: Document,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private actUsrMdlRouteService: ActivatedUserModuleRouteService,
    public userSettingsService: UserSettingsService
  ) {
    this.route.queryParams.subscribe(param => {
      if (param.isView)
        this.isView = param.isView;
    })

  }

  ngOnInit(): void {
    this.userSettingsSub = this.userSettingsService.settings.subscribe((value) => {
      devLogger('log', { settingssss: value });
      this.isEmailVerified =value.isEmailVerified;
      if (value && value.associatedCompanies && value.associatedCompanies.length > 0 && value.defaultCompany && value.isEmailVerified) {
        this.isApproved = true;

      }
      if (value && value.associatedCompanies && value.associatedCompanies.length > 0 && value.defaultCompany){
        this.isViewPermission = true;
      }
    });

  }

  trackByDefCmpFn(index: any, item: any): any {
    return item.isDefault;
  }

  navToEditProfile(event: MouseEvent): boolean {
    if (!this.isView) {
      event.preventDefault();
      this.router.navigate(['home', 'edit-profile']);
      var element = document.getElementById("bodyMain");
      element!.classList.remove("pushable");
      return true;
    }
    return false;
  }

  logout(event: MouseEvent): void {
    this.authService.logout();
    this.showHeader = false;
    this.userSettingsService.reset();
    this.isApproved = false;
    this.hideAllMenus();
    var element = document.getElementById("bodyMain");
    element!.classList.remove("pushable");
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

  ngOnDestroy(): void {
    this.userSettingsSub?.unsubscribe();
  }
}
