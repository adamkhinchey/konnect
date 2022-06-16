import { Component, Input, OnInit } from '@angular/core';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { AddTaskComponent } from 'src/app/shared/components/add-task/add-task.component';
import { UserSettingsService } from 'src/app/shared/services';
import { EventService } from '../../services/event.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ConfirmationDialogComponent } from 'src/app/shared/components';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss'],
})
export class TasksComponent implements OnInit {
  active: any = '1';
  @Input() eventData: any;
  defaultCompanyId: any;
  data: any;
  allVenues: boolean = false;
  venues: any;
  allSuppliers: boolean = false;
  services: any;
  allExhibitors: boolean = false;
  exhibitors: any;
  filterData: any = [];
  completedTaskDated: any = [];
  completedTaskUndated: any = [];
  unCompletedTaskDated: any = [];
  uncompletedTaskUndated: any = [];
  undatedcheck: boolean = false;
  undatedcompletedcheck: boolean = false;
  datedcheck: boolean = false;
  datedcompletedcheck: boolean = false;
  assignToData: any = [];
  constructor(
    public modalSrvc: NgbModal,
    public eventSrvc: EventService,
    public userSettingsService: UserSettingsService
  ) {}

  navChange(ev: any) {
    console.log(ev);
    this.active = ev.nextId;
    this.getAssingToList();
  }

  async ngOnInit() {
    await this.getAssingToList();
    await this.getEventTasks();
  }

  async getAssingToList() {
    this.eventSrvc.getAssignToList(this.eventData.eventData.eventId).subscribe(
      (res: any) => {
        console.log(res);
        this.data = res.data;
        this.venues = this.data.venues || [];
        this.services = this.data.services || [];
        this.exhibitors = this.data.exhibitors || [];
        this.getEventTasks();
      },
      (err) => {
        console.log(err);
      }
    );
  }

  async getEventTasks() {
    // this.filterData = [];
    this.userSettingsService.settings.subscribe((value) => {
      console.log(value);
      if (value) {
        this.defaultCompanyId = value.defaultCompany.id;
        if (this.data && this.data.client) {
          if (
            this.data.client.isChecked == 1 ||
            this.data.client.isChecked == true
          ) {
            this.filterData = this.filterData.concat({
              id: this.data.client.id,
              tabType: '1',
              utId:this.data.client.utId
            });
          }
          if (
            this.data.eventManager.isChecked == 1 ||
            this.data.eventManager.isChecked == true
          ) {
            this.filterData = this.filterData.concat({
              id: this.data.eventManager.id,
              tabType: '2',
              utId:this.data.eventManager.utId
            });
          }
          for (let i = 0; i < this.venues.length; i++) {
            if (
              this.venues[i].isChecked == 1 ||
              this.venues[i].isChecked == true
            ) {
              this.filterData = this.filterData.concat({
                id: this.venues[i].id,
                tabType: '3',
                utId:this.venues[i].utId
              });
            }
          }
          for (let i = 0; i < this.services.length; i++) {
            if (
              this.services[i].isChecked == 1 ||
              this.services[i].isChecked == true
            ) {
              this.filterData = this.filterData.concat({
                id: this.services[i].id,
                tabType: '4',
                utId:this.services[i].utId
              });
            }
          }
          for (let i = 0; i < this.exhibitors.length; i++) {
            if (
              this.exhibitors[i].isChecked == 1 ||
              this.exhibitors[i].isChecked == true
            ) {
              this.filterData = this.filterData.concat({
                id: this.exhibitors[i].id,
                tabType: '5',
                utId: this.exhibitors[i].utId
              });
            }
          }
        }
        console.log('filter data...', this.filterData);
        let data = {
          filterData: this.filterData,
          loginCompanyId: value.defaultCompany.id,
          eventId: this.eventData.eventData.eventId,
          section: this.active,
        };
        this.eventSrvc.getEventTasks(data).subscribe(
          (events: any) => {
            console.log('events...', events);
            this.completedTaskDated = events.data.completedTaskDated;
            this.completedTaskUndated = events.data.completedTaskUndated;
            this.unCompletedTaskDated = events.data.unCompletedTaskDated;
            this.uncompletedTaskUndated = events.data.uncompletedTaskUndated;
            console.log('tasks on init...', this.uncompletedTaskUndated);
          },
          (err) => {
            console.log(err);
          }
        );
      }
    });
  }

  addTask() {
    this.eventSrvc
      .getAssignToList(this.eventData.eventData.eventId, this.defaultCompanyId)
      .subscribe(
        (res: any) => {
          console.log(res);
          if (res && res.data && res.data.client) {
            this.assignToData = [];
            if (
              res.data.client.isChecked == 1 ||
              res.data.client.isChecked == true
            ) {
              this.assignToData = this.assignToData.concat({
                id: res.data.client.id,
                tabType: '1',
                companyName: res.data.client.companyName,
                utId:res.data.client.utId
              });
            }
            if (
              res.data.eventManager.isChecked == 1 ||
              res.data.eventManager.isChecked == true
            ) {
              this.assignToData = this.assignToData.concat({
                id: res.data.eventManager.id,
                tabType: '2',
                companyName: res.data.eventManager.companyName,
                utId:res.data.eventManager.utId
              });
            }
            for (let i = 0; i < res.data.venues.length; i++) {
              if (
                res.data.venues[i].isChecked == 1 ||
                res.data.venues[i].isChecked == true
              ) {
                this.assignToData = this.assignToData.concat({
                  id: res.data.venues[i].id,
                  tabType: '3',
                  companyName: res.data.venues[i].companyName,
                  utId:res.data.venues[i].utId
                });
              }
            }
            for (let i = 0; i < res.data.services.length; i++) {
              if (
                res.data.services[i].isChecked == 1 ||
                res.data.services[i].isChecked == true
              ) {
                this.assignToData = this.assignToData.concat({
                  id: res.data.services[i].id,
                  tabType: '4',
                  companyName: res.data.services[i].companyName,
                  utId:res.data.services[i].utId
                });
              }
            }
            for (let i = 0; i < res.data.exhibitors.length; i++) {
              if (
                res.data.exhibitors[i].isChecked == 1 ||
                res.data.exhibitors[i].isChecked == true
              ) {
                this.assignToData = this.assignToData.concat({
                  id: res.data.exhibitors[i].id,
                  tabType: '5',
                  companyName: res.data.exhibitors[i].companyName,
                  utId:res.data.exhibitors[i].utId
                });
              }
            }
          }
          let ngbModalOptions: NgbModalOptions = {
            backdrop: 'static',
            keyboard: false,
            size: 'xl',
          };
          const modalRef = this.modalSrvc.open(
            AddTaskComponent,
            ngbModalOptions
          );
          modalRef.componentInstance.ownedByText =
            this.eventData.eventData.ownedByText;
          modalRef.componentInstance.assignToDataFromPrevious =
            this.assignToData;
          modalRef.result
            .then((result: any) => {
              this.getEventTasks();
            })
            .catch((result: any) => {
              console.log('cancelling');
            });
        },
        (err) => {
          console.log(err);
        }
      );
  }

  onClientChange(ev: any) {
    console.log(ev.target.value);
    if (ev) {
      if (ev.target.value == 'false') {
        this.data.client.isChecked = 1;
      } else if (ev.target.value == 'true') {
        this.data.client.isChecked = 0;
        this.filterData = this.filterData.filter((val: any) => {
          return val.tabType != '1';
        });
      }
      this.getEventTasks();
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
        this.filterData = this.filterData.filter((val: any) => {
          return val.tabType != '2';
        });
      }
      this.getEventTasks();
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
        this.filterData = this.filterData.filter((val: any) => {
          return val.tabType != '3';
        });
      }
      this.getEventTasks();
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
          if (checked.id == id) {
            checked.isChecked = 0;
            this.allVenues = false;
          }
          return checked;
        });
        this.filterData = this.filterData.filter((val: any) => {
          return val.tabType != '3' && val.id != id;
        });
      }
      this.getEventTasks();
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
        this.filterData = this.filterData.filter((val: any) => {
          return val.tabType != '4';
        });
      }
      this.getEventTasks();
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
          if (checked.id == id) {
            checked.isChecked = 0;
            this.allSuppliers = false;
          }
          return checked;
        });
        this.filterData = this.filterData.filter((val: any) => {
          return val.tabType != '4' && val.id != id;
        });
      }
      this.getEventTasks();
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
        this.filterData = this.filterData.filter((val: any) => {
          return val.tabType != '5';
        });
      }
      this.getEventTasks();
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
          if (checked.id == id) {
            checked.isChecked = 0;
            this.allExhibitors = false;
          }
          return checked;
        });
        this.filterData = this.filterData.filter((val: any) => {
          return val.tabType != '5' && val.id != id;
        });
      }
      this.getEventTasks();
    }
  }

  dropUnCompletedUndated(event: CdkDragDrop<string[]>) {
    moveItemInArray(
      this.uncompletedTaskUndated,
      event.previousIndex,
      event.currentIndex
    );
    console.log('tasks after order change...', this.uncompletedTaskUndated);
    let data = {
      loginCompanyId: this.defaultCompanyId,
      eventId: this.eventData.eventData.eventId,
      tasks: this.uncompletedTaskUndated,
    };
    this.eventSrvc.updateTaskOrder(data).subscribe(
      (res: any) => {
        console.log(res);
        this.getEventTasks();
      },
      (err) => {
        console.log(err);
      }
    );
  }

  onUndatedChange(ev: any, taskData: any) {
    console.log(ev.target.checked);
    let data = {
      id: taskData.id,
      eventId: taskData.eventId,
      status: 1,
      checkOnly: 1,
      filterData: this.filterData,
      loginCompanyId: taskData.assignById,
    };

    this.eventSrvc.changeTaskStatus(data).subscribe(
      (res: any) => {
        console.log(res);
        if (res.data.isUpdated == 0) {
          let ngbModalOptions: NgbModalOptions = {
            backdrop: 'static',
            keyboard: false,
          };
          const modalRef = this.modalSrvc.open(
            ConfirmationDialogComponent,
            ngbModalOptions
          );
          modalRef.componentInstance.message = res.message;
          modalRef.result
            .then((result: any) => {
              if (result) {
                let data = {
                  id: taskData.id,
                  eventId: taskData.eventId,
                  status: 1,
                  checkOnly: 0,
                  filterData: this.filterData,
                  loginCompanyId: taskData.assignById,
                };
                this.eventSrvc.changeTaskStatus(data).subscribe(
                  (res: any) => {
                    console.log(res);
                    if (res.data.isUpdated == 1) {
                      this.getEventTasks();
                    }
                  },
                  (err) => {
                    console.log(err);
                  }
                );
              } else {
                ev.target.checked = false;
              }
            })
            .catch((result: any) => {
              ev.target.checked = false;
            });
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

  onUndatedCompletedChange(ev: any, taskData: any) {
    console.log(ev.target.checked);
    let data = {
      id: taskData.id,
      eventId: taskData.eventId,
      status: 0,
      checkOnly: 1,
      filterData: this.filterData,
      loginCompanyId: taskData.assignById,
    };

    this.eventSrvc.changeTaskStatus(data).subscribe(
      (res: any) => {
        console.log(res);
        if (res.data.isUpdated == 0) {
          let ngbModalOptions: NgbModalOptions = {
            backdrop: 'static',
            keyboard: false,
          };
          const modalRef = this.modalSrvc.open(
            ConfirmationDialogComponent,
            ngbModalOptions
          );
          modalRef.componentInstance.message = res.message;
          modalRef.result
            .then((result: any) => {
              if (result) {
                let data = {
                  id: taskData.id,
                  eventId: taskData.eventId,
                  status: 0,
                  checkOnly: 0,
                  filterData: this.filterData,
                  loginCompanyId: taskData.assignById,
                };
                this.eventSrvc.changeTaskStatus(data).subscribe(
                  (res: any) => {
                    console.log(res);
                    if (res.data.isUpdated == 1) {
                      this.getEventTasks();
                    }
                  },
                  (err) => {
                    console.log(err);
                  }
                );
              } else {
                ev.target.checked = true;
              }
            })
            .catch((result: any) => {
              ev.target.checked = true;
            });
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

  editTask(data: any) {
    console.log(data);
    this.assignToData = [];
    this.eventSrvc
      .getAssignToList(data.eventId, data.assignById, data.taskId)
      .subscribe(
        (res: any) => {
          console.log(res);
          if (res && res.data && res.data.client) {
            if (
              res.data.client.isChecked == 1 ||
              res.data.client.isChecked == true
            ) {
              this.assignToData = this.assignToData.concat({
                id: res.data.client.id,
                tabType: '1',
                companyName: res.data.client.companyName,
                utId:res.data.client.utId
              });
            }
            if (
              res.data.eventManager.isChecked == 1 ||
              res.data.eventManager.isChecked == true
            ) {
              this.assignToData = this.assignToData.concat({
                id: res.data.eventManager.id,
                tabType: '2',
                companyName: res.data.eventManager.companyName,
                utId:res.data.eventManager.utId
              });
            }
            for (let i = 0; i < res.data.venues.length; i++) {
              if (
                res.data.venues[i].isChecked == 1 ||
                res.data.venues[i].isChecked == true
              ) {
                this.assignToData = this.assignToData.concat({
                  id: res.data.venues[i].id,
                  tabType: '3',
                  companyName: res.data.venues[i].companyName,
                  utId:res.data.venues[i].utId
                });
              }
            }
            for (let i = 0; i < res.data.services.length; i++) {
              if (
                res.data.services[i].isChecked == 1 ||
                res.data.services[i].isChecked == true
              ) {
                this.assignToData = this.assignToData.concat({
                  id: res.data.services[i].id,
                  tabType: '4',
                  companyName: res.data.services[i].companyName,
                  utId:res.data.services[i].utId
                });
              }
            }
            for (let i = 0; i < res.data.exhibitors.length; i++) {
              if (
                res.data.exhibitors[i].isChecked == 1 ||
                res.data.exhibitors[i].isChecked == true
              ) {
                this.assignToData = this.assignToData.concat({
                  id: res.data.exhibitors[i].id,
                  tabType: '5',
                  companyName: res.data.exhibitors[i].companyName,
                  utId:res.data.exhibitors[i].utId
                });
              }
            }
          }
          let ngbModalOptions: NgbModalOptions = {
            backdrop: 'static',
            keyboard: false,
            size: 'xl',
          };
          const modalRef = this.modalSrvc.open(
            AddTaskComponent,
            ngbModalOptions
          );
          res.data.taskData.eventId = data.eventId;
          modalRef.componentInstance.ownedByText =
            this.eventData.eventData.ownedByText;
          modalRef.componentInstance.taskData = res.data.taskData;
          modalRef.componentInstance.assignToDataFromPrevious =
            this.assignToData;
          modalRef.result
            .then((result: any) => {
              this.getEventTasks();
            })
            .catch((result: any) => {
              console.log('cancelling');
            });
        },
        (err) => {
          console.log(err);
        }
      );
  }
}
