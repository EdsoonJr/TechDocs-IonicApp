import { Component, OnInit, ViewChild } from "@angular/core";
import { IonModal, ToastController } from "@ionic/angular";

@Component({
  selector: "app-profile",
  templateUrl: "./profile.page.html",
  styleUrls: ["./profile.page.scss"],
})
export class ProfilePage implements OnInit {
  @ViewChild(IonModal) modal!: IonModal;
  isModalOpen: boolean = false;

  myUploadedPDFs = [
    {
      id: 1,
      title: "PDF 1",
      description: "Alguma descrição sobre o PDF",
      thumbnailUrl: "assets/img/pdf1-thumbnail.png",
    },
    {
      id: 2,
      title: "PDF 2",
      description: "Alguma descrição sobre o PDF",
      thumbnailUrl: "assets/img/pdf2-thumbnail.png",
    },
    {
      id: 3,
      title: "PDF 3",
      description: "Alguma descrição sobre o PDF",
      thumbnailUrl: "assets/img/pdf3-thumbnail.png",
    },
    {
      id: 4,
      title: "PDF 4",
      description: "Alguma descrição sobre o PDF",
      thumbnailUrl: "assets/img/pdf3-thumbnail.png",
    },
  ];

  constructor(private toastController: ToastController) {}

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  ngOnInit() {}

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
