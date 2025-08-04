import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {AssociateToCompany, AssociationType, Company} from '../../models';

@Component({
  selector: 'app-company-claim-card',
  templateUrl: './company-claim-card.component.html',
  styleUrls: ['./company-claim-card.component.scss']
})
export class CompanyClaimCardComponent implements OnInit {
  @Input() company: Company | null| undefined;
  @Output() claimOrJoinCompany = new EventEmitter<Partial<AssociateToCompany>>();

  constructor() {
  }

  ngOnInit(): void {
  }

  claimCompany(): void {
    this.claimOrJoinCompany.emit({companyId: this.company?.id, assignType: AssociationType.CLAIM});
  }

  joinCompany(): void {
    this.claimOrJoinCompany.emit({companyId: this.company?.id, assignType: AssociationType.JOIN});
  }
}
