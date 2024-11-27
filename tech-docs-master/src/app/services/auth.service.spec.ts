import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';

fdescribe('AuthService', () => {
  let service: AuthService;
  let mockAngularFireAuth: any;
  let mockAngularFirestore: any;

  beforeEach(() => {
    // Mock AngularFireAuth
    mockAngularFireAuth = {
      signInWithEmailAndPassword: jasmine.createSpy(),
      createUserWithEmailAndPassword: jasmine.createSpy(),
    };

    // Mock AngularFirestore
    mockAngularFirestore = {
      collection: jasmine.createSpy().and.returnValue({
        doc: jasmine.createSpy().and.returnValue({
          set: jasmine.createSpy().and.returnValue(Promise.resolve()),
        }),
      }),
    };

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: AngularFireAuth, useValue: mockAngularFireAuth },
        { provide: AngularFirestore, useValue: mockAngularFirestore },
      ],
    });

    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
    console.log('AuthService foi criado com sucesso.');
  });

  fdescribe('#loginFireAuth', () => {
    it('should resolve when login is successful', async () => {
      const loginData = { email: 'test@example.com', password: 'password123' };
      mockAngularFireAuth.signInWithEmailAndPassword.and.returnValue(Promise.resolve('Success'));

      const result = await service.loginFireAuth(loginData);
      expect(result).toBe('Success');
      expect(mockAngularFireAuth.signInWithEmailAndPassword).toHaveBeenCalledWith(
        loginData.email,
        loginData.password
      );
      console.log('Teste de login bem-sucedido para:', loginData.email);
    });

    it('should reject when login fails', async () => {
      const loginData = { email: 'test@example.com', password: 'wrongpassword' };
      mockAngularFireAuth.signInWithEmailAndPassword.and.returnValue(
        Promise.reject('Login Error')
      );

      try {
        await service.loginFireAuth(loginData);
        fail('Expected loginFireAuth to throw an error');
      } catch (error) {
        expect(error).toBe('Login Error');
        console.error('Erro esperado ao tentar login:', error);
      }
    });
  });

  fdescribe('#registerFireAuth', () => {
    it('should resolve when registration is successful', async () => {
      const registerData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        area: 'Tech',
      };

      const mockUser = { user: { uid: '12345' } };
      mockAngularFireAuth.createUserWithEmailAndPassword.and.returnValue(
        Promise.resolve(mockUser)
      );

      const result = await service.registerFireAuth(registerData);
      expect(result).toBe(mockUser);

      expect(mockAngularFireAuth.createUserWithEmailAndPassword).toHaveBeenCalledWith(
        registerData.email,
        registerData.password
      );
      expect(mockAngularFirestore.collection).toHaveBeenCalledWith('users');
      expect(mockAngularFirestore.collection('users').doc).toHaveBeenCalledWith('12345');
      console.log('Teste de registro bem-sucedido para:', registerData.email);
    });

    it('should reject when registration fails', async () => {
      const registerData = {
        email: 'test@example.com',
        password: 'weakpassword',
        name: 'Test User',
        area: 'Tech',
      };

      mockAngularFireAuth.createUserWithEmailAndPassword.and.returnValue(
        Promise.reject('Registration Error')
      );

      try {
        await service.registerFireAuth(registerData);
        fail('Expected registerFireAuth to throw an error');
      } catch (error) {
        expect(error).toBe('Registration Error');
        console.error('Erro esperado ao tentar registro:', error);
      }
    });
  });
});
