import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { EventService } from 'src/app/features/edit-events/services/event.service';

@Component({
  selector: 'app-assign-to',
  templateUrl: './assign-to.component.html',
  styleUrls: ['./assign-to.component.scss'],
})
export class AssignToComponent implements OnInit {
  @Input() creatorFromCompanyId: any;
  @Input() taskId: any = 0;
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
      this.eventSrvc.getAssignToList(this.eventId, this.creatorFromCompanyId, this.taskId).subscribe((res: any) => {
        console.log(res);
        this.data = res.data;
        this.venues = this.data.venues || [];
        this.services = this.data.services || [];
        this.exhibitors = this.data.exhibitors || [];
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
