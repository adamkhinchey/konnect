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
  allVenuesCompleted: boolean = false;
  venues: any;
  allSuppliers: boolean = false;
  allSuppliersCompleted: boolean = false;
  services: any;
  allExhibitors: boolean = false;
  allExhibitorsCompleted: boolean = false;
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
          console.log(JSON.stringify(res));
          this.data = res.data;
          this.venues = res.data.venues || [];
          this.services = res.data.services || [];
          this.exhibitors = res.data.exhibitors || [];
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
              for (let i = 0; i < venues.length; i++) {
                this.venues = this.data.venues.filter((val: any) => {
                  if (val.id == venues[i].id) {
                    val.isChecked = 1;
                  } 
                  // else {
                  //   val.isChecked = 0;
                  // }
                  return val;
                });
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
              for (let i = 0; i < services.length; i++) {
                this.services = this.data.services.filter((val: any) => {
                  if (val.id == services[i].id) {
                    val.isChecked = 1;
                  }
                  //  else {
                  //   val.isChecked = 0;
                  // }
                  return val;
                });
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
              for (let i = 0; i < exhibitors.length; i++) {
                this.exhibitors = this.data.exhibitors.filter((val: any) => {
                  if (val.id == exhibitors[i].id) {
                    val.isChecked = 1;
                  }
                  // else {
                  //   val.isChecked = 0;
                  // }
                  return val;
                });
              }
            } else {
              this.exhibitors = this.data.exhibitors.map((checked: any) => {
                checked.isChecked = 0;
                return checked;
              });
            }
          }
          let checkedVenueData = this.venues.filter((val: any) => {
            return val.isChecked == 1;
          });
          let completedVenueData = this.venues.filter((val: any) => {
            return val.isCompleted == 1;
          });
          console.log('checked data...', checkedVenueData);
          if (this.venues.length == checkedVenueData.length) {
            this.allVenues = true;
          } else {
            this.allVenues = false;
          }
          if (this.venues.length == completedVenueData.length) {
            this.allVenuesCompleted = true;
          } else {
            this.allVenuesCompleted = false;
          }

          let checkedSupplierData = this.services.filter((val: any) => {
            return val.isChecked == 1;
          });
          let completedSupplierData = this.services.filter((val: any) => {
            return val.isCompleted == 1;
          });
          console.log('checked supplier data...', checkedSupplierData);
          if (this.services.length == checkedSupplierData.length) {
            this.allSuppliers = true;
          } else {
            this.allSuppliers = false;
          }
          if (this.services.length == completedSupplierData.length) {
            this.allSuppliersCompleted = true;
          } else {
            this.allSuppliersCompleted = false;
          }

          let checkedExhibitorData = this.exhibitors.filter((val: any) => {
            return val.isChecked == 1;
          });
          let completedExhibitorData = this.exhibitors.filter((val: any) => {
            return val.isCompleted == 1;
          });
          console.log('checked data...', checkedExhibitorData);
          if (this.exhibitors.length == checkedExhibitorData.length) {
            this.allExhibitors = true;
          } else {
            this.allExhibitors = false;
          }
          if (this.exhibitors.length == completedExhibitorData.length) {
            this.allExhibitorsCompleted = true;
          } else {
            this.allExhibitorsCompleted = false;
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
          if(checked.isCompleted != 1){
          checked.isChecked = 0;
        }
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
      let checkedData = this.venues.filter((val: any) => {
        return val.isChecked == 1;
      });
      console.log('checked data...', checkedData);
      if (this.venues.length == checkedData.length) {
        this.allVenues = true;
      } else {
        this.allVenues = false;
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
          if(checked.isCompleted != 1){
            checked.isChecked = 0;
          }
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
      let checkedData = this.services.filter((val: any) => {
        return val.isChecked == 1;
      });
      console.log('checked data...', checkedData);
      if (this.services.length == checkedData.length) {
        this.allSuppliers = true;
      } else {
        this.allSuppliers = false;
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
          if(checked.isCompleted != 1){
            checked.isChecked = 0;
          }
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
      let checkedData = this.exhibitors.filter((val: any) => {
        return val.isChecked == 1;
      });
      console.log('checked data...', checkedData);
      if (this.exhibitors.length == checkedData.length) {
        this.allExhibitors = true;
      } else {
        this.allExhibitors = false;
      }
    }
  }
}
