import { Component, Input, OnInit } from '@angular/core';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { AddTaskComponent } from 'src/app/shared/components/add-task/add-task.component';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss'],
})
export class TasksComponent implements OnInit {
  active: any = '1';
  @Input() eventData: any;
  constructor(public modalSrvc: NgbModal) {}

  ngOnInit(): void {
    console.log('event data...', this.eventData);
  }

  addTask() {
    let ngbModalOptions: NgbModalOptions = {
      backdrop: 'static',
      keyboard: false,
      size: 'lg',
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
}
