import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Route, Router} from "@angular/router";
import {contentSwitchMapper, devLogger} from "../../../../shared/utils";
import {ActivatedUserModuleRouteService, UserSettingsService} from "../../../../shared/services";
import {Subscription} from "rxjs";
import {EventslistingService} from '../../services/eventslisting.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  events: any;
  createCompanyMode: { status: boolean; type: { soleTrader: boolean; inc: boolean } } = {
    status: false, type: {soleTrader: false, inc: false}
  };
  contentToShow: string | null = null;
  private userSettingsSub: Subscription | undefined;

  constructor(
    private route: ActivatedRoute,
    private actUsrMdlRouteService: ActivatedUserModuleRouteService,
    private router: Router,
    private userSettingsService: UserSettingsService,
    public evntSrvc: EventslistingService) {
  }


  ngOnInit(): void {
    this.actUsrMdlRouteService.setRoute(this.route);
    this.switchContentAsPerRoute();
    this.userSettingsSub = this.userSettingsService.settings.subscribe((value) => {
      if (value && value.associatedCompanies && value.associatedCompanies.length > 0 && value.defaultCompany) {
        if (this.contentToShow === null) {
          this.contentToShow = contentSwitchMapper[this.router.url]  //contentSwitchMapper['/home/edit-profile'];
        }
      } else {
        this.contentToShow = contentSwitchMapper['/home/edit-profile'];
      }
    });
    this.getEvents();
  }

  getEvents() {
    this.evntSrvc.getEventsList(0).subscribe((res: any) => {
      console.log(res);
      this.events = res;
    }, err => {
      console.log(err);
    })
  }

  switchContentAsPerRoute(): void {
    this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd) {
        this.contentToShow = contentSwitchMapper[event.url];
      }
    });
  }

  switchToCreateCompany(event: { status: boolean; type: { soleTrader: boolean; inc: boolean } }): void {
    if (event && event.status) {
      this.createCompanyMode = {...event};
      this.router.navigate(['home', 'create-company']);
    }
  }

  ngOnDestroy(): void {
    this.userSettingsSub?.unsubscribe();
  }
}
