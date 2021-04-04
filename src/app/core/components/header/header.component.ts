import {Component, Inject, Input, OnInit} from '@angular/core';
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
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
    @Input() showHeader = false;
    userName: string | undefined;
    userProfileImage: string | undefined;
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
        public userSettingsService: UserSettingsService
    ) {
    }

    ngOnInit(): void {
        this.authService.isLoggedIn.asObservable().pipe(take(1)).subscribe(value => {
            this.userName = this.authService.userInfo.firstName;
            this.userProfileImage = this.authService.userInfo.profileImage;
        });
    }

    trackByDefCmpFn(index: any, item: any): any {
        return item.isDefault;
    }

    navToEditProfile(event: MouseEvent): void {
        event.preventDefault();
        this.router.navigate(['home', 'edit-profile']);
    }

    logout(event: MouseEvent): void {
        this.authService.logout();
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
