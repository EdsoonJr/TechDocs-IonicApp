import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Folder } from '../models/folder.model';

@Injectable({
  providedIn: 'root',
})
export class FolderService {
  private collectionName = 'folders';

  constructor(private firestore: AngularFirestore) {}

  // Criar uma nova pasta
  async createFolder(folder: Folder): Promise<void> {
    try {
      const id = this.firestore.createId();
      folder.id = id;
      folder.createdAt = new Date();
      folder.pdfs = []; // Inicializar com array vazio
      await this.firestore.collection<Folder>(this.collectionName).doc(id).set(folder);
      console.log('Pasta criada com sucesso!');
    } catch (error) {
      console.error('Erro ao criar pasta:', error);
      throw error;
    }
  }

  // Adicionar um PDF à pasta
  async addPdfToFolder(folderId: string, pdfId: string): Promise<void> {
    try {
      const folderRef = this.firestore.collection<Folder>(this.collectionName).doc(folderId);
      const folderDoc = await folderRef.get().toPromise();
      
      // Verificar se o folderDoc não é undefined
      if (folderDoc && folderDoc.exists) {
        const folder = folderDoc.data() as Folder;
        // Verificar se o pdfId já está na pasta
        if (!folder.pdfs.includes(pdfId)) {
          folder.pdfs.push(pdfId);
          await folderRef.update({ pdfs: folder.pdfs });
          console.log('PDF adicionado à pasta com sucesso!');
        } else {
          console.log('O PDF já está na pasta.');
        }
      } else {
        console.error('Pasta não encontrada.');
      }
    } catch (error) {
      console.error('Erro ao adicionar PDF à pasta:', error);
      throw error;
    }
  }

  // Obter pastas do usuário
  getFoldersByUser(userId: string) {
    return this.firestore.collection<Folder>(this.collectionName, ref =>
      ref.where('userId', '==', userId)
    ).valueChanges();
  }
}
