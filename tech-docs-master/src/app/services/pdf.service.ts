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

      // Salvando no Firestore
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
}
