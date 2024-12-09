import { TestBed } from '@angular/core/testing';
import { FirebaseStorageService } from './firebase-storage.service';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { of, throwError } from 'rxjs';

describe('FirebaseStorageService', () => {
  let service: FirebaseStorageService;
  let mockAngularFireStorage: any;
  let mockFileRef: any;
  let mockTask: any;

  beforeEach(() => {
    // Mock para AngularFireStorage
    mockFileRef = {
      getDownloadURL: jasmine.createSpy().and.returnValue(of('https://mock-download-url.com')),
    };

    mockTask = {
      snapshotChanges: jasmine.createSpy(),
    };

    mockAngularFireStorage = {
      ref: jasmine.createSpy().and.returnValue(mockFileRef),
      upload: jasmine.createSpy().and.returnValue(mockTask),
    };

    TestBed.configureTestingModule({
      providers: [
        FirebaseStorageService,
        { provide: AngularFireStorage, useValue: mockAngularFireStorage },
      ],
    });

    service = TestBed.inject(FirebaseStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
    console.log('FirebaseStorageService foi criado com sucesso.');
  });

  describe('#uploadPDF', () => {
    it('should upload a file and return its download URL', (done) => {
      const mockFile = new File([''], 'test.pdf', { type: 'application/pdf' });
      const filePath = `uploads/${mockFile.name}`;
      mockTask.snapshotChanges.and.returnValue(of({}));

      service.uploadPDF(mockFile).subscribe({
        next: (downloadURL) => {
          expect(downloadURL).toBe('https://mock-download-url.com');
          expect(mockAngularFireStorage.upload).toHaveBeenCalledWith(filePath, mockFile);
          expect(mockAngularFireStorage.ref).toHaveBeenCalledWith(filePath);
          console.log('Upload realizado com sucesso. URL:', downloadURL);
          done();
        },
        error: (error) => {
          console.error('Erro ao realizar upload:', error);
          done.fail('Erro inesperado no teste de upload.');
        },
      });
    });

    it('should handle invalid file input', (done) => {
      const invalidFile: any = { name: undefined }; // Simula um arquivo inválido
    
      service.uploadPDF(invalidFile).subscribe({
        next: () => {
          done.fail('O teste deveria falhar devido ao arquivo inválido.');
        },
        error: (err) => {
          expect(err.message).toBe('Arquivo inválido ou nome ausente.');
          console.log('Erro esperado: Arquivo inválido ou nome ausente.');
          done();
        },
      });
    });
    
  });
});
