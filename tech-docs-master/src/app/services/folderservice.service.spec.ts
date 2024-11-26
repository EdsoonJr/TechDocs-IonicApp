import { TestBed } from '@angular/core/testing';

import { FolderserviceService } from './folderservice.service';

describe('FolderserviceService', () => {
  let service: FolderserviceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FolderserviceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
