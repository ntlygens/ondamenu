import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MerchantShoppingComponent } from './merchant-shopping.component';

describe('MerchantShoppingComponent', () => {
  let component: MerchantShoppingComponent;
  let fixture: ComponentFixture<MerchantShoppingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MerchantShoppingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MerchantShoppingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
