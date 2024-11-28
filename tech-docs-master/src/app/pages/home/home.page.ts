import { Component, OnInit } from '@angular/core';
import { PdfService } from '../../services/pdf.service';
import { PdfThumbnailService } from '../../services/pdf-thumbnail.service';
import { Pdf } from '../../models/pdfs.model';
import { Browser } from '@capacitor/browser';
import { ModalController } from '@ionic/angular'; // Importar ModalController
import { AddToFolderPage } from '../add-to-folder/add-to-folder.page'; // Importar o modal
import { ReviewService } from '../../services/review.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Filesystem, Directory } from '@capacitor/filesystem'; // Importando Filesystem para download

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  pdfs: Pdf[] = []; // Array para armazenar os PDFs

  constructor(
    private pdfService: PdfService,
    private pdfThumbnailService: PdfThumbnailService,
    private modalController: ModalController,
    private reviewService: ReviewService,
    private afAuth: AngularFireAuth
  ) { }

  ngOnInit() {
    this.loadPDFs();
  }

  // Método para carregar os PDFs
  async loadPDFs() {
    this.pdfService.getPDFs().subscribe({
      next: async (data) => {
        const user = await this.afAuth.currentUser;
        for (const pdf of data) {
          // Gera a miniatura para cada PDF
          pdf.thumbnail = await this.pdfThumbnailService.generateThumbnail(pdf.url);
          // Lógica para obter a avaliação do usuário
          if (user && pdf.id) {
            const review = await this.reviewService.getUserReviewForPdf(pdf.id, user.uid);
            pdf.userRating = review ? review.rating : 0;  // Garantir que userRating não seja undefined
          } else {
            pdf.userRating = 0;  // Garantir que userRating tenha valor padrão
          }
        }
        this.pdfs = data;
        console.log('PDFs carregados:', this.pdfs);
      },
      error: (error) => {
        console.error('Erro ao carregar PDFs:', error);
      },
    });
  }

  // Atualizar a avaliação ao clicar nas estrelas
  async onRatingChange(pdfId: string | undefined, newRating: number) {
    if (!pdfId) {
      console.error('Erro: ID do PDF está indefinido');
      return;
    }
    const user = await this.afAuth.currentUser;
    if (!user) return;

    const review = {
      pdfId: pdfId,
      userId: user.uid,
      rating: newRating,
    };
    try {
      // Adiciona ou atualiza a avaliação do usuário
      await this.reviewService.addOrUpdateReview(review);

      // Atualiza a avaliação visual no PDF correspondente
      const pdf = this.pdfs.find((p) => p.id === pdfId);
      if (pdf) {
        pdf.userRating = newRating;  // Atualiza a avaliação do usuário para esse PDF

        // Atualiza o contador de avaliações
        if (pdf.review_count === undefined) {
          pdf.review_count = 1;  // Se o campo estiver undefined, inicia o contador com 1
        } else {
          pdf.review_count += 1;  // Incrementa o contador de avaliações
        }
        // Atualiza o PDF no banco de dados (se necessário)
        await this.pdfService.updatePdf(pdf);  // Supondo que exista um método `updatePdf` que atualiza o PDF no banco
      }
    } catch (error) {
      console.error('Erro ao salvar avaliação:', error);
    }
  }

  // Método para fazer o download do PDF
  async downloadPDF(pdf: Pdf) {
    try {
      const url = pdf.url;
      const fileName = `${pdf.title}.pdf`; // Nome do arquivo com a extensão .pdf
      //mobile donload
  //     const response = await fetch(url);
  //     const blob = await response.blob();
  //     const file = new File([blob], fileName, { type: 'application/pdf' });

  //     // Salvar o arquivo no dispositivo
  //     const savedFile = await Filesystem.writeFile({
  //       path: `downloads/${fileName}`,
  //       data: blob,
  //       directory: Directory.Documents, // Usando o enum Directory para especificar o diretório correto
  //     });

  //     console.log('PDF salvo com sucesso:', savedFile.uri);
  //     alert('PDF baixado com sucesso!');
  //   } catch (error) {
  //     console.error('Erro ao baixar o PDF:', error);
  //     alert('Erro ao baixar o PDF. Tente novamente.');
  //   }
  // }
      // Baixar o arquivo usando fetch e a API Blob
      const response = await fetch(url);
      const blob = await response.blob();
      
      // Criar um link de download temporário
      const link = document.createElement('a');
      const objectUrl = URL.createObjectURL(blob);
      link.href = objectUrl;
      link.download = fileName;
      link.click();
      
      console.log('PDF pronto para download:', fileName);
      alert('PDF baixado com sucesso!');
    } catch (error) {
      console.error('Erro ao baixar o PDF:', error);
      alert('Erro ao baixar o PDF. Tente novamente.');
    }
  }
  

  // Método para abrir o PDF
  async openPDF(pdf: Pdf) {
    try {
      await Browser.open({ url: pdf.url });
    } catch (error) {
      console.error('Erro ao abrir o PDF:', error);
    }
  }

  // Método para abrir o modal de adicionar à pasta
  async addToFolder(pdf: Pdf) {
    const modal = await this.modalController.create({
      component: AddToFolderPage,
      componentProps: { pdf }, // Passa o PDF para o modal
    });
    await modal.present();
  }
}
