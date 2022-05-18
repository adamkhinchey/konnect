import { Component, OnInit } from '@angular/core';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { AddTaskComponent } from 'src/app/shared/components/add-task/add-task.component';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss'],
})
export class TasksComponent implements OnInit {
  constructor(public modalSrvc: NgbModal) {}

  ngOnInit(): void {}

  addTask() {
    let ngbModalOptions: NgbModalOptions = {
      backdrop: 'static',
      keyboard: false,
      size:'lg',
    };
    const modalRef = this.modalSrvc.open(AddTaskComponent, ngbModalOptions);
    modalRef.result
      .then((result: any) => {})
      .catch((result: any) => {
        console.log('cancelling');
      });
  }
}
