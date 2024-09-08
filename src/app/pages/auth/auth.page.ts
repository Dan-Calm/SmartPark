import { Component } from '@angular/core';
import { AlertController, LoadingController, NavController, ToastController } from '@ionic/angular';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { User } from "../../models/user.model";
import { switchMap, map } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage {

  User = {} as User;

  constructor(
    private alertController: AlertController,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private navCtrl: NavController,
  ) {}


  async login(user: User) {
    if (this.formValidation()) {
      let loader = await this.loadingCtrl.create({
        message: "Espere Por Favor..."
      });
      await loader.present();

      try {
        const data = await this.afAuth.signInWithEmailAndPassword(user.email, user.password);
    
        if (data && data.user) {
          const userDoc = await this.afs.collection('users').doc<User>(data.user.uid).get().toPromise();
    
          if (userDoc.exists) {
            // Actualiza el objeto User con el atributo tipo_usuario
            this.User = { ...userDoc.data(), ...data.user } as User;

            if (this.User.tipo_usuario === 1) {
              this.navCtrl.navigateRoot("/auth/disponibles"); // Redirige a la página 'disponibles'
            } else if (this.User.tipo_usuario === 2) {
              this.navCtrl.navigateRoot("/auth/administrador"); // Redirige a la página 'administrador'
            } else {
              this.showToast("Tipo de usuario no reconocido");
            }
          } else {
            throw new Error("Usuario no encontrado en Firestore");
          }
        } else {
          throw new Error("Datos de usuario no disponibles");
        }
      } catch (e: any) {
        let errorMessage = e.message || "Error al iniciar sesión";
        this.showToast(errorMessage);
      } finally {
        await loader.dismiss();
      }
    }
  }

  formValidation() {
    if (!this.User.email || !this.User.password) {
      this.showToast("Ingrese email y contraseña");
      return false;
    }
    return true;
  }

  showToast(message: string) {
    this.toastCtrl.create({
      message: message,
      duration: 4000
    }).then(toastData => toastData.present());
  }
}
