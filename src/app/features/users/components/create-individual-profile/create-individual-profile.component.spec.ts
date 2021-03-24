import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateIndividualProfileComponent } from './create-individual-profile.component';

describe('CreateIndividualProfileComponent', () => {
  let component: CreateIndividualProfileComponent;
  let fixture: ComponentFixture<CreateIndividualProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateIndividualProfileComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateIndividualProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
