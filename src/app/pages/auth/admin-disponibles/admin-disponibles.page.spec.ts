import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminDisponiblesPage } from './admin-disponibles.page';

describe('AdminDisponiblesPage', () => {
  let component: AdminDisponiblesPage;
  let fixture: ComponentFixture<AdminDisponiblesPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(AdminDisponiblesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
