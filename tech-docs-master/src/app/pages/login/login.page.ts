import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';

import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  authError: string = ''; // Error message for failed login
  validationUserMessage = {
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

  constructor(
    public formBuilder: FormBuilder,
    public authService: AuthService,
    public router: Router
  ) {}

  ngOnInit() {
    this.validationFormUser = this.formBuilder.group({
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

  LoginUser(value: { email: string; password: string }) {
    if (this.validationFormUser.invalid) {
      console.log('Formulário inválido');
      return;
    }

    this.authError = ''; // Reset error
    this.authService
      .loginFireAuth(value)
      .then((resp) => {
        console.log('Estou logado');
        console.log(resp);
        this.router.navigate(['tabs']);
      })
      .catch((err) => {
        console.log('Erro no login:', err);
        this.authError = 'Erro ao realizar login. Verifique suas credenciais.';
      });
  }
}
