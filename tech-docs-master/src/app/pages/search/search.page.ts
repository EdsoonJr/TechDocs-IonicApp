import { Component, OnInit } from '@angular/core';
import { PdfService } from '../../services/pdf.service';
import { PdfThumbnailService } from '../../services/pdf-thumbnail.service';
import { Pdf } from '../../models/pdfs.model';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
})
export class SearchPage implements OnInit {
  searchQuery: string = ''; // Termo atual da busca
  showList: boolean = false; // Exibir ou não o histórico/resultados
  results: string[] = []; // Resultados da busca ou histórico
  data: string[] = []; // Histórico de buscas
  links: string[] = [
    'Engenharia',
    'Programação',
    'Redes de Computadores',
    'Inteligência Artificial',
    'Cybersegurança',
    'Dados',
    'UX/UI',
  ]; // Categorias do carrossel
  recentPDFs: Pdf[] = []; // PDFs vistos recentemente
  pdfs: Pdf[] = []; // Resultados de PDF da busca
  thumbnails: { [key: string]: string } = {}; // Miniaturas
  field: 'title' | 'tags' = 'title'; // Campo de busca

  constructor(
    private pdfService: PdfService,
    private pdfThumbnailService: PdfThumbnailService
  ) {}

  ngOnInit() {
    this.loadRecentPDFs();
  }

  handleInput(event: any) {
    const query = (event.target.value || '').toLowerCase();
    this.searchQuery = query;

    if (query.trim()) {
      // Filtrar histórico
      this.results = this.data.filter((d) => d.toLowerCase().includes(query));
    } else {
      // Mostrar histórico completo
      this.results = [...this.data];
    }
  }

  selectItem(item: string) {
    this.searchQuery = item;
    this.results = [];
    this.showList = false;

    // Adiciona ao histórico, se necessário
    if (!this.data.includes(item)) {
      this.data.push(item);
    }

    // Executa a pesquisa com o item selecionado
    this.performSearch(item);
  }

  showHistory() {
    this.showList = true;
    if (!this.searchQuery.trim()) {
      this.results = [...this.data];
    }
  }

  hideResults() {
    this.showList = false;
  }

  addToSearch(event: Event, link: string) {
    event.preventDefault();
    this.searchQuery = link;
    this.performSearch(link);
  }

  async loadRecentPDFs() {
    this.pdfService.getPDFs().subscribe({
      next: (pdfs) => {
        // Embaralha a lista e seleciona os primeiros 3 PDFs
        const shuffled = pdfs.sort(() => 0.5 - Math.random());
        this.recentPDFs = shuffled.slice(0, 3);
  
        // Gera miniaturas para os PDFs selecionados
        this.recentPDFs.forEach(async (pdf) => {
          pdf.thumbnail = await this.pdfThumbnailService.generateThumbnail(pdf.url);
        });
      },
      error: (err) => console.error('Erro ao carregar PDFs:', err),
    });
  }

  async performSearch(query: string) {
    if (!query) {
      console.warn('A busca não pode estar vazia.');
      return;
    }
    // Lógica de busca de PDFs
    this.pdfService.searchPDFs(query, this.field).subscribe({
      next: async (results) => {
        this.pdfs = results;
        console.log('Resultados da pesquisa:', results);
        await this.generateThumbnails();
      },
      error: (err) => console.error('Erro ao buscar PDFs:', err),
    });
  }

  async generateThumbnails() {
    for (const pdf of this.pdfs) {
      if (pdf.id && pdf.url) {
        try {
          const thumbnail = await this.pdfThumbnailService.generateThumbnail(pdf.url);
          this.thumbnails[pdf.id] = thumbnail;
        } catch (error) {
          console.error(`Erro ao gerar miniatura para o PDF ${pdf.title}:`, error);
        }
      }
    }
  }

  openPDF(pdf: Pdf) {
    window.open(pdf.url, '_blank');
  }

  swiperSlideChanged(event: any) {
    console.log('Slide mudado:', event);
  }

  back() {
    // Implemente a lógica para voltar à página anterior
    console.log('Voltar');
  }

  openMenu() {
    // Implemente a lógica para abrir o menu
    console.log('Abrir menu');
  }
}
