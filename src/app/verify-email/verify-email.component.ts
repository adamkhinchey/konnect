import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UpdateUserProfileService } from '../features/users/services/update-user-profile.service';

@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.scss']
})
export class VerifyEmailComponent implements OnInit {
  // @ViewChild('content', { static: false }) modalContent!: TemplateRef<any>;
  // @ViewChild('contentfailed', { static: false }) modalContentFailed!: TemplateRef<any>;
  public success: boolean = false;
  constructor(
    private modalService: NgbModal,
    public updateUserSrvc: UpdateUserProfileService,
    public route: ActivatedRoute,
    public router: Router
  ) { }

  ngOnInit(): void {
    //this.showSuccessModel();
    this.verifyEmail();
  }

  verifyEmail() {
    let token: any = null;
    this.route.queryParamMap.subscribe(param => {
      console.log(param.get('token'));
      token = param.get('token')
    });
    this.updateUserSrvc.verifyEmail(token).subscribe((res: any) => {
      console.log(res);
      if (res.code == 200) {
        this.success = true;
      } else {
        this.success = false;
      }
    }, err => {
      console.log(err);
      this.success = false;
    })
  }

  login() {
    this.router.navigate(['/auth']);
  }

  // showSuccessModel(){
  //   this.modalService.open(this.modalContent, { centered: true, backdrop: false, keyboard: false });
  // }

  // showErrorModel(){
  //   this.modalService.open(this.modalContentFailed, { centered: true, backdrop: false, keyboard: false });
  // }

}
