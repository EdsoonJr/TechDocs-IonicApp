import { Component, Input } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { FolderService } from '../../services/folderservice.service';
import { Pdf } from '../../models/pdfs.model';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-add-to-folder',
  templateUrl: './add-to-folder.page.html',
  styleUrls: ['./add-to-folder.page.scss'],
})
export class AddToFolderPage {
  @Input() pdf!: Pdf; // PDF recebido
  folders: any[] = []; // Armazena as pastas do usuário

  constructor(
    private modalController: ModalController,
    private folderService: FolderService,
    private afAuth: AngularFireAuth, // Serviço para autenticação
    private alertController: AlertController // Serviço para exibir alertas
  ) {}

  ionViewWillEnter() {
    this.afAuth.authState.subscribe((user) => {
      if (user && user.uid) { // Certifique-se de que 'user.uid' está definido
        const userId: string = user.uid; // Agora temos certeza que 'userId' é string
        this.folderService.getFoldersByUser(userId).subscribe((folders) => {
          this.folders = folders;
        });
      } else {
        console.error('Usuário não autenticado ou UID não disponível.');
      }
    });
  }

  dismiss() {
    this.modalController.dismiss();
  }

  addPdfToFolder(folder: any) {
    if (this.pdf?.id) { // Certifica-se de que o id do PDF está definido
      this.folderService.addPdfToFolder(folder.id, this.pdf.id).then(() => {
        console.log('PDF adicionado à pasta:', folder.title);
        this.dismiss();
      }).catch((error) => {
        console.error('Erro ao adicionar PDF:', error);
      });
    } else {
      console.error('PDF inválido ou sem ID.');
    }
  }

  async createNewFolder() {
    const alert = await this.alertController.create({
      header: 'Criar nova pasta',
      inputs: [
        {
          name: 'folderName',
          type: 'text',
          placeholder: 'Nome da pasta'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Cancelado');
          }
        },
        {
          text: 'Criar',
          handler: async (data) => {
            const user = await this.afAuth.currentUser; // Obtém o usuário autenticado
            if (user) {
              const newFolder = {
                title: data.folderName,
                userId: user.uid, // Obtém o UID do usuário
                createdAt: new Date(),
                pdfs: [] // Inicializa com um array vazio para 'pdfs'
              };

              try {
                await this.folderService.createFolder(newFolder);
                console.log('Nova pasta criada:', newFolder.title);
                this.dismiss(); // Fecha o modal
              } catch (error) {
                console.error('Erro ao criar pasta:', error);
              }
            } else {
              console.error('Usuário não autenticado.');
            }
          }
        }
      ]
    });

    await alert.present();
  }
}
