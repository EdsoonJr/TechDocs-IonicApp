import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-folder",
  templateUrl: "./folder.page.html",
  styleUrls: ["./folder.page.scss"],
})
export class FolderPage implements OnInit {
  // Exemplo de dados das pastas
  public folders = [
    {
      name: "Engenharia",
      previewImageUrl: "assets/img/preview-pdf-engenharia.png", // Miniatura do PDF
      pdfs: ["pdf1.pdf", "pdf2.pdf"],
      isEditing: false,
    },
    {
      name: "Programação",
      previewImageUrl: "assets/img/preview-pdf-programacao.png",
      pdfs: ["pdf1.pdf", "pdf2.pdf"],
      isEditing: false,
    },
    {
      name: "Inteligência Artificial",
      previewImageUrl: "assets/img/preview-pdf-ia.png",
      pdfs: ["pdf1.pdf", "pdf2.pdf"],
      isEditing: false,
    },
  ];

  editFolderName(index: number) {
    this.folders[index].isEditing = true;
  }

  saveFolderName(index: number) {
    this.folders[index].isEditing = false;
  }

  openFolder(folder: any) {
    console.log("Abrindo pasta:", folder.name);
  }
  constructor() {}

  ngOnInit() {}
}
