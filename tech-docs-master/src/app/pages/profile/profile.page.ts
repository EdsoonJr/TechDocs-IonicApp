import { Component, OnInit, ViewChild } from "@angular/core";
import { IonModal, ToastController } from "@ionic/angular";
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { Router } from "@angular/router"; // Importar Router para redirecionamento
import { PdfService } from "../../services/pdf.service";
import { PdfThumbnailService } from "../../services/pdf-thumbnail.service"; // Importar o serviço de miniaturas
import { Pdf } from "../../models/pdfs.model";
import { User } from "../../models/user.model"; // Certifique-se de ajustar o caminho se necessário

@Component({
  selector: "app-profile",
  templateUrl: "./profile.page.html",
  styleUrls: ["./profile.page.scss"],
})
export class ProfilePage implements OnInit {
  @ViewChild(IonModal) modal!: IonModal;
  isModalOpen: boolean = false;
  modalTitle = "";
  userName: string = "Usuário";
  userEmail: string = "";
  userArea: string = "Área de Interesse";
  myUploadedPDFs: Pdf[] = [];

  constructor(
    private toastController: ToastController,
    private afAuth: AngularFireAuth,
    private pdfService: PdfService,
    private firestore: AngularFirestore,
    private pdfThumbnailService: PdfThumbnailService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadUserInfo();
  }

  async loadUserInfo() {
    const user = await this.afAuth.currentUser;
    console.log("Usuário:", user);

    if (user) {
      this.userName = user.displayName ? user.displayName : "Usuário";
      this.userEmail = user.email
        ? this.obscureEmail(user.email)
        : "**************";

      // Buscar informações adicionais do usuário na coleção "users"
      const userDoc = await this.firestore
        .collection<User>("users")
        .doc(user.uid)
        .get()
        .toPromise();
      console.log("Documento do usuário:", userDoc);
      if (userDoc && userDoc.exists) {
        const userData = userDoc.data();
        if (userData) {
          this.userArea = userData.area || "Área de Interesse";
        }
      }

      this.loadUploadedPDFs(user.uid);
    }
  }

  obscureEmail(email: string): string {
    const [name, domain] = email.split("@");
    return `${name[0]}*******@${domain}`;
  }

  async loadUploadedPDFs(userId: string) {
    console.log("Carregando PDFs para o usuário:", userId);

    this.pdfService.getPDFsByUser(userId).subscribe({
      next: async (pdfs: Pdf[]) => {
        console.log("PDFs carregados:", pdfs);
        this.myUploadedPDFs = pdfs;

        // Gerar miniaturas para os PDFs carregados
        for (const pdf of this.myUploadedPDFs) {
          if (pdf.url) {
            pdf.thumbnail = await this.pdfThumbnailService.generateThumbnail(
              pdf.url
            );
          }
        }
      },
      error: (err: any) => {
        console.error("Erro ao carregar PDFs:", err);
      },
    });
  }

  openModal(contentType: string) {
    this.isModalOpen = true;
    if (contentType === "downloads") {
      this.modalTitle = "Meus Downloads";
    } else if (contentType === "uploads") {
      this.modalTitle = "Meus Uploads";
    } else if (contentType === "favoritos") {
      this.modalTitle = "Favoritos";
    } else if (contentType === "lixeira") {
      this.modalTitle = "Lixeira";
    }
  }

  closeModal() {
    this.isModalOpen = false;
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

  async logout() {
    try {
      await this.afAuth.signOut();
      this.showToast("Logout realizado com sucesso!", "success");
      this.router.navigateByUrl("/log-in");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      this.showToast("Erro ao fazer logout", "warning");
    }
  }
}
