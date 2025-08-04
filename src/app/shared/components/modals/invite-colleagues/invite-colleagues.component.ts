import {Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild} from '@angular/core';
import {ColleagueInviteInterface} from "../../../models";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {environment} from "../../../../../environments/environment";
import {checkRxFormValidation} from "../../../utils";

@Component({
  selector: 'app-invite-colleagues',
  templateUrl: './invite-colleagues.component.html',
  styleUrls: ['./invite-colleagues.component.scss']
})
export class InviteColleaguesComponent implements OnInit {

  @ViewChild('content') content: TemplateRef<any> | undefined;
  @Input() inviterName: string | null = null;
  @Input() companyName: string | null = null;
  @Input() companyId: number | null = null;
  @Input() inviteUID: string | null = null;

  @Output() confirm = new EventEmitter<ColleagueInviteInterface>();
  @Output() cancel = new EventEmitter();

  siteUrl = environment.siteURL;
  inviteColleagueForm: FormGroup | undefined;
  EMAIL_REGEX = new RegExp(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,20}))$/);
  constructor(private fb: FormBuilder) {
  }

  ngOnInit(): void {
    this.inviteColleagueForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.pattern(this.EMAIL_REGEX)]],
      position: ['', [Validators.required]]
    });
  }

  checkValidity(): boolean {
    if (this.inviteColleagueForm) {
      return checkRxFormValidation(this.inviteColleagueForm);
    }
    return false;
  }

  onConfirm(): void {
    this.confirm.emit({
      companyId: this.companyId,
      ...this.inviteColleagueForm?.value,
      inviteUID: this.inviteUID
    });
    this.inviteColleagueForm?.reset();
  }

  onCancel(): void {
    this.inviteColleagueForm?.reset();
    this.cancel.emit();
  }

}
