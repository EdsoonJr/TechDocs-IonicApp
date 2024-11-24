import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Pdf } from '../models/pdfs.model'; // Certifique-se de ajustar o caminho se necessário
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root',
})
export class PdfService {
  private collectionName = 'pdfs';

  constructor(private firestore: AngularFirestore) {}

  // Método para salvar os metadados do PDF no Firestore
  async addPDF(pdf: Pdf): Promise<void> {
    try {
      const id = this.firestore.createId(); // Gera um ID único
      pdf.id = id;
      pdf.upload_date = new Date(); // Usar Timestamp corretamente

      pdf.title = pdf.title.toLowerCase();
      pdf.tags = pdf.tags.map(tag => tag.toLowerCase());

      await this.firestore.collection(this.collectionName).doc(id).set(pdf);
      console.log('PDF salvo com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar PDF:', error);
      throw error;
    }
  }

  // Método para obter os PDFs do Firestore
  getPDFs(): Observable<Pdf[]> {
    return this.firestore.collection<Pdf>(this.collectionName).snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as Pdf;
        data.id = a.payload.doc.id;
        return data;
      }))
    );
  }

  searchPDFs(query: string, field: 'title' | 'tags'): Observable<Pdf[]> {
    const lowerQuery = query.toLowerCase();
  
    if (field === 'tags') {
      // Busca exata dentro de arrays (array-contains)
      return this.firestore.collection<Pdf>(this.collectionName, ref =>
        ref.where(field, 'array-contains', lowerQuery)
      ).snapshotChanges().pipe(
        map(actions => actions.map(a => {
          const data = a.payload.doc.data() as Pdf;
          data.id = a.payload.doc.id;
          return data;
        }))
      );
    } else {
      // Simula busca flexível para strings com range queries
      return this.firestore.collection<Pdf>(this.collectionName, ref =>
        ref.orderBy(field)
          .startAt(lowerQuery)
          .endAt(lowerQuery + '\uf8ff') // Limita aos termos que começam com o prefixo
      ).snapshotChanges().pipe(
        map(actions => actions.filter(a => {
          const data = a.payload.doc.data() as Pdf;
          data.id = a.payload.doc.id;
  
          // Aplica filtro manual (simula LIKE %%)
          return data[field]?.toLowerCase().includes(lowerQuery);
        }).map(a => {
          const data = a.payload.doc.data() as Pdf;
          data.id = a.payload.doc.id;
          return data;
        }))
      );
    }
  }
  
  
  
}
