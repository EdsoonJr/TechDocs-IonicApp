import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyUploadsPage } from './my-uploads.page';

describe('MyUploadsPage', () => {
  let component: MyUploadsPage;
  let fixture: ComponentFixture<MyUploadsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MyUploadsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
