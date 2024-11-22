import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-search",
  templateUrl: "./search.page.html",
  styleUrls: ["./search.page.scss"],
})
export class SearchPage implements OnInit {
  links = [
    "Engenharia",
    "Programação",
    "Redes de Computadores",
    "Inteligência Artificial",
    "Cybersegurança",
    "Dados",
    "UX/UI",
  ];
  favoritePDFs = [
    { id: 1, title: "PDF 1", thumbnailUrl: "assets/img/pdf1-thumbnail.png" },
    { id: 2, title: "PDF 2", thumbnailUrl: "assets/img/pdf2-thumbnail.png" },
    { id: 3, title: "PDF 3", thumbnailUrl: "assets/img/pdf3-thumbnail.png" },
  ];
  constructor() {}

  openPDF(pdf: any) {
    console.log("Abrir PDF:", pdf);
    // Implementar lógica para abrir o PDF.
  }

  navigateToFavorites() {
    console.log("Ir para página de Favoritos");
    // Implementar lógica para navegar à página de Favoritos.
  }

  public data: string[] = []; // Histórico de buscas
  public results: string[] = []; // Resultados filtrados ou histórico visível
  public searchQuery: string = ""; // Valor atual da barra de pesquisa
  public showList: boolean = false; // Controla a visibilidade da lista

  handleInput(event: any) {
    const query = event.target.value?.toLowerCase() || "";
    this.searchQuery = query;

    if (query.trim() !== "") {
      // Filtra os resultados com base no que foi digitado
      this.results = this.data.filter((d) => d.toLowerCase().includes(query));
      // Adiciona ao histórico (se não existir)
      if (!this.data.includes(query) && query.trim() !== "") {
        this.data.push(query);
      }
    } else {
      // Mostra o histórico se a barra estiver vazia
      this.results = [...this.data];
    }
  }

  selectItem(item: string) {
    // Define o item selecionado como o valor da barra
    this.searchQuery = item;
    this.results = []; // Oculta os resultados após a seleção
    this.showList = false;

    // Garante que o item selecionado está no histórico
    if (!this.data.includes(item)) {
      this.data.push(item);
    }
  }

  showHistory() {
    this.showList = true;
    // Mostra o histórico completo se a barra estiver vazia
    if (this.searchQuery.trim() === "") {
      this.results = [...this.data];
    }
  }

  hideResults() {
    this.showList = false; // Oculta os resultados ou histórico
  }

  addToSearch(event: Event, link: string) {
    event.preventDefault();
    const searchBar = document.querySelector("ion-searchbar") as any;
    if (searchBar) {
      searchBar.value = link;
      searchBar.setFocus(); 
    }
  }

  swiperSlideChanged(e: any) {
    console.log("changed: ", e);
  }

  ngOnInit() {}
}
