import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";

@Component({
  selector: "app-home",
  templateUrl: "./home.page.html",
  styleUrls: ["./home.page.scss"],
})
export class HomePage implements OnInit {
  favoritePDFs = [
    { id: 1, title: "PDF 1", thumbnailUrl: "assets/img/pdf1-thumbnail.png" },
    { id: 2, title: "PDF 2", thumbnailUrl: "assets/img/pdf2-thumbnail.png" },
    { id: 3, title: "PDF 3", thumbnailUrl: "assets/img/pdf3-thumbnail.png" },
  ];
  constructor(private router: Router) {}

  ngOnInit() {
   // Carregar os PDFs favoritados a partir da API ou banco de dados.
  }

  openPDF(pdf: any) {
    console.log("Abrir PDF:", pdf);
    // Implementar lógica para abrir o PDF.
  }

  navigateToFavorites() {
    console.log("Ir para página de Favoritos");
    // Implementar lógica para navegar à página de Favoritos.
  }

  goToProfile() {
    console.log('Navegando para a página de perfil...');
    this.router.navigate(['/profile']); // Altere para a rota da página de perfil
  }
}
