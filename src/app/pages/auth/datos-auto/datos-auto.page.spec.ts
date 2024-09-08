import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DatosAutoPage } from './datos-auto.page';

describe('DatosAutoPage', () => {
  let component: DatosAutoPage;
  let fixture: ComponentFixture<DatosAutoPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(DatosAutoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
