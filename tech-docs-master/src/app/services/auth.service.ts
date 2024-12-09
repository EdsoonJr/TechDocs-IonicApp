import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { User } from '../models/user.model'; // Importe o modelo

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(public auth: AngularFireAuth, private firestore: AngularFirestore) { }

  loginFireAuth(value: {
    email: string;
    password: string
  }) {
    return new Promise<any>((resolve, reject) => {
      this.auth.signInWithEmailAndPassword(value.email, value.password).then(
        (res) => resolve(res),
        (error) => reject(error)
      );
    });
  }

  registerFireAuth(value: {
    email: string;
    password: string,
    name: string,
    area: string
  }) {
    return new Promise<any>((resolve, reject) => {
      this.auth.createUserWithEmailAndPassword(value.email, value.password).then(
        async (res) => {
          const user: User = {
            uid: res.user?.uid || '',
            email: value.email,
            name: value.name,
            area: value.area,
            photoURL: '', // Opcional
          };
          await this.firestore.collection('users').doc(user.uid).set(user);
          resolve(res);
        },
        (error) => reject(error)
      );
    });
  }
}
