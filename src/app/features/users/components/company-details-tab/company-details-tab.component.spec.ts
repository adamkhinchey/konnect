import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyDetailsTabComponent } from './company-details-tab.component';

describe('CompanyDetailsTabComponent', () => {
  let component: CompanyDetailsTabComponent;
  let fixture: ComponentFixture<CompanyDetailsTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CompanyDetailsTabComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CompanyDetailsTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
