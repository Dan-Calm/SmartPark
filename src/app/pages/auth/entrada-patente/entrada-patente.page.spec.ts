import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EntradaPatentePage } from './entrada-patente.page';

describe('EntradaPatentePage', () => {
  let component: EntradaPatentePage;
  let fixture: ComponentFixture<EntradaPatentePage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(EntradaPatentePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
