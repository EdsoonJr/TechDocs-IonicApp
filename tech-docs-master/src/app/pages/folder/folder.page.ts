import { Component, HostListener, OnInit, ViewChild } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { FolderService } from "../../services/folder.service";
import { PdfService } from "../../services/pdf.service";
import { ReviewService } from "src/app/services/review.service";
import { PdfThumbnailService } from "../../services/pdf-thumbnail.service";
import { Browser } from "@capacitor/browser";
import { IonTitle } from "@ionic/angular";
import {
  ActionSheetController,
  AlertController,
  ModalController,
  NavController,
} from "@ionic/angular";
import { Pdf } from "src/app/models/pdfs.model";
import { AddToFolderPage } from "../add-to-folder/add-to-folder.page";

@Component({
  selector: "app-folder",
  templateUrl: "./folder.page.html",
  styleUrls: ["./folder.page.scss"],
})
export class FolderPage implements OnInit {
  title: string = "Minhas Pastas";
  selectedFolder: any = null;
  userName: string | null = null;
  isTooltipVisible: boolean = false;
  isFolderIcon: boolean = true;
  isInsideFolder: boolean = false;
  activeTooltip: boolean = true;
  showNoResults: boolean = false;
  folders: any[] = [];
  pdfs: any[] = [];
  thumbnails: { [key: string]: string } = {};

  @ViewChild(IonTitle, { static: false }) ionTitle!: IonTitle;

  constructor(
    private afAuth: AngularFireAuth,
    private folderService: FolderService,
    private pdfService: PdfService,
    private pdfThumbnailService: PdfThumbnailService,
    private reviewService: ReviewService,
    private modalController: ModalController,
    private alertController: AlertController,
    private navCtrl: NavController,
    private actionSheetController: ActionSheetController
  ) {}

  ngOnInit() {
    this.afAuth.authState.subscribe((user) => {
      if (user && user.uid) {
        const userId: string = user.uid;
        this.folderService.getFoldersByUser(userId).subscribe((folders) => {
          this.folders = folders;
          this.loadPreviews(folders);
        });
      } else {
        console.error("Usuário não autenticado ou UID não disponível.");
      }
    });
  }

  async loadPreviews(folders: any[]) {
    for (const folder of folders) {
      if (folder.pdfs.length > 0) {
        const firstPdfId = folder.pdfs[0];
        const pdf = await this.pdfService.getPdfById(firstPdfId);
        if (pdf) {
          folder.previewImageUrl =
            await this.pdfThumbnailService.generateThumbnail(pdf.url);
        }
      }
    }
  }

  async selectFolder(folder: any) {
    this.isInsideFolder = true;
    this.activeTooltip = false;
    this.selectedFolder = folder;
    this.pdfs = [];
    this.title = "Arquivos";

    this.showNoResults = folder.pdfs.length === 0;

    for (const pdfId of folder.pdfs) {
      const pdf = await this.pdfService.getPdfById(pdfId);
      if (pdf && pdf.id) {
        const thumbnailUrl = await this.pdfThumbnailService.generateThumbnail(pdf.url);
        this.thumbnails[pdf.id] = thumbnailUrl;
        this.pdfs.push(pdf);
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

  async showActionSheet(pdf: Pdf) {
    const actionSheet = await this.actionSheetController.create({
      header: "Escolha uma ação",
      buttons: [
        {
          text: "Adicionar a outra Pasta",
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

  async openPDF(pdf: any) {
    try {
      await Browser.open({ url: pdf.url });
    } catch (error) {
      console.error("Erro ao abrir o PDF:", error);
    }
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

  backToFolders() {
    this.selectedFolder = null;
    this.isInsideFolder = false;
    this.activeTooltip = true;
    this.navCtrl.navigateRoot("/folder");
    console.log("Voltar para lista de pastas");
    this.title = "Minhas Pastas";
  }

  async CreateFolderAlert() {
    const alert = await this.alertController.create({
      header: "Criar nova pasta",
      inputs: [
        {
          name: "folderName",
          type: "text",
          placeholder: "Nome da pasta",
        },
      ],
      buttons: [
        {
          text: "Cancelar",
          role: "cancel",
          cssClass: "secondary",
          handler: () => {
            console.log("Cancelado");
          },
        },
        {
          text: "Criar",
          handler: async (data) => {
            const user = await this.afAuth.currentUser;
            if (user) {
              const newFolder = {
                title: data.folderName,
                userId: user.uid,
                createdAt: new Date(),
                pdfs: [],
              };

              try {
                await this.folderService.createFolder(newFolder);
                console.log("Nova pasta criada:", newFolder.title);
              } catch (error) {
                console.error("Erro ao criar pasta:", error);
              }
            } else {
              console.error("Usuário não autenticado.");
            }
          },
        },
      ],
    });

    await alert.present();
  }

  toggleTooltip() {
    this.isTooltipVisible = !this.isTooltipVisible;
    this.isFolderIcon = !this.isFolderIcon;
  }

  @HostListener("document:click", ["$event"])
  handleOutsideClick(event: MouseEvent) {
    const clickedInside = (event.target as HTMLElement).closest(
      ".tooltip-container"
    );
    const clickedButton = (event.target as HTMLElement).closest(".add-icon");
    if (!clickedInside && !clickedButton) {
      this.isTooltipVisible = false;
      this.isFolderIcon = true;
    }
  }
}
