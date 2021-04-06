import {AfterViewInit, Component, OnInit} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Route, Router} from "@angular/router";
import {contentSwitchMapper, devLogger} from "../../../../shared/utils";
import {ActivatedUserModuleRouteService} from "../../../../shared/services";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  createCompanyMode: { status: boolean; type: { soleTrader: boolean; inc: boolean } } = {
    status: false, type: {soleTrader: false, inc: false}
  };
  contentToShow = contentSwitchMapper['/home/edit-profile'];

  constructor(
    private route: ActivatedRoute,
    private actUsrMdlRouteService: ActivatedUserModuleRouteService,
    private router: Router) {
  }


  ngOnInit(): void {
    this.actUsrMdlRouteService.setRoute(this.route);
    this.switchContentAsPerRoute();
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
}
