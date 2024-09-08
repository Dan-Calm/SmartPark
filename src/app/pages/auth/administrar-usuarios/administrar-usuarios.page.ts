// administrar-usuarios.page.ts
import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ToastController, AlertController } from '@ionic/angular';

@Component({
  selector: 'app-administrar-usuarios',
  templateUrl: './administrar-usuarios.page.html',
  styleUrls: ['./administrar-usuarios.page.scss'],
})
export class AdministrarUsuariosPage implements OnInit {
  usuarios: any[];

  constructor(
    private firestore: AngularFirestore,
    private afAuth: AngularFireAuth,
    private toastCtrl: ToastController,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.obtenerUsuarios();
  }

  async obtenerUsuarios() {
    try {
      const snapshot = await this.firestore.collection('users').get().toPromise();
      this.usuarios = snapshot.docs.map((doc) => ({
        id: doc.id,
        email: doc.get('email'),
        tipo_usuario: doc.get('tipo_usuario'),
      }));
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
    }
  }

  async cambiarTipoUsuario(usuario: any) {
    try {
      const nuevoTipoUsuario = usuario.tipo_usuario === 1 ? 2 : 1;

      await this.firestore.collection('users').doc(usuario.id).update({
        tipo_usuario: nuevoTipoUsuario,
      });

      this.mostrarMensaje(
        `El tipo de usuario de ${usuario.email} ha sido actualizado a ${nuevoTipoUsuario === 1 ? 'Cliente' : 'Administrador'}`
      );

      // Actualizar la lista de usuarios
      this.obtenerUsuarios();
    } catch (error) {
      console.error('Error al cambiar el tipo de usuario:', error);
    }
  }

  async confirmarEliminacion(usuario: any) {
    const confirmAlert = await this.alertController.create({
      header: 'Confirmar Eliminación',
      message: `¿Está seguro de eliminar al usuario ${usuario.email}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.eliminarUsuario(usuario);
          },
        },
      ],
    });

    await confirmAlert.present();
  }

  async eliminarUsuario(usuario: any) {
    try {
      await this.firestore.collection('users').doc(usuario.id).delete();

      this.mostrarMensaje(`Usuario ${usuario.email} eliminado correctamente.`);

      // Actualizar la lista de usuarios
      this.obtenerUsuarios();
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
    }
  }

  async mostrarMensaje(mensaje: string) {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 3000,
      position: 'bottom',
      color: 'success', // Cambia el color según tus preferencias
    });
    toast.present();
  }
}
