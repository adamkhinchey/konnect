import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Route} from "@angular/router";
import {devLogger} from "../../../../shared/utils";
import {ActivatedUserModuleRouteService} from "../../../../shared/services";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private actUsrMdlRouteService: ActivatedUserModuleRouteService) {
  }

  ngOnInit(): void {
    this.actUsrMdlRouteService.setRoute(this.route);
  }

}
