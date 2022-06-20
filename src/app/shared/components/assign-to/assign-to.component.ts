import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { EventService } from 'src/app/features/edit-events/services/event.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-assign-to',
  templateUrl: './assign-to.component.html',
  styleUrls: ['./assign-to.component.scss'],
})
export class AssignToComponent implements OnInit {
  @Input() creatorFromCompanyId: any;
  @Input() taskId: any = 0;
  @Input() assignTo: any = [];
  data: any;
  eventId: any;
  client: any;
  clientChecked: boolean = false;
  eventManager: any;
  evManagerChecked: boolean = false;
  allVenues: boolean = false;
  venues: any;
  allSuppliers: boolean = false;
  services: any;
  allExhibitors: boolean = false;
  exhibitors: any;
  constructor(
    private activeModal: NgbActiveModal,
    public aroute: ActivatedRoute,
    public eventSrvc: EventService
  ) {}

  ngOnInit(): void {
    this.aroute.queryParams.subscribe((param) => {
      console.log('param...', param);
      this.eventId = param.eventId;
      this.eventSrvc
        .getAssignToList(this.eventId, this.creatorFromCompanyId, this.taskId)
        .subscribe((res: any) => {
          console.log(res);
          this.data = res.data;
          this.venues = this.data.venues || [];
          this.services = this.data.services || [];
          this.exhibitors = this.data.exhibitors || [];
          console.log('assign to...', this.assignTo);
          if (this.assignTo && this.assignTo.length) {
            var client = this.assignTo.filter((val: any) => {
              return val.tabType == '1';
            });
            if (client && client.length) {
              this.data.client.isChecked = 1;
            } else {
              this.data.client.isChecked = 0;
            }
            var ev = this.assignTo.filter((val: any) => {
              return val.tabType == '2';
            });
            if (ev && ev.length) {
              this.data.eventManager.isChecked = 1;
            } else {
              this.data.eventManager.isChecked = 0;
            }
            var venues = this.assignTo.filter((val: any) => {
              return val.tabType == '3';
            });
            if (venues && venues.length) {
              for (let i = 0; i < this.data.venues.length; i++) {
                if (venues[i]?.id == this.data.venues[i].id) {
                  this.venues[i].isChecked = 1;
                } else {
                  this.venues[i].isChecked = 0;
                }
              }
            } else {
              this.venues = this.data.venues.map((checked: any) => {
                checked.isChecked = 0;
                return checked;
              });
            }
            var services = this.assignTo.filter((val: any) => {
              return val.tabType == '4';
            });
            if (services && services.length) {
              for (let i = 0; i < this.data.services.length; i++) {
                if (services[i]?.id == this.data.services[i].id) {
                  this.services[i].isChecked = 1;
                } else {
                  this.services[i].isChecked = 0;
                }
              }
            } else {
              this.services = this.data.services.map((checked: any) => {
                checked.isChecked = 0;
                return checked;
              });
            }
            var exhibitors = this.assignTo.filter((val: any) => {
              return val.tabType == '5';
            });
            if (exhibitors && exhibitors.length) {
              for (let i = 0; i < this.data.exhibitors.length; i++) {
                if (exhibitors[i]?.id == this.data.exhibitors[i].id) {
                  this.exhibitors[i].isChecked = 1;
                } else {
                  this.exhibitors[i].isChecked = 0;
                }
              }
            } else {
              this.exhibitors = this.data.exhibitors.map((checked: any) => {
                checked.isChecked = 0;
                return checked;
              });
            }
          }
        });
    });
  }

  public dismiss() {
    this.activeModal.dismiss();
  }

  assign() {
    this.activeModal.close({
      data: {
        client: this.data.client,
        eventManager: this.data.eventManager,
        venues: this.venues,
        services: this.services,
        exhibitors: this.exhibitors,
      },
    });
  }
  onClientChange(ev: any) {
    console.log(this.clientChecked);
    console.log(ev.target.value);
    if (ev) {
      if (ev.target.value == 'false') {
        this.data.client.isChecked = 1;
      } else if (ev.target.value == 'true') {
        this.data.client.isChecked = 0;
      }
      console.log('client check value...', this.data.client.isChecked);
    }
  }
  onEvManagerChange(ev: any) {
    console.log(ev.target.value);
    if (ev) {
      if (ev.target.value == 'false') {
        this.data.eventManager.isChecked = 1;
      } else if (ev.target.value == 'true') {
        this.data.eventManager.isChecked = 0;
      }
      console.log(
        'Ev Manager check value...',
        this.data.eventManager.isChecked
      );
    }
  }
  onAllVenuesChange(ev: any) {
    console.log(ev.target.value);
    if (ev) {
      if (ev.target.value == 'false') {
        console.log('in if');
        this.venues = this.data.venues.map((checked: any) => {
          console.log('checked...', checked);
          checked.isChecked = 1;
          return checked;
        });
      } else if (ev.target.value == 'true') {
        console.log('in else');
        this.venues = this.data.venues.map((checked: any) => {
          checked.isChecked = 0;
          return checked;
        });
      }
    }
  }
  onVenueChange(ev: any, id: any) {
    console.log(ev.target.value);
    if (ev) {
      if (ev.target.value == 'false' || ev.target.value == 0) {
        console.log('in if');
        this.venues = this.data.venues.map((checked: any) => {
          console.log('checked...', checked);
          if (checked.id == id) checked.isChecked = 1;
          return checked;
        });
      } else if (ev.target.value == 'true') {
        console.log('in else');
        this.venues = this.data.venues.map((checked: any) => {
          if (checked.id == id) checked.isChecked = 0;
          return checked;
        });
      }
    }
  }
  onAllSuppliersChange(ev: any) {
    console.log(ev.target.value);
    if (ev) {
      if (ev.target.value == 'false') {
        console.log('in if');
        this.services = this.data.services.map((checked: any) => {
          console.log('checked...', checked);
          checked.isChecked = 1;
          return checked;
        });
      } else if (ev.target.value == 'true') {
        console.log('in else');
        this.services = this.data.services.map((checked: any) => {
          checked.isChecked = 0;
          return checked;
        });
      }
    }
  }
  onSupplierChange(ev: any, id: any) {
    console.log(ev.target.value);
    if (ev) {
      if (ev.target.value == 'false' || ev.target.value == 0) {
        console.log('in if');
        this.services = this.data.services.map((checked: any) => {
          console.log('checked...', checked);
          if (checked.id == id) checked.isChecked = 1;
          return checked;
        });
      } else if (ev.target.value == 'true') {
        console.log('in else');
        this.services = this.data.services.map((checked: any) => {
          if (checked.id == id) checked.isChecked = 0;
          return checked;
        });
      }
    }
  }
  onAllExhibitorsChange(ev: any) {
    console.log(ev.target.value);
    if (ev) {
      if (ev.target.value == 'false') {
        console.log('in if');
        this.exhibitors = this.data.exhibitors.map((checked: any) => {
          console.log('checked...', checked);
          checked.isChecked = 1;
          return checked;
        });
      } else if (ev.target.value == 'true') {
        console.log('in else');
        this.exhibitors = this.data.exhibitors.map((checked: any) => {
          checked.isChecked = 0;
          return checked;
        });
      }
    }
  }
  onExhibitorChange(ev: any, id: any) {
    // console.log(ev.target.value);
    if (ev) {
      if (ev.target.value == 'false' || ev.target.value == 0) {
        // console.log('in if');
        this.exhibitors = this.data.exhibitors.map((checked: any) => {
          // console.log('checked...', checked);
          if (checked.id == id) checked.isChecked = 1;
          return checked;
        });
      } else if (ev.target.value == 'true') {
        // console.log('in else');
        this.exhibitors = this.data.exhibitors.map((checked: any) => {
          if (checked.id == id) checked.isChecked = 0;
          return checked;
        });
      }
    }
  }
}
