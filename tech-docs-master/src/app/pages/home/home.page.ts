import { Component, OnInit } from '@angular/core';
import { PdfService } from '../../services/pdf.service';
import { PdfThumbnailService } from '../../services/pdf-thumbnail.service';
import { Pdf } from '../../models/pdfs.model';
import { Browser } from '@capacitor/browser';
import { ModalController } from '@ionic/angular';
import { AddToFolderPage } from '../add-to-folder/add-to-folder.page';
import { ReviewService } from '../../services/review.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { FirebaseStorageService } from '../../services/firebase-storage.service';
import { IonModal } from "@ionic/angular";

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  pdfs: Pdf[] = []; // Todos os PDFs carregados
  suggestedPdf: Pdf | null = null; // PDF sugerido
  favoritePDFs: Pdf[] = []; // PDFs favoritos
  title: string = '';
  description: string = '';
  tags: string = '';
  acceptTerms: boolean = false;
  selectedFile: File | null = null; // Armazena o arquivo selecionado

  constructor(
    private pdfService: PdfService,
    private pdfThumbnailService: PdfThumbnailService,
    private modalController: ModalController,
    private reviewService: ReviewService,
    private afAuth: AngularFireAuth,
    private firebaseStorageService: FirebaseStorageService
  ) { }

  ngOnInit() {
    this.loadPDFs();
  }

  async loadPDFs() {
    this.pdfService.getPDFs().subscribe({
      next: async (data) => {
        const user = await this.afAuth.currentUser;
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

  async addToFolder(pdf: Pdf) {
    const modal = await this.modalController.create({
      component: AddToFolderPage,
      componentProps: { pdf },
    });
    await modal.present();
  }

  // Funções de upload de PDF
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.selectedFile = file; // Armazena o arquivo selecionado
    }
  }

  async sendPdf() {
    if (this.selectedFile) {
      try {
        // Fazer upload do arquivo para o Firebase Storage
        this.firebaseStorageService.uploadPDF(this.selectedFile).subscribe(async (downloadURL) => {
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

          // Atualizar a lista de PDFs após o upload
          this.loadPDFs();
          this.cancel(); // Limpa os campos do formulário e fecha o modal
        });
      } catch (error) {
        console.error('Erro ao fazer upload do arquivo:', error);
      }
    } else {
      console.error('Nenhum arquivo selecionado.');
    }
  }

  // Função para cancelar o modal
  cancel() {
    this.title = '';
    this.description = '';
    this.tags = '';
    this.acceptTerms = false;
    this.selectedFile = null; // Reseta o arquivo selecionado
    this.modalController.dismiss();
    
  }

  // Função para lidar com o fechamento do modal
  onWillDismiss(event: any) {
    this.cancel();
  }
}
