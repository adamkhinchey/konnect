import {Component, OnDestroy, OnInit} from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {UserSettingsInterface} from '../../../../shared/models';
import {UserSettingsService} from '../../../../shared/services';
import {devLogger} from '../../../../shared/utils';
import {CompaniesService} from '../../services/companies.service';
import {Subscription} from 'rxjs';
import {AuthService} from '../../../../core/services/auth.service';
import {ToastrService} from 'ngx-toastr';
import {AbstractControl, FormArray, FormBuilder, FormGroup} from '@angular/forms';

@Component({
  selector: 'app-manage-colleagues',
  templateUrl: './manage-colleagues.component.html',
  styleUrls: ['./manage-colleagues.component.scss']
})
export class ManageColleaguesComponent implements OnInit, OnDestroy {

  public modalReference: any;
  public defaultCompany: any;
  private userSettingsSubscription: Subscription | undefined;
  public companyColleaguesData: { invitesPending: any[], admins: any[], colleagues: any[], joinRequests: any[] } =
    {invitesPending: [], admins: [], colleagues: [], joinRequests: []};
  public isUserAdmin = false;
  private approveReqSub: Subscription | undefined;
  private declineReqSub: Subscription | undefined;
  private getCmpColleaguesSub: Subscription | undefined;
  private toggleAdminSub: Subscription | undefined;
  public positionForm: FormGroup | undefined;
  private positionInpCtlArray: FormArray | undefined;
  colleaguePositionsModelMap = new Map<number, { colleagueID: number, value: string }>();
  private saveColleaguePosSub: Subscription | undefined;


  constructor(
    private modalService: NgbModal,
    private userSettings: UserSettingsService,
    private companiesService: CompaniesService,
    private authService: AuthService,
    private toaster: ToastrService,
    private fb: FormBuilder) {
  }

  ngOnInit(): void {
    this.positionForm = this.fb.group({
      positionArray: this.fb.array([])
    });
    this.positionInpCtlArray = (this.positionForm.get('positionArray') as FormArray);

    this.userSettingsSubscription = this.userSettings.settings.subscribe((value: UserSettingsInterface) => {
      this.defaultCompany = value.defaultCompany;
      this.getCompanyColleagues();
    }, err => {
      devLogger('error', err);
    }, () => {
    });
  }


  openVerticallyCentered(content: any): void {
    this.modalReference = this.modalService.open(content, {
      centered: true,
      size: 'lg',
    });

  }

  private getCompanyColleagues(): void {
    if (this.defaultCompany && this.defaultCompany.id) {
      this.getCmpColleaguesSub = this.companiesService.getCompanyColleagues({companyId: this.defaultCompany.id})
        .subscribe(value => {
          if (value) {
            this.companyColleaguesData = value;
            this.populatePositionsModel([...this.companyColleaguesData.colleagues, ...this.companyColleaguesData.admins]);
            this.patchAndBindPositionInpCtrlArray(
              [...this.companyColleaguesData.colleagues, ...this.companyColleaguesData.admins]
            );
          }
        }, err => {
          devLogger('error', err);
        }, () => {
          if (this.companyColleaguesData) {
            this.isUserAdmin = !!this.companyColleaguesData.admins.find(admin => admin.userId === this.authService.getUserInfo().id);
          }
        });
    }
  }

  private populatePositionsModel(p: any[]): void {
    p.forEach(({userId, position}) => {
      this.colleaguePositionsModelMap.set(userId, {colleagueID: userId, value: position});
    });

  }

  private patchAndBindPositionInpCtrlArray(param: any[]): void {
    param.forEach(({userId, position}) => {
      this.positionInpCtlArray?.push(this.patchPositions({colleagueID: userId, value: position}));
    });
  }

  private patchPositions(p: { value: any; colleagueID: any }): AbstractControl {
    return this.fb.group({
      position: [p]
    });
  }

  trackAdminsFn(index: number, item: any): any {
    return item.userId;
  }

  approveJoinRequest(userId: number): void {
    if (!this.isUserAdmin) {
      this.toaster.error('Only administrators can perform this action', 'Forbidden');
      return;
    }
    if (!this.defaultCompany || !this.defaultCompany.id) {
      this.toaster.error('Company for colleagues not set!', 'Approving Request Failed');
      return;
    }
    this.approveReqSub = this.companiesService.approveDeclineJoinRequest({
      companyId: this.defaultCompany.id,
      userId,
      status: 1
    }).subscribe((value) => {
      this.toaster.success('Joining request approved successfully');
      this.getCompanyColleagues();
    }, err => {
      devLogger('error', err);
    }, () => {
    });
  }

  declineJoinRequest(userId: number): void {
    if (!this.isUserAdmin) {
      this.toaster.error('Only administrators can perform this action', 'Forbidden');
      return;
    }
    if (!this.defaultCompany || !this.defaultCompany.id) {
      this.toaster.error('Company for colleagues not set!', 'Declining Request Failed');
      return;
    }
    this.declineReqSub = this.companiesService.approveDeclineJoinRequest({
      companyId: this.defaultCompany.id,
      userId,
      status: 0
    }).subscribe((value) => {
      this.toaster.success('Joining request declined successfully');
      this.getCompanyColleagues();
    }, err => {
      devLogger('error', err);
    }, () => {
    });
  }

  toggleAdmin(event: Event, userId: number): void {
    if (!this.isUserAdmin) {
      this.toaster.error('Only administrators can perform this action', 'Forbidden');
      return;
    }
    if (!this.defaultCompany || !this.defaultCompany.id) {
      this.toaster.error('Company for colleagues not set!', 'Failed: Changing Admin Status ');
      return;
    }
    const target = event.target as HTMLInputElement;
    const isAdmin = target.checked ? 1 : 0;
    this.toggleAdminSub = this.companiesService
      .toggleAdmin({companyId: this.defaultCompany.id, userId, isAdmin})
      .subscribe((value) => {
        this.toaster.success(isAdmin ? 'Made admin successfully' : 'Removed from admins successfully');
        this.getCompanyColleagues();
      }, err => {
        devLogger('error', err);
      }, () => {
      });
  }

  saveColleaguePositions(): void {
    if (!this.isUserAdmin) {
      this.toaster.error('Only administrators can perform this action', 'Forbidden');
      return;
    }
    if (!this.defaultCompany || !this.defaultCompany.id) {
      this.toaster.error('Company for colleagues not set!', 'Saving Positions Failed');
      return;
    }

    this.saveColleaguePosSub = this.companiesService.saveColleaguePosition({
      companyID: this.defaultCompany.id,
      positionArray: Array.from(this.colleaguePositionsModelMap.values())
    }).subscribe(value => {
      this.toaster.success('Positions saved successfully');
    }, err => {
      devLogger('error', err);
    }, () => {
    });

  }

  ngOnDestroy(): void {
    this.userSettingsSubscription?.unsubscribe();
    this.approveReqSub?.unsubscribe();
    this.declineReqSub?.unsubscribe();
    this.getCmpColleaguesSub?.unsubscribe();
    this.toggleAdminSub?.unsubscribe();
    this.saveColleaguePosSub?.unsubscribe();
  }


}
