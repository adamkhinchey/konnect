import {Component, Input, OnInit, Output, TemplateRef, ViewChild, EventEmitter} from '@angular/core';
import {RemoveType} from "../../../models";

@Component({
  selector: 'app-remove-modal',
  templateUrl: './remove-modal.component.html',
  styleUrls: ['./remove-modal.component.scss']
})
export class RemoveModalComponent implements OnInit {

  @ViewChild('content') content: TemplateRef<any> | undefined;
  @Input() modalInfoContent = 'Message';
  @Output() confirm = new EventEmitter<RemoveType | null | undefined>();
  @Output() cancel = new EventEmitter<RemoveType | null | undefined>();
  @Input() toRemove: RemoveType | null | undefined;

  constructor() {
  }

  ngOnInit(): void {
  }

}
