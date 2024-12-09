import { Component } from '@angular/core';
import { FirebaseStorageService } from '../../services/firebase-storage.service';
import { PdfService } from '../../services/pdf.service';
import { Pdf } from '../../models/pdfs.model'; // Importar a interface correta
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Timestamp } from 'firebase/firestore';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.page.html',
  styleUrls: ['./upload.page.scss'],
})
export class UploadPage {
  title: string = '';
  description: string = '';
  tags: string = '';

  constructor(
    private firebaseStorageService: FirebaseStorageService,
    private pdfService: PdfService,
    private afAuth: AngularFireAuth
  ) {}

  async uploadFile(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      try {
        // Fazer upload do arquivo para o Firebase Storage
        this.firebaseStorageService.uploadPDF(file).subscribe(async (downloadURL) => {
          console.log('Arquivo enviado com sucesso. URL:', downloadURL);

          // Obter o usuário autenticado
          const user = await this.afAuth.currentUser;
          if (!user) {
            console.error('Usuário não autenticado');
            return;
          }

          // Criar o objeto PDF com metadados
          const pdfData: Pdf = {
            title: this.title,
            description: this.description,
            tags: this.tags.split(',').map(tag => tag.trim()), // Converter tags em um array
            user_id: user.uid,
            upload_date: new Date(),
            url: downloadURL,
            download_count: 0,
            review_count: 0,
          };

          // Salvar os metadados no Firestore
          await this.pdfService.addPDF(pdfData);
          console.log('Metadados do PDF salvos com sucesso no Firestore.');
        });
      } catch (error) {
        console.error('Erro ao fazer upload do arquivo:', error);
      }
    }
  }
}
