import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Route, Router} from "@angular/router";
import {contentSwitchMapper, devLogger} from "../../../../shared/utils";
import {ActivatedUserModuleRouteService} from "../../../../shared/services";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
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

}
