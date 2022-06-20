import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OwlDateTimeComponent } from '@danielmoncada/angular-datetime-picker';
import { ToastrService } from 'ngx-toastr';
import {
  NgbActiveModal,
  NgbModal,
  NgbModalOptions,
} from '@ng-bootstrap/ng-bootstrap';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { noWhiteSpace } from '../../validators';
import { AssignToComponent } from '../assign-to/assign-to.component';
import * as moment from 'moment';
import * as _ from 'lodash';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { EventService } from 'src/app/features/edit-events/services/event.service';
import { ActivatedRoute } from '@angular/router';
import { UserSettingsService } from '../../services';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-add-task',
  templateUrl: './add-task.component.html',
  styleUrls: ['./add-task.component.scss'],
})
export class AddTaskComponent implements OnInit {
  dueDate: any;
  minimumDate: Date | undefined = moment()
    .set('second', 0)
    .set('millisecond', 0)
    .toDate();
  @ViewChild('dt1') owlDateTime: OwlDateTimeComponent<any> | undefined;
  @ViewChild('inptask') dateTimeInput: ElementRef | undefined;
  @Input() ownedByText: any = '';
  @Input() taskData: any;
  @Input() assignToDataFromPrevious: any = [];
  addTaskForm: FormGroup;
  submitted: boolean = false;
  dropdownList: any = [];
  selectedItems: any = [];
  dropdownSettings: IDropdownSettings = {};
  config: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    // height: '15rem',
    minHeight: '5rem',
    placeholder: 'Enter text here...',
    translate: 'no',
    defaultParagraphSeparator: 'p',
    defaultFontName: 'Arial',
    sanitize: false,
    defaultFontSize: '2',
    showToolbar: false,
    toolbarHiddenButtons: [
      [
        // 'undo',
        // 'redo',
        // 'fontSize',
        // 'textColor',
        // 'backgroundColor',
        // 'bold',
        // 'italic',
        // 'underline',
        // 'strikeThrough',
        'subscript',
        'superscript',
        // 'justifyLeft',
        // 'justifyCenter',
        // 'justifyRight',
        'justifyFull',
        // 'indent',
        // 'outdent',
        // 'insertUnorderedList',
        // 'insertOrderedList',
        'heading',
        'fontName',
      ],
      [
        'customClasses',
        'link',
        'unlink',
        'insertImage',
        'insertVideo',
        'insertHorizontalRule',
        'removeFormat',
        'toggleEditorMode',
      ],
    ],
    customClasses: [
      {
        name: 'quote',
        class: 'quote',
      },
      {
        name: 'redText',
        class: 'redText',
      },
      {
        name: 'titleText',
        class: 'titleText',
        tag: 'h1',
      },
    ],
  };
  assignToData: any = [];
  constructor(
    private activeModal: NgbActiveModal,
    private toaster: ToastrService,
    public aroute: ActivatedRoute,
    public modalSrvc: NgbModal,
    public fb: FormBuilder,
    public eventSrvc: EventService,
    private userSettingsService: UserSettingsService,
    private datePipe: DatePipe
  ) {
    this.addTaskForm = this.fb.group({
      eventId: [0],
      taskId: [0],
      assignToId: [''],
      assignById: [''],
      title: ['', [Validators.required, noWhiteSpace]],
      description: [''],
      dueDate: [''],
      isCompleted: [0],
    });
  }

  get f() {
    return this.addTaskForm.controls;
  }
  ngOnInit(): void {
    this.assignToData = this.assignToDataFromPrevious;
    if (!this.taskData || this.taskData == undefined) {
      this.userSettingsService.settings.subscribe((value) => {
        console.log(value);
        if (value) {
          console.log('in if');
          this.addTaskForm.get('assignById')?.setValue(value.defaultCompany.id);
          this.addTaskForm.get('assignToId')?.setValue(this.assignToData);
        }
      });
      this.aroute.queryParams.subscribe((param) => {
        console.log('param...', param);
        this.addTaskForm.get('eventId')?.setValue(param.eventId);
      });
    } else {
      this.populateFormValues();
    }
  }

  populateFormValues() {
    console.log('task data...', this.taskData);
    this.addTaskForm.get('taskId')?.setValue(this.taskData.id);
    this.addTaskForm.get('assignById')?.setValue(this.taskData.owner_company);
    this.addTaskForm.get('eventId')?.setValue(this.taskData.eventId);
    this.addTaskForm.get('assignToId')?.setValue(this.assignToData);
    this.addTaskForm.get('title')?.setValue(this.taskData.title);
    this.addTaskForm.get('description')?.setValue(this.taskData.desciption);
    if (this.taskData.dueDate && this.taskData.dueDate != null) {
      this.addTaskForm.get('dueDate')?.setValue(this.datePipe.transform(new Date(this.taskData.dueDate), 'dd/MM/YYYY'));
    } else {
      this.addTaskForm.get('dueDate')?.setValue(null);
    }
    this.addTaskForm.get('isCompleted')?.setValue(this.taskData.status);
  }

  getDate(date: any) {
    console.log('date...', date);
    if (date != null) {
      return moment(date).format('DD/MM/YYYY');
    } else {
      return null;
    }
  }

  setDateTime(event: any): void {
    console.log('value date...', event.value);
    this.f.dueDate.setValue(event.value);
  }
  removeDate() {
    this.f.dueDate.setValue(null);
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
    modalRef.componentInstance.creatorFromCompanyId =
      this.addTaskForm.get('assignById')?.value;
    modalRef.componentInstance.taskId = this.addTaskForm.get('taskId')?.value;
    modalRef.result
      .then((result: any) => {
        console.log('result...', result);
        if (result && result.data) {
          this.assignToData = [];
          if (
            result.data.client.isChecked == 1 ||
            result.data.client.isChecked == true
          ) {
            this.assignToData = this.assignToData.concat({
              id: result.data.client.id,
              tabType: '1',
              companyName: result.data.client.companyName,
              utId: result.data.client.utId,
            });
          }
          if (
            result.data.eventManager.isChecked == 1 ||
            result.data.eventManager.isChecked == true
          ) {
            this.assignToData = this.assignToData.concat({
              id: result.data.eventManager.id,
              tabType: '2',
              companyName: result.data.eventManager.companyName,
              utId: result.data.eventManager.utId,
            });
          }
          for (let i = 0; i < result.data.venues.length; i++) {
            if (
              result.data.venues[i].isChecked == 1 ||
              result.data.venues[i].isChecked == true
            ) {
              this.assignToData = this.assignToData.concat({
                id: result.data.venues[i].id,
                tabType: '3',
                companyName: result.data.venues[i].companyName,
                utId: result.data.venues[i].utId,
              });
            }
          }
          for (let i = 0; i < result.data.services.length; i++) {
            if (
              result.data.services[i].isChecked == 1 ||
              result.data.services[i].isChecked == true
            ) {
              this.assignToData = this.assignToData.concat({
                id: result.data.services[i].id,
                tabType: '4',
                companyName: result.data.services[i].companyName,
                utId: result.data.services[i].utId,
              });
            }
          }
          for (let i = 0; i < result.data.exhibitors.length; i++) {
            if (
              result.data.exhibitors[i].isChecked == 1 ||
              result.data.exhibitors[i].isChecked == true
            ) {
              this.assignToData = this.assignToData.concat({
                id: result.data.exhibitors[i].id,
                tabType: '5',
                companyName: result.data.exhibitors[i].companyName,
                utId: result.data.exhibitors[i].utId,
              });
            }
          }
          console.log('assign to data...', this.assignToData);
          this.addTaskForm.get('assignToId')?.setValue(this.assignToData);
        }
      })
      .catch((err: any) => {
        console.log('cancelling');
      });
  }

  saveUpdateTask() {
    console.log(this.f.dueDate.value);
    // this.f.dueDate.setValue(moment(this.f.dueDate.value).format('YYYY-MM-DD'));
    console.log(this.f.dueDate.value);
    this.submitted = true;
    console.log(this.addTaskForm);
    console.log(this.addTaskForm.value);
    if (this.f.title.valid && this.assignToData.length) {
      this.eventSrvc.addEventTask(this.addTaskForm.value).subscribe(
        (res: any) => {
          if (res.code == 200) {
            this.activeModal.close();
            this.toaster.success(res.message);
          }
        },
        (err) => {
          console.log(err);
          console.log(err.error.message);
        }
      );
    }
  }
  changeConfig() {
    // if (!this.isNotesEdit)  {
    //   this.config.editable = false;
    //   this.config.showToolbar = false;
    // } else {
    $('#evDescription .angular-editor-textarea').css('border-top', 'none');
    this.config.editable = true;
    this.config.showToolbar = true;
    // }
  }
  removeTask() {
    console.log('task id...', this.addTaskForm.get('taskId')?.value);
    if (this.addTaskForm.get('taskId')?.value > 0) {
      this.eventSrvc
        .removeTask(this.addTaskForm.get('taskId')?.value)
        .subscribe(
          (res: any) => {
            console.log('remove response...', res);
            this.addTaskForm.reset();
            this.addTaskForm.get('assignToId')?.setValue(this.assignToData);
            this.toaster.success(res.message);
            this.activeModal.close();
          },
          (err) => {
            console.log(err);
          }
        );
    }
  }
}
