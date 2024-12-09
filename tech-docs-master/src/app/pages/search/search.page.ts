import { Component, OnInit } from "@angular/core";
import { PdfService } from "../../services/pdf.service";
import { PdfThumbnailService } from "../../services/pdf-thumbnail.service";
import { Pdf } from "../../models/pdfs.model";
import { NavController } from "@ionic/angular";
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { ReviewService } from "src/app/services/review.service";

@Component({
  selector: "app-search",
  templateUrl: "./search.page.html",
  styleUrls: ["./search.page.scss"],
})
export class SearchPage implements OnInit {
  searchQuery: string = "";
  showList: boolean = false;
  results: string[] = [];
  data: string[] = [];
  recentPDFs: Pdf[] = [];
  pdfs: Pdf[] = [];
  thumbnails: { [key: string]: string } = {};
  field: "title" | "tags" = "title";
  userName: string | null = null;

  constructor(
    private pdfService: PdfService,
    private pdfThumbnailService: PdfThumbnailService,
    private navCtrl: NavController,
    private reviewService: ReviewService,
    private afAuth: AngularFireAuth
  ) {}

  ngOnInit() {
    this.loadRecentPDFs();
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

    // Adiciona ao histórico, se necessário
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

  openPDF(pdf: Pdf) {
    window.open(pdf.url, "_blank");
  }

  backToHome() {
    this.navCtrl.navigateRoot("tabs/tabs/home");
    console.log("Voltar");
  }
}
