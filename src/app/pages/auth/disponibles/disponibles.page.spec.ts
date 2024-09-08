import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DisponiblesPage } from './disponibles.page';

describe('DisponiblesPage', () => {
  let component: DisponiblesPage;
  let fixture: ComponentFixture<DisponiblesPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(DisponiblesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
