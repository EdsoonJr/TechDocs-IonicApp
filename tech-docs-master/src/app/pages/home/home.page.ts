import { Component, OnInit } from '@angular/core';
import { PdfService } from '../../services/pdf.service';
import { Pdf } from '../../models/pdfs.model';
import { Browser } from '@capacitor/browser';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  pdfs: Pdf[] = []; // Array para armazenar os PDFs

  constructor(private pdfService: PdfService) {}

  ngOnInit() {
    this.loadPDFs();
  }

  // Método para carregar os PDFs
  loadPDFs() {
    this.pdfService.getPDFs().subscribe({
      next: (data) => {
        this.pdfs = data;
        console.log('PDFs carregados:', this.pdfs);
      },
      error: (error) => {
        console.error('Erro ao carregar PDFs:', error);
      },
    });
  }

  // Método para abrir o PDF
  async openPDF(pdf: Pdf) {
    try {
      await Browser.open({ url: pdf.url });
    } catch (error) {
      console.error('Erro ao abrir o PDF:', error);
    }
  }
}
