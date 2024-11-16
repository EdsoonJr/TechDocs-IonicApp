import { Component } from '@angular/core';
import { FirebaseStorageService } from '../../services/firebase-storage.service';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.page.html',
  styleUrls: ['./upload.page.scss'],
})
export class UploadPage {
  constructor(private firebaseStorageService: FirebaseStorageService) {}

  async uploadFile(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      try {
        this.firebaseStorageService.uploadPDF(file).subscribe((downloadURL) => {
          console.log('Arquivo enviado com sucesso. URL:', downloadURL);
        });
      } catch (error) {
        console.error('Erro ao fazer upload do arquivo:', error);
      }
    }
  }
}
