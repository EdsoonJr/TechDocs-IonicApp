import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(public auth: AngularFireAuth) {}

  loginFireAuth(value: { email: string; password: string }) {
    return new Promise<any>((resolve, reject) => {
      this.auth.signInWithEmailAndPassword(value.email, value.password).then(
        (res) => resolve(res),
        (error) => reject(error)
      );
    });
  }

  registerFireAuth(value: {
    email: string;
    password: string;
  }) {
    return new Promise<any>((resolve, reject) => {
      this.auth.createUserWithEmailAndPassword(value.email, value.password).then(
        (res) => resolve(res),
        (error) => reject(error)
      );
    });
  }
}
