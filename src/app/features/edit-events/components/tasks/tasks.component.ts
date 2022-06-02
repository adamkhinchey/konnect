import { Component, Input, OnInit } from '@angular/core';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { AddTaskComponent } from 'src/app/shared/components/add-task/add-task.component';
import { EventService } from '../../services/event.service';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss'],
})
export class TasksComponent implements OnInit {
  active: any = '1';
  @Input() eventData: any;
  data: any;
  allVenues: boolean = false;
  venues: any;
  allSuppliers: boolean = false;
  services: any;
  allExhibitors: boolean = false;
  exhibitors: any;
  constructor(public modalSrvc: NgbModal, public eventSrvc: EventService) {}

  ngOnInit(): void {
    this.eventSrvc
      .getAssignToList(this.eventData.eventData.eventId)
      .subscribe((res: any) => {
        console.log(res);
        this.data = res.data;
        this.venues = this.data.venues || [];
        this.services = this.data.services || [];
        this.exhibitors = this.data.exhibitors || [];
      });
  }

  addTask() {
    let ngbModalOptions: NgbModalOptions = {
      backdrop: 'static',
      keyboard: false,
      size: 'xl',
    };
    const modalRef = this.modalSrvc.open(AddTaskComponent, ngbModalOptions);
    modalRef.componentInstance.ownedByText =
      this.eventData.eventData.ownedByText;
    modalRef.result
      .then((result: any) => {})
      .catch((result: any) => {
        console.log('cancelling');
      });
  }

  onClientChange(ev: any) {
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
