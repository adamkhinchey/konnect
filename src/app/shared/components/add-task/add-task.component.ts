import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OwlDateTimeComponent } from '@danielmoncada/angular-datetime-picker';
import {
  NgbActiveModal,
  NgbModal,
  NgbModalOptions,
} from '@ng-bootstrap/ng-bootstrap';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { noWhiteSpace } from '../../validators';
import { AssignToComponent } from '../assign-to/assign-to.component';

@Component({
  selector: 'app-add-task',
  templateUrl: './add-task.component.html',
  styleUrls: ['./add-task.component.scss'],
})
export class AddTaskComponent implements OnInit {
  @ViewChild('dt1') owlDateTime: OwlDateTimeComponent<any> | undefined;
  @ViewChild('inp') dateTimeInput: ElementRef | undefined;
  addTaskForm: FormGroup;
  submitted: boolean = false;
  dropdownList: any = [];
  selectedItems: any = [];
  dropdownSettings: IDropdownSettings = {};

  constructor(
    private activeModal: NgbActiveModal,
    public modalSrvc: NgbModal,
    public fb: FormBuilder
  ) {
    this.addTaskForm = this.fb.group({
      eventId: [0],
      taskId: [0],
      assignToId: [''],
      assignById: [''],
      title: ['', [Validators.required, noWhiteSpace]],
      description: ['', [Validators.required, noWhiteSpace]],
      dueDate: [''],
      isCompleted: [0],
    });
  }

  get f() {
    return this.addTaskForm.controls;
  }
  ngOnInit(): void {

  }

  setDateTime(event: any): void {

  }
  onItemSelect(item: any) {
    console.log(item);
  }

  public dismiss() {
    this.activeModal.dismiss();
  }

  assignTo() {
    let ngbModalOptions: NgbModalOptions = {
      backdrop: 'static',
      keyboard: false,
      size: 'lg',
    };
    const modalRef = this.modalSrvc.open(AssignToComponent, ngbModalOptions);
    modalRef.result
      .then((result: any) => {})
      .catch((result: any) => {
        console.log('cancelling');
      });
  }

  saveUpdateTask() {
    this.submitted = true;
  }
}
