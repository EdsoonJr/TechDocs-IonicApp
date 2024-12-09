import { Component, Input } from "@angular/core";
import {
  ModalController,
  AlertController,
  ToastController,
} from "@ionic/angular";
import { FolderService } from "../../services/folder.service";
import { Pdf } from "../../models/pdfs.model";
import { AngularFireAuth } from "@angular/fire/compat/auth";

@Component({
  selector: "app-add-to-folder",
  templateUrl: "./add-to-folder.page.html",
  styleUrls: ["./add-to-folder.page.scss"],
})
export class AddToFolderPage {
  @Input() pdf!: Pdf;
  folders: any[] = [];

  constructor(
    private afAuth: AngularFireAuth,
    private folderService: FolderService,
    private modalController: ModalController,
    private toastController: ToastController,
    private alertController: AlertController
  ) {}

  ionViewWillEnter() {
    this.afAuth.authState.subscribe((user) => {
      if (user && user.uid) {
        const userId: string = user.uid;
        this.folderService.getFoldersByUser(userId).subscribe((folders) => {
          this.folders = folders;
        });
      } else {
        console.error("Usuário não autenticado ou UID não disponível.");
      }
    });
  }

  dismiss() {
    this.modalController.dismiss();
  }

  addPdfToFolder(folder: any) {
    if (this.pdf?.id) {
      this.folderService
        .addPdfToFolder(folder.id, this.pdf.id)
        .then(() => {
          this.showToast("Pdf adicionado com sucesso!", "success");
          console.log("PDF adicionado à pasta:", folder.title);
          this.dismiss();
        })
        .catch((error) => {
          this.showToast("Erro ao adicionar pdf.", "warning");
          console.error("Erro ao adicionar PDF:", error);
        });
    } else {
      console.error("PDF inválido ou sem ID.");
    }
  }

  async createNewFolder() {
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
                this.dismiss();
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

  async showToast(message: string, color: "success" | "warning") {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: "bottom",
      color,
    });
    toast.present();
  }
}
