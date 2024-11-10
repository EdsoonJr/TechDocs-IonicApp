import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  FormControl,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import {
  AlertController,
  LoadingController,
  NavController,
} from '@ionic/angular'; // Adicione o NavController aqui
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage implements OnInit {
  authError: string = ''; // Error message for failed login

  validationUserMessage = {
    name: [{ type: 'required', message: 'Por favor, insira seu nome' }],
    area: [
      { type: 'required', message: 'Por favor, insira a área de interesse' },
    ],
    email: [
      { type: 'required', message: 'Por favor, insira seu email' },
      {
        type: 'pattern',
        message: 'O email inserido está incorreto. Tente novamente',
      },
    ],
    password: [
      { type: 'required', message: 'Por favor, insira sua senha' },
      { type: 'minlength', message: 'A senha deve ter no mínimo 5 caracteres' },
    ],
  };

  validationFormUser!: FormGroup;
  loading: any;

  constructor(
    public formBuilder: FormBuilder,
    public authService: AuthService,
    public router: Router,
    public loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private navCtrl: NavController
  ) {}

  ngOnInit() {
    this.validationFormUser = this.formBuilder.group({
      name: new FormControl('', Validators.compose([Validators.required])),
      area: new FormControl('', Validators.compose([Validators.required])),
      email: new FormControl(
        '',
        Validators.compose([
          Validators.required,
          Validators.pattern(
            '^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+$'
          ),
        ])
      ),
      password: new FormControl(
        '',
        Validators.compose([Validators.required, Validators.minLength(5)])
      ),
    });
  }

  async RegisterUser(value: {
    name: string;
    area: string;
    email: string;
    password: string;
  }) {
    await this.showAlert(); // Exibe o carregamento
    this.authError = ''; // Reseta o erro

    this.authService
      .registerFireAuth(value)
      .then(
        async (resp) => {
          console.log('Registrado com sucesso');
          console.log(resp);

          const user = resp.user; // Obtém o objeto do usuário
          if (user) {
            await user
              .updateProfile({
                displayName: value.name,
                photoURL: '', // Opcionalmente, defina uma URL de foto
              })
              .then(() => {
                console.log('Perfil atualizado com sucesso');
              })
              .catch((error: any) => {
                console.error('Erro ao atualizar o perfil:', error);
              });
          }

          await this.loading?.dismiss(); // Finaliza o carregamento
          this.router.navigate(['log-in']);
        },
        async (error) => {
          await this.loading?.dismiss(); // Finaliza o carregamento
          this.errorLoading(error.message);
        }
      )
      .catch((err) => {
        console.log('Erro no cadastro:', err);
        this.authError = 'Erro ao realizar o cadastro.';
      });
  }

  async errorLoading(message: any) {
    const alert = await this.alertCtrl.create({
      header: 'Erro no cadastro',
      message: message,
      buttons: [
        {
          text: 'Ok',
          handler: () => {
            this.navCtrl.navigateBack(['sign-up']);
          },
        },
      ],
    });
    await alert.present();
  }

  async showAlert() {
    this.loading = await this.loadingCtrl.create({
      message: 'Um momento...',
    });
    await this.loading.present();
  }
}
