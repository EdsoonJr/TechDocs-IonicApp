import { Component } from '@angular/core';
import { PdfService } from '../../services/pdf.service';
import { Pdf } from '../../models/pdfs.model';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
})
export class SearchPage {
  query = ''; // Termo de busca
   field: 'title' | 'tags' = 'title'; // Campo de busca ('title', 'tags' ou 'area')
  pdfs: Pdf[] = [];

  constructor(private pdfService: PdfService) {}

  search() {
    if (!this.query) {
      console.warn('A busca não pode estar vazia.');
      return;
    }

    this.pdfService.searchPDFs(this.query, this.field).subscribe({
      next: (results) => {
        this.pdfs = results;
        console.log('Resultados da pesquisa:', this.pdfs);
      },
      error: (error) => {
        console.error('Erro ao buscar PDFs:', error);
      },
    });
  }
}
