import { Component, OnInit } from '@angular/core';
import { PdfService } from '../../services/pdf.service';
import { PdfThumbnailService } from '../../services/pdf-thumbnail.service';
import { Pdf } from '../../models/pdfs.model';
import { ModalController, ActionSheetController } from '@ionic/angular';
import { ReviewService } from '../../services/review.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { FirebaseStorageService } from '../../services/firebase-storage.service';
import { FolderService } from '../../services/folder.service';  // Novo serviço para pastas
import { Folder } from 'src/app/models/folder.model';
import { Browser } from '@capacitor/browser';
import { AddToFolderPage } from '../add-to-folder/add-to-folder.page';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  pdfs: Pdf[] = [];
  suggestedPdf: Pdf | null = null;
  favoritePDFs: Pdf[] = [];
  title: string = '';
  description: string = '';
  tags: string = '';
  acceptTerms: boolean = false;
  selectedFile: File | null = null;
  userName: string | null = null;
  isFolderModalOpen: boolean = false;  // Controle do modal de pastas
  folders: any[] = [];  // Lista de pastas

  constructor(
    private pdfService: PdfService,
    private pdfThumbnailService: PdfThumbnailService,
    private modalController: ModalController,
    private actionSheetController: ActionSheetController,
    private reviewService: ReviewService,
    private afAuth: AngularFireAuth,
    private firebaseStorageService: FirebaseStorageService,
    private folderService: FolderService  // Serviço de pastas
  ) { }

  ngOnInit() {
    this.loadPDFs();
    this.loadFolders();  // Carregar pastas
  }

  // Carregar PDFs
  async loadPDFs() {
    const user = await this.afAuth.currentUser;
    if (user) {
      this.userName = user.displayName ? user.displayName : 'usuário';
    }
    this.pdfService.getPDFs().subscribe({
      next: async (data) => {
        for (const pdf of data) {
          pdf.thumbnail = await this.pdfThumbnailService.generateThumbnail(pdf.url);
          if (user && pdf.id) {
            const review = await this.reviewService.getUserReviewForPdf(pdf.id, user.uid);
            pdf.userRating = review ? review.rating : 0;
          } else {
            pdf.userRating = 0;
          }
        }
        this.pdfs = data;

        // Selecionar PDF aleatório para "Sugerido"
        if (this.pdfs.length > 0) {
          this.suggestedPdf = this.pdfs[Math.floor(Math.random() * this.pdfs.length)];
        }

        // Selecionar alguns PDFs como "Favoritos"
        this.favoritePDFs = this.pdfs.slice(0, 3); // Exibir os 4 primeiros como exemplo
      },
      error: (error) => {
        console.error('Erro ao carregar PDFs:', error);
      },
    });
  }

  // Carregar pastas
  // Carregar pastas
async loadFolders() {
  const user = await this.afAuth.currentUser;
  if (user) {
    this.folderService.getFoldersByUser(user.uid).subscribe({
      next: (folders: Folder[]) => {
        this.folders = folders;
        console.log('Pastas carregadas:', this.folders);  // Adicione este log
      },
      error: (error) => {
        console.error('Erro ao carregar pastas:', error);
      },
    });
  }
}


  // Exibir o Action Sheet com as opções
  async showActionSheet(pdf: Pdf) {
    const actionSheet = await this.actionSheetController.create({
      header: 'Escolha uma ação',
      buttons: [
        {
          text: 'Adicionar a Pasta',
          icon: 'folder',
          handler: () => {
            this.addToFolder(pdf);
            
          }
        },
        {
          text: 'Abrir PDF',
          icon: 'open',
          handler: () => {
            this.openPDF(pdf);
          }
        },
        {
          text: 'Baixar PDF',
          icon: 'download',
          handler: () => {
            this.downloadPDF(pdf);
          }
        },
        {
          text: 'Cancelar',
          icon: 'close',
          role: 'cancel',
          handler: () => {
            console.log('Cancelado');
          }
        }
      ]
    });
    await actionSheet.present();
  }

  async addToFolder(pdf: Pdf) {
    const modal = await this.modalController.create({
      component: AddToFolderPage,
      componentProps: { pdf }, // Passa o PDF para o modal
    });
    await modal.present();
  }

  async openPDF(pdf: Pdf) {
    try {
      await Browser.open({ url: pdf.url });
    } catch (error) {
      console.error('Erro ao abrir o PDF:', error);
    }
  }

  async downloadPDF(pdf: Pdf) {
    try {
      const response = await fetch(pdf.url);
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${pdf.title}.pdf`;
      link.click();
    } catch (error) {
      console.error('Erro ao baixar o PDF:', error);
    }
  }
  async onRatingChange(pdfId: string | undefined, newRating: number) {
    const user = await this.afAuth.currentUser;
    if (!user || !pdfId) return;
    const review = { pdfId, userId: user.uid, rating: newRating };
    await this.reviewService.addOrUpdateReview(review);
    const pdf = this.pdfs.find((p) => p.id === pdfId);
    if (pdf) {
      pdf.userRating = newRating;
    }
  }

  // Funções de upload de PDF
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  async sendPdf() {
    if (this.selectedFile) {
      try {
        this.firebaseStorageService.uploadPDF(this.selectedFile).subscribe(async (downloadURL) => {
          console.log('Arquivo enviado com sucesso. URL:', downloadURL);

          const user = await this.afAuth.currentUser;
          if (!user) {
            console.error('Usuário não autenticado');
            return;
          }

          const pdfData: Pdf = {
            title: this.title,
            description: this.description,
            tags: this.tags.split(',').map(tag => tag.trim()),
            user_id: user.uid,
            upload_date: new Date(),
            url: downloadURL,
            download_count: 0,
            review_count: 0,
          };

          await this.pdfService.addPDF(pdfData);
          console.log('Metadados do PDF salvos com sucesso no Firestore.');
          this.loadPDFs();
          this.cancel();
        });
      } catch (error) {
        console.error('Erro ao fazer upload do arquivo:', error);
      }
    } else {
      console.error('Nenhum arquivo selecionado.');
    }
  }

  cancel() {
    this.title = '';
    this.description = '';
    this.tags = '';
    this.acceptTerms = false;
    this.selectedFile = null;
    this.modalController.dismiss();
  }

  closeFolderModal() {
    this.isFolderModalOpen = false;
  }

  onWillDismiss(event: any) {
    this.cancel();
  }
}
