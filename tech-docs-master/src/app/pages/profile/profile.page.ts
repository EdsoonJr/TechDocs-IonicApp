import { Component, OnInit, ViewChild } from "@angular/core";
import { IonModal, ToastController } from "@ionic/angular";
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { PdfService } from '../../services/pdf.service';
import { Pdf } from '../../models/pdfs.model';
import { User } from '../../models/user.model'; // Certifique-se de ajustar o caminho se necessário

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
    private firestore: AngularFirestore
  ) {}

  ngOnInit() {
    this.loadUserInfo();
  }

  async loadUserInfo() {
    const user = await this.afAuth.currentUser;
    console.log('Usuário:', user);  // Log para verificar se o usuário está sendo carregado corretamente
  
    if (user) {
      this.userName = user.displayName ? user.displayName : "Usuário";
      this.userEmail = user.email ? this.obscureEmail(user.email) : "**************";
      
      // Buscar informações adicionais do usuário na coleção "users"
      const userDoc = await this.firestore.collection<User>('users').doc(user.uid).get().toPromise();
      console.log('Documento do usuário:', userDoc);  // Log para verificar se o documento do usuário foi encontrado
      if (userDoc && userDoc.exists) {
        const userData = userDoc.data();
        if (userData) {
          this.userArea = userData.area || "Área de Interesse";
        }
      }
  
      this.loadUploadedPDFs(user.uid);  // Carregar PDFs após obter os dados do usuário
    }
  }

  obscureEmail(email: string): string {
    const [name, domain] = email.split("@");
    return `${name[0]}*******@${domain}`;
  }

  loadUploadedPDFs(userId: string) {
    console.log('Carregando PDFs para o usuário:', userId);  // Log para verificar o ID do usuário
  
    this.pdfService.getPDFsByUser(userId).subscribe({
      next: (pdfs: Pdf[]) => {
        console.log('PDFs carregados:', pdfs);  // Log para verificar os PDFs carregados
        this.myUploadedPDFs = pdfs;
      },
      error: (err: any) => {
        console.error('Erro ao carregar PDFs:', err);  // Log para verificar o erro ao carregar PDFs
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
}
