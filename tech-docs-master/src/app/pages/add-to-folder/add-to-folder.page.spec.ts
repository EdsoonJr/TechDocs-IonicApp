import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddToFolderPage } from './add-to-folder.page';

describe('AddToFolderPage', () => {
  let component: AddToFolderPage;
  let fixture: ComponentFixture<AddToFolderPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AddToFolderPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
