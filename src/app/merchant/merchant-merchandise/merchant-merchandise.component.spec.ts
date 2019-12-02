import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MerchantMerchandiseComponent } from './merchant-merchandise.component';

describe('MerchantMerchandiseComponent', () => {
  let component: MerchantMerchandiseComponent;
  let fixture: ComponentFixture<MerchantMerchandiseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MerchantMerchandiseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MerchantMerchandiseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
