import { Component, OnInit } from "@angular/core";
import { PdfService } from "../../services/pdf.service";
import { PdfThumbnailService } from "../../services/pdf-thumbnail.service";
import { Pdf } from "../../models/pdfs.model";
import {
  ActionSheetController,
  ModalController,
  NavController,
} from "@ionic/angular";
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { ReviewService } from "src/app/services/review.service";
import { FolderService } from "src/app/services/folder.service";
import { Folder } from "src/app/models/folder.model";
import { AddToFolderPage } from "../add-to-folder/add-to-folder.page";
import { FirebaseStorageService } from "src/app/services/firebase-storage.service";

@Component({
  selector: "app-search",
  templateUrl: "./search.page.html",
  styleUrls: ["./search.page.scss"],
})
export class SearchPage implements OnInit {
  searchQuery: string = "";
  selectedFile: File | null = null;
  title: string = "";
  description: string = "";
  tags: string = "";
  userName: string | null = null;
  isFolderModalOpen: boolean = false;
  hasSearched: boolean = false;
  showList: boolean = false;
  results: string[] = [];
  data: string[] = [];
  recentPDFs: Pdf[] = [];
  pdfs: Pdf[] = [];
  folders: any[] = [];
  thumbnails: { [key: string]: string } = {};
  field: "title" | "tags" = "title";

  constructor(
    private pdfService: PdfService,
    private pdfThumbnailService: PdfThumbnailService,
    private navCtrl: NavController,
    private reviewService: ReviewService,
    private afAuth: AngularFireAuth,
    private folderService: FolderService,
    private modalController: ModalController,
    private firebaseStorageService: FirebaseStorageService,
    private actionSheetController: ActionSheetController
  ) {}

  ngOnInit() {
    this.loadRecentPDFs();
    this.loadFolders();
    this.hasSearched = false;
    this.pdfs = [];
    this.searchQuery = "";
    this.results = [];
  }

  handleInput(event: any) {
    const query = (event.target.value || "").toLowerCase();
    this.searchQuery = query;

    if (query.trim()) {
      this.results = this.data.filter((d) => d.toLowerCase().includes(query));
    } else {
      this.results = [...this.data];
    }
  }

  selectItem(item: string) {
    this.searchQuery = item;
    this.results = [];
    this.showList = false;

    if (!this.data.includes(item)) {
      this.data.push(item);
    }

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
        const shuffled = pdfs.sort(() => 0.5 - Math.random());
        this.recentPDFs = shuffled.slice(0, 3);

        this.recentPDFs.forEach(async (pdf) => {
          pdf.thumbnail = await this.pdfThumbnailService.generateThumbnail(
            pdf.url
          );
        });
      },
      error: (err) => console.error("Erro ao carregar PDFs:", err),
    });
  }

  async performSearch(query: string) {
    if (!query) {
      console.warn("A busca não pode estar vazia.");
      return;
    }

    this.hasSearched = true;

    // Lógica de busca de PDFs
    this.pdfService.searchPDFs(query, this.field).subscribe({
      next: async (results) => {
        this.pdfs = results;
        console.log("Resultados da pesquisa:", results);
        await this.generateThumbnails();
      },
      error: (err) => console.error("Erro ao buscar PDFs:", err),
    });

    const user = await this.afAuth.currentUser;
    if (user) {
      this.userName = user.displayName ? user.displayName : "usuário";
    }
  }

  async generateThumbnails() {
    for (const pdf of this.pdfs) {
      if (pdf.id && pdf.url) {
        try {
          const thumbnail = await this.pdfThumbnailService.generateThumbnail(
            pdf.url
          );
          this.thumbnails[pdf.id] = thumbnail;
        } catch (error) {
          console.error(
            `Erro ao gerar miniatura para o PDF ${pdf.title}:`,
            error
          );
        }
      }
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

  async loadFolders() {
    const user = await this.afAuth.currentUser;
    if (user) {
      this.folderService.getFoldersByUser(user.uid).subscribe({
        next: (folders: Folder[]) => {
          this.folders = folders;
          console.log("Pastas carregadas:", this.folders);
        },
        error: (error) => {
          console.error("Erro ao carregar pastas:", error);
        },
      });
    }
  }

  async showActionSheet(pdf: Pdf) {
    const actionSheet = await this.actionSheetController.create({
      header: "Escolha uma ação",
      buttons: [
        {
          text: "Adicionar a Pasta",
          icon: "folder",
          handler: () => {
            this.addToFolder(pdf);
          },
        },
        {
          text: "Abrir PDF",
          icon: "open",
          handler: () => {
            this.openPDF(pdf);
          },
        },
        {
          text: "Baixar PDF",
          icon: "download",
          handler: () => {
            this.downloadPDF(pdf);
          },
        },
        {
          text: "Cancelar",
          icon: "close",
          role: "cancel",
          handler: () => {
            console.log("Cancelado");
          },
        },
      ],
    });
    await actionSheet.present();
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
      this.selectedFile = file;
    }
  }

  async sendPdf() {
    if (this.selectedFile) {
      try {
        this.firebaseStorageService
          .uploadPDF(this.selectedFile)
          .subscribe(async (downloadURL) => {
            console.log("Arquivo enviado com sucesso. URL:", downloadURL);

            const user = await this.afAuth.currentUser;
            if (!user) {
              console.error("Usuário não autenticado");
              return;
            }

            const pdfData: Pdf = {
              title: this.title,
              description: this.description,
              tags: this.tags.split(",").map((tag) => tag.trim()),
              user_id: user.uid,
              upload_date: new Date(),
              url: downloadURL,
              download_count: 0,
              review_count: 0,
            };

            await this.pdfService.addPDF(pdfData);
            console.log("Metadados do PDF salvos com sucesso no Firestore.");
            this.loadRecentPDFs();
            this.cancel();
          });
      } catch (error) {
        console.error("Erro ao fazer upload do arquivo:", error);
      }
    } else {
      console.error("Nenhum arquivo selecionado.");
    }
  }

  openPDF(pdf: Pdf) {
    window.open(pdf.url, "_blank");
  }

  async downloadPDF(pdf: Pdf) {
    try {
      const response = await fetch(pdf.url);
      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${pdf.title}.pdf`;
      link.click();
    } catch (error) {
      console.error("Erro ao baixar o PDF:", error);
    }
  }

  cancel() {
    this.title = "";
    this.description = "";
    this.tags = "";
    this.modalController.dismiss();
  }

  backToSearch() {
    this.hasSearched = false;
    this.pdfs = [];
    this.searchQuery = "";
    this.showList = false;
    this.results = [];
    this.navCtrl.navigateRoot("tabs/tabs/search");
    console.log("Voltando para página de busca");
  }
}
