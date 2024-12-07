import { Component } from '@angular/core';
import { PdfService } from '../../services/pdf.service';
import { PdfThumbnailService } from '../../services/pdf-thumbnail.service';
import { Pdf } from '../../models/pdfs.model';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
})
export class SearchPage {
  query = ''; // Termo de busca
  field: 'title' | 'tags'  = 'title'; // Campo de busca
  pdfs: Pdf[] = [];
  thumbnails: { [key: string]: string } = {}; // Miniaturas

  constructor(private pdfService: PdfService, private pdfThumbnailService: PdfThumbnailService) {}

  search() {
    if (!this.query) {
      console.warn('A busca não pode estar vazia.');
      return;
    }

    this.pdfService.searchPDFs(this.query, this.field).subscribe({
      next: (results) => {
        this.pdfs = results;
        console.log('Resultados da pesquisa:', this.pdfs);
        this.generateThumbnails();
      },
      error: (error) => {
        console.error('Erro ao buscar PDFs:', error);
      },
    });
  }

  async generateThumbnails() {
    for (const pdf of this.pdfs) {
      if (pdf.id && pdf.url) { // Garante que ambos existem
        try {
          const thumbnail = await this.pdfThumbnailService.generateThumbnail(pdf.url);
          this.thumbnails[pdf.id] = thumbnail;
        } catch (error) {
          console.error(`Erro ao gerar miniatura para o PDF ${pdf.title}:`, error);
        }
      }
    }
  }

  openPdf(url: string) {
    window.open(url, '_blank');
  }
}
