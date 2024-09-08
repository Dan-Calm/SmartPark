import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PagoTicketPage } from './pago-ticket.page';

describe('PagoTicketPage', () => {
  let component: PagoTicketPage;
  let fixture: ComponentFixture<PagoTicketPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(PagoTicketPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
