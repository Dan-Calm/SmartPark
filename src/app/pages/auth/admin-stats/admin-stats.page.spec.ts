import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminStatsPage } from './admin-stats.page';

describe('AdminStatsPage', () => {
  let component: AdminStatsPage;
  let fixture: ComponentFixture<AdminStatsPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(AdminStatsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
