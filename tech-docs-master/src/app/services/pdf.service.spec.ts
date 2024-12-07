import { TestBed } from '@angular/core/testing';
import { PdfService } from './pdf.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { of } from 'rxjs';
import { Pdf } from '../models/pdfs.model';

describe('PdfService', () => {
  let service: PdfService;
  let mockFirestore: any;
  let queryMock: any;

  beforeEach(() => {
    queryMock = {
      where: jasmine.createSpy().and.callFake(() => queryMock),
      orderBy: jasmine.createSpy().and.callFake(() => queryMock),
      startAt: jasmine.createSpy().and.callFake(() => queryMock),
      endAt: jasmine.createSpy().and.callFake(() => queryMock),
    };

    mockFirestore = {
      collection: jasmine.createSpy().and.callFake((_: string, queryFn?: any) => {
        queryFn?.(queryMock);
        return {
          doc: jasmine.createSpy().and.returnValue({
            set: jasmine.createSpy().and.returnValue(Promise.resolve()),
          }),
          snapshotChanges: jasmine.createSpy().and.returnValue(of([])),
        };
      }),
      createId: jasmine.createSpy().and.returnValue('mockId'),
    };

    TestBed.configureTestingModule({
      providers: [
        PdfService,
        { provide: AngularFirestore, useValue: mockFirestore },
      ],
    });

    service = TestBed.inject(PdfService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
    console.log('PdfService foi criado com sucesso');
  });

  describe('#searchPDFs', () => {
    it('should search PDFs by tags', (done) => {
      const mockQuery = 'tag1';
      const mockData = [
        {
          payload: {
            doc: {
              id: '1',
              data: () => ({
                title: 'Test PDF 1',
                tags: ['tag1', 'tag2'],
                description: 'Description 1',
              }),
            },
          },
        },
      ];

      mockFirestore.collection.and.callFake((_: string, queryFn: any) => {
        queryFn({
          where: jasmine.createSpy().and.returnValue(queryMock),
        });
        return {
          snapshotChanges: jasmine.createSpy().and.returnValue(of(mockData)),
        };
      });

      //console.log('Iniciando a busca por PDFs com tag:', mockQuery);

      service.searchPDFs(mockQuery, 'tags').subscribe((pdfs) => {
        console.log('Busca por tag realizada com sucesso!');
        expect(pdfs.length).toBe(1);
        expect(pdfs[0].tags).toContain('tag1');
        done();
      });
    });

    it('should search PDFs by title', (done) => {
      const mockQuery = 'test';
      const mockData = [
        {
          payload: {
            doc: {
              id: '1',
              data: () => ({
                title: 'test pdf 1',
                tags: ['tag1', 'tag2'],
                description: 'Description 1',
              }),
            },
          },
        },
      ];

      mockFirestore.collection.and.callFake((_: string, queryFn: any) => {
        const query = {
          orderBy: jasmine.createSpy().and.returnValue(queryMock),
          startAt: jasmine.createSpy().and.returnValue(queryMock),
          endAt: jasmine.createSpy().and.returnValue(queryMock),
        };
        queryFn(query);
        return {
          snapshotChanges: jasmine.createSpy().and.returnValue(of(mockData)),
        };
      });

      //console.log('Iniciando a busca por PDFs com título:', mockQuery);

      service.searchPDFs(mockQuery, 'title').subscribe((pdfs) => {
        console.log('Busca por titulo realizada com sucesso!');
        expect(pdfs.length).toBe(1);
        expect(pdfs[0].title).toContain('test pdf 1');
        done();
      });
    });
  });

  describe('#addPDF', () => {
    it('should add a new PDF', (done) => {
      const newPdf: Pdf = {
        title: 'Test PDF for Add',
        tags: ['tag1', 'tag2'],
        description: 'Description for new PDF',
        upload_date: new Date(),
        id: '',
        user_id: 'user123',         // Propriedade adicionada
        url: 'https://example.com', // Propriedade adicionada
        download_count: 0,          // Propriedade adicionada
        review_count: 0            // Propriedade adicionada
      };
  
      //console.log('Iniciando a adição de um novo PDF:', newPdf);
  
      // Simula o comportamento da chamada do Firestore
      const setSpy = jasmine.createSpy('set').and.returnValue(Promise.resolve());
  
      mockFirestore.collection.and.callFake(() => {
        return {
          doc: jasmine.createSpy().and.returnValue({
            set: setSpy, // Usa o setSpy aqui
          }),
        };
      });
  
      service.addPDF(newPdf).then(() => {
        // Verifica se o método set foi chamado
        expect(setSpy).toHaveBeenCalled();
        //console.log('Método set chamado para salvar o PDF');
        done();
      }).catch((error) => {
        console.error('Erro ao adicionar PDF:', error);
        done();
      });
    });
  });

  describe('#getPDFs', () => {
    it('should get all PDFs', (done) => {
      const mockData = [
        {
          title: 'Test PDF 1',
          tags: ['tag1', 'tag2'],
          description: 'Description 1',
          id: '1',
        },
        {
          title: 'Test PDF 2',
          tags: ['tag3', 'tag4'],
          description: 'Description 2',
          id: '2',
        },
      ];
  
      const mockSnapshot = mockData.map(pdf => ({
        payload: {
          doc: {
            id: pdf.id,
            data: () => pdf,
          },
        },
      }));
  
      // Mock do Firestore para retornar o array de PDFs
      mockFirestore.collection.and.callFake(() => {
        return {
          snapshotChanges: jasmine.createSpy().and.returnValue(of(mockSnapshot)),
        };
      });
  
      service.getPDFs().subscribe((pdfs) => {
        console.log('PDFs obtidos com sucesso:');
        expect(pdfs.length).toBe(mockData.length); // Verifica o número de PDFs
        expect(pdfs[0].id).toBe('1'); // Verifica o id do primeiro PDF
        expect(pdfs[1].tags).toEqual(['tag3', 'tag4']); // Verifica as tags do segundo PDF
        done();
      });
    });
  });
  
  
  
  
  
});
