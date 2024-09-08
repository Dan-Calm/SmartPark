// restaurar.page.ts
import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-restaurar',
  templateUrl: './restaurar.page.html',
  styleUrls: ['./restaurar.page.scss'],
})
export class RestaurarPage {

  email: string = '';

  constructor(
    private afAuth: AngularFireAuth,
    private toastCtrl: ToastController
  ) { }

  async resetPassword() {
    try {
      await this.afAuth.sendPasswordResetEmail(this.email);
      this.showToast('Correo de restauración de contraseña enviado. Revise su bandeja de entrada.');
    } catch (error) {
      this.showToast(error.message);
    }
  }

  async showToast(message: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 4000
    });
    toast.present();
  }

}
