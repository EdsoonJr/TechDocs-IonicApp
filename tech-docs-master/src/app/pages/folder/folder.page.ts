import { Component, OnInit } from '@angular/core';
import { FolderService } from '../../services/folder.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { PdfService } from '../../services/pdf.service';
import { PdfThumbnailService } from '../../services/pdf-thumbnail.service';
import { Browser } from '@capacitor/browser';
import { AlertController } from '@ionic/angular'; // Importar AlertController

@Component({
  selector: 'app-folder',
  templateUrl: './folder.page.html',
  styleUrls: ['./folder.page.scss'],
})
export class FolderPage implements OnInit {
  folders: any[] = []; // Armazena as pastas do usuário
  selectedFolder: any = null; // Pasta selecionada para visualizar PDFs
  pdfs: any[] = []; // PDFs com thumbnails

  constructor(
    private folderService: FolderService,
    private afAuth: AngularFireAuth, // Serviço para autenticação
    private pdfService: PdfService,
    private pdfThumbnailService: PdfThumbnailService,
    private alertController: AlertController // Adicionar AlertController
  ) {}

  ngOnInit() {
    this.afAuth.authState.subscribe((user) => {
      if (user && user.uid) { // Certifique-se de que 'user.uid' está definido
        const userId: string = user.uid; // Agora temos certeza que 'userId' é string
        this.folderService.getFoldersByUser(userId).subscribe((folders) => {
          this.folders = folders;
        });
      } else {
        console.error('Usuário não autenticado ou UID não disponível.');
      }
    });
  }

  // Selecionar pasta para visualizar PDFs e carregar thumbnails
  async selectFolder(folder: any) {
    this.selectedFolder = folder;
    this.pdfs = []; // Resetar a lista de PDFs

    for (const pdfId of folder.pdfs) {
      const pdf = await this.pdfService.getPdfById(pdfId); // Método que busca o PDF pelo ID
      if (pdf) {
        pdf.thumbnail = await this.pdfThumbnailService.generateThumbnail(pdf.url);
        this.pdfs.push(pdf);
      }
    }
  }

  // Voltar para a lista de pastas
  backToFolders() {
    this.selectedFolder = null;
    this.pdfs = []; // Resetar a lista de PDFs
  }

  // Método para abrir o PDF
  async openPDF(pdf: any) {
    try {
      await Browser.open({ url: pdf.url });
    } catch (error) {
      console.error('Erro ao abrir o PDF:', error);
    }
  }

  // Método para abrir o alerta de criação de pasta
  async CreateFolderAlert() {
    const alert = await this.alertController.create({
      header: 'Criar nova pasta',
      inputs: [
        {
          name: 'folderName',
          type: 'text',
          placeholder: 'Nome da pasta'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Cancelado');
          }
        },
        {
          text: 'Criar',
          handler: async (data) => {
            const user = await this.afAuth.currentUser; // Obtém o usuário autenticado
            if (user) {
              const newFolder = {
                title: data.folderName,
                userId: user.uid, // Obtém o UID do usuário
                createdAt: new Date(),
                pdfs: [] // Inicializa com um array vazio para 'pdfs'
              };

              try {
                await this.folderService.createFolder(newFolder);
                console.log('Nova pasta criada:', newFolder.title);
              } catch (error) {
                console.error('Erro ao criar pasta:', error);
              }
            } else {
              console.error('Usuário não autenticado.');
            }
          }
        }
      ]
    });

    await alert.present();
  }
}
