import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";

import { AuthService } from "src/app/services/auth.service";
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { AlertController } from "@ionic/angular";

@Component({
  selector: "app-login",
  templateUrl: "./login.page.html",
  styleUrls: ["./login.page.scss"],
})
export class LoginPage implements OnInit {
  public alertButtons = [
    {
      text: "Cancelar",
    },
    {
      text: "Resetar",
      handler: (data: any) => {
        this.resetPassword(data.email);
      },
    },
  ];
  public alertInputs = [
    {
      name: "email",
      placeholder: "Email",
      type: "email",
    },
  ];

  authError: string = ""; // Error message for failed login
  validationUserMessage = {
    email: [
      { type: "required", message: "Por favor, insira seu email" },
      {
        type: "pattern",
        message: "O email inserido está incorreto. Tente novamente",
      },
    ],
    password: [
      { type: "required", message: "Por favor, insira sua senha" },
      { type: "minlength", message: "A senha deve ter no mínimo 5 caracteres" },
    ],
  };

  validationFormUser!: FormGroup;

  constructor(
    public formBuilder: FormBuilder,
    public authService: AuthService,
    public router: Router,
    private angularFireAuth: AngularFireAuth,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.validationFormUser = this.formBuilder.group({
      email: new FormControl(
        "",
        Validators.compose([
          Validators.required,
          Validators.pattern(
            "^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+$"
          ),
        ])
      ),
      password: new FormControl(
        "",
        Validators.compose([Validators.required, Validators.minLength(5)])
      ),
    });
  }

  LoginUser(value: { email: string; password: string }) {
    if (this.validationFormUser.invalid) {
      console.log("Formulário inválido");
      return;
    }

    this.authError = ""; // Reset error
    this.authService
      .loginFireAuth(value)
      .then((resp) => {
        console.log("Estou logado");
        console.log(resp);
        this.router.navigate(["tabs"]);
      })
      .catch((err) => {
        console.log("Erro no login:", err);
        this.authError = "Erro ao realizar login. Verifique suas credenciais.";
      });
  }

  async resetPassword(email: string) {
    if (!email || !this.isValidEmail(email)) {
      this.presentAlert("Por favor, insira um email válido.");
      return;
    }

    console.log("Resetando senha para o email:", email);

    try {
      // Usando a função AngularFireAuth para enviar o email de reset
      await this.angularFireAuth.sendPasswordResetEmail(email);
      this.presentAlert("Enviamos um email com um link para você resetar sua senha!");
    } catch (error) {
      console.error("Erro ao resetar senha:", error);
      // Tratando os erros com mensagens mais detalhadas
      this.presentAlert("Não foi possível enviar o email. Verifique o endereço de email.");
    }
  }

  isValidEmail(email: string): boolean {
    const emailPattern = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
    return emailPattern.test(email);
  }

  async presentAlert(msg: string) {
    const alert = await this.alertController.create({
      message: msg,
      buttons: ["OK"],
    });

    await alert.present();
  }
}
