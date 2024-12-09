import { Component, HostListener, OnInit } from "@angular/core";
import { FolderService } from "../../services/folder.service";
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { PdfService } from "../../services/pdf.service";
import { PdfThumbnailService } from "../../services/pdf-thumbnail.service";
import { Browser } from "@capacitor/browser";
import { AlertController, NavController } from "@ionic/angular";

@Component({
  selector: "app-folder",
  templateUrl: "./folder.page.html",
  styleUrls: ["./folder.page.scss"],
})
export class FolderPage implements OnInit {
  folders: any[] = [];
  selectedFolder: any = null;
  pdfs: any[] = [];
  isTooltipVisible: boolean = false;
  isHammerIcon: boolean = true;

  constructor(
    private folderService: FolderService,
    private afAuth: AngularFireAuth,
    private pdfService: PdfService,
    private pdfThumbnailService: PdfThumbnailService,
    private alertController: AlertController,
    private navCtrl: NavController
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
    this.selectedFolder = folder;
    this.pdfs = [];

    for (const pdfId of folder.pdfs) {
      const pdf = await this.pdfService.getPdfById(pdfId);
      if (pdf) {
        pdf.thumbnail = await this.pdfThumbnailService.generateThumbnail(
          pdf.url
        );
        this.pdfs.push(pdf);
      }
    }
  }

  backToFolders() {
    this.selectedFolder = null;
    this.navCtrl.navigateRoot("/folder");
    console.log("Voltar para lista de pastas");
  }

  async openPDF(pdf: any) {
    try {
      await Browser.open({ url: pdf.url });
    } catch (error) {
      console.error("Erro ao abrir o PDF:", error);
    }
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
    this.isHammerIcon = !this.isHammerIcon;
  }

  @HostListener("document:click", ["$event"])
  handleOutsideClick(event: MouseEvent) {
    const clickedInside = (event.target as HTMLElement).closest(
      ".tooltip-container"
    );
    const clickedButton = (event.target as HTMLElement).closest(".add-icon");
    if (!clickedInside && !clickedButton) {
      this.isTooltipVisible = false;
      this.isHammerIcon = true;
    }
  }
}
