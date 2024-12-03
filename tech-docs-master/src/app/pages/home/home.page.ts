import { Component, OnInit, ViewChild } from "@angular/core";
import { OverlayEventDetail } from "@ionic/core/components";
import { Router } from "@angular/router";
import { IonModal, ToastController } from "@ionic/angular";

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

  @ViewChild(IonModal) modal!: IonModal;

  title!: string;
  description!: string;
  selectedFile: File | null = null;
  acceptTerms: boolean = false;
  message: { title: string; description: string; fileName: string } | null = null;

  constructor(private router: Router, private toastController: ToastController) {}

  cancel() {
    this.modal.dismiss(null, "cancel");
  }

  sendPdf() {
    if (this.selectedFile && this.acceptTerms) {
      const data = {
        title: this.title,
        description: this.description,
        fileName: this.selectedFile.name,
      };
      this.modal.dismiss(data, "confirm");
      this.showToast("PDF carregado com sucesso!");
    }  else {
      this.showToast("Por favor, preencha todos os campos e aceite o Termo de Condições.");
    }
  }

  onWillDismiss(event: Event) {
    const ev = event as CustomEvent<
      OverlayEventDetail<{ title: string; description: string; fileName: string }>
    >;
    if (ev.detail.role === "confirm") {
      this.message = ev.detail.data || null;
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  isFormValid(): boolean {
    return !!this.title && !!this.description && !!this.selectedFile && this.acceptTerms;
  }

  async showToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: "bottom",
      color: "success",
    });
    toast.present();
  }

  ngOnInit() {
    // Carregar os PDFs favoritados a partir da API ou banco de dados.
  }

  openPDF(pdf: any) {
    console.log("Abrir PDF:", pdf);
  }

  navigateToFavorites() {
    console.log("Ir para página de Favoritos");
  }

  goToProfile() {
    console.log("Navegando para a página de perfil...");
    this.router.navigate(["/profile"]);
  }
}
