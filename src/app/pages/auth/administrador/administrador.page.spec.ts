import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdministradorPage } from './administrador.page';

describe('AdministradorPage', () => {
  let component: AdministradorPage;
  let fixture: ComponentFixture<AdministradorPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(AdministradorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
