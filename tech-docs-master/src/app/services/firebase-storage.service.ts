import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FirebaseStorageService {
  constructor(private storage: AngularFireStorage) {}

  // Método para fazer upload de um arquivo PDF
  uploadPDF(file: File): Observable<string> {
    if (!file || !file.name) {
      return new Observable((observer) => {
        observer.error(new Error('Arquivo inválido ou nome ausente.'));
        observer.complete();
      });
    }
  
    const filePath = `uploads/${file.name}`;
    const fileRef = this.storage.ref(filePath);
    const task = this.storage.upload(filePath, file);
  
    return new Observable<string>((observer) => {
      task.snapshotChanges()
        .pipe(
          finalize(async () => {
            try {
              const downloadURL = await fileRef.getDownloadURL().toPromise();
              observer.next(downloadURL);
            } catch (error) {
              observer.error(new Error('Erro ao obter o URL de download.'));
            } finally {
              observer.complete();
            }
          })
        )
        .subscribe({
          error: (error) => {
            console.error('Erro durante o upload:', error);
            observer.error(error);
            observer.complete();
          },
        });
    });
  }
  
}
