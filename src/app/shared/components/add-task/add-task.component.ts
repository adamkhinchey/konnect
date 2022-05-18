import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-add-task',
  templateUrl: './add-task.component.html',
  styleUrls: ['./add-task.component.scss']
})
export class AddTaskComponent implements OnInit {

  constructor(
    private activeModal: NgbActiveModal
  ) {}

  ngOnInit(): void {}

  public dismiss() {
    this.activeModal.dismiss();
  }

}
