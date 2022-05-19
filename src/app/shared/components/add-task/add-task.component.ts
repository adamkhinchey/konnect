import { Component, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { AssignToComponent } from '../assign-to/assign-to.component';

@Component({
  selector: 'app-add-task',
  templateUrl: './add-task.component.html',
  styleUrls: ['./add-task.component.scss']
})
export class AddTaskComponent implements OnInit {

  dropdownList:any = [];
  selectedItems:any = [];
  dropdownSettings:IDropdownSettings = {};
  
  constructor(
    private activeModal: NgbActiveModal,
    public modalSrvc:NgbModal
  ) {}

  ngOnInit(): void {
    this.dropdownList = [
      { item_id: 1, item_text: 'Mumbai' },
      { item_id: 2, item_text: 'Bangaluru' },
      { item_id: 3, item_text: 'Pune' },
      { item_id: 4, item_text: 'Navsari' },
      { item_id: 5, item_text: 'New Delhi' },
      { item_id: 6, item_text: 'New Delhi' },
      { item_id: 7, item_text: 'New Delhi' },
      { item_id: 8, item_text: 'New Delhi' },
      { item_id: 9, item_text: 'New Delhi' }
    ];
    this.selectedItems = [
      { item_id: 3, item_text: 'Pune' },
      { item_id: 4, item_text: 'Navsari' }
    ];
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'item_id',
      textField: 'item_text',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      // itemsShowLimit: false,
      allowSearchFilter: true
    };
    
  }
  onItemSelect(item: any) {
    console.log(item);
  }

  public dismiss() {
    this.activeModal.dismiss();
  }

  assignTo(){
    let ngbModalOptions: NgbModalOptions = {
      backdrop: 'static',
      keyboard: false,
      size:'lg',
    };
    const modalRef = this.modalSrvc.open(AssignToComponent, ngbModalOptions);
    modalRef.result
      .then((result: any) => {})
      .catch((result: any) => {
        console.log('cancelling');
      });
  }

}
