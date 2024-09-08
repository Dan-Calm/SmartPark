// datos-auto.page.ts
import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ToastController, NavController } from '@ionic/angular';

@Component({
  selector: 'app-datos-auto',
  templateUrl: './datos-auto.page.html',
  styleUrls: ['./datos-auto.page.scss'],
})
export class DatosAutoPage {
  marca: string;
  modelo: string;
  ano: number;

  constructor(
    private firestore: AngularFirestore,
    private afAuth: AngularFireAuth,
    private toastCtrl: ToastController,
    private navCtrl: NavController
  ) {}

  ngOnInit() {
    this.cargarDatosAuto();
  }

  async cargarDatosAuto() {
    try {
      const user = await this.afAuth.currentUser;
      if (user) {
        const idCliente = user.uid;
        const patente = user['patente'] || ''; // Usando corchetes para acceder a la propiedad dinámicamente

        if (idCliente) {
          const autoData = await this.firestore
            .collection('autos', (ref) => ref.where('id_cliente', '==', idCliente).limit(1))
            .get()
            .toPromise();

          if (!autoData.empty) {
            const primerAuto: any = autoData.docs[0].data();
            this.marca = primerAuto.marca || '';
            this.modelo = primerAuto.modelo || '';
            this.ano = primerAuto.ano || null;
          }
        }
      }
    } catch (error) {
      console.error('Error al cargar datos del automóvil:', error);
    }
  }

  async guardarDatosAuto() {
    try {
      const user = await this.afAuth.currentUser;
      if (user) {
        const idCliente = user.uid;

        if (!idCliente || !this.marca || !this.modelo || !this.ano) {
          this.mostrarMensajeRojo('Completa todos los campos.');
          return;
        }

        // Modificado para obtener la patente desde Firestore
        const userData = await this.firestore.collection('users').doc(idCliente).get().toPromise();
        const patente = userData.get('patente');

        if (!patente) {
          this.mostrarMensajeRojo('Patente no encontrada. Verifica tu información de usuario.');
          return;
        }

        const autosRef = this.firestore.collection('autos', (ref) => ref.where('id_cliente', '==', idCliente));
        const autoExistente = await autosRef.get().toPromise();

        const autoData = {
          id_cliente: idCliente,
          patente: patente,
          marca: this.marca,
          modelo: this.modelo,
          ano: this.ano,
        };

        if (!autoExistente.empty) {
          // Si ya existe un registro, actualizamos los datos.
          const autoId = autoExistente.docs[0].id;
          await this.firestore.collection('autos').doc(autoId).update(autoData);
        } else {
          // Si no existe un registro, lo creamos.
          await this.firestore.collection('autos').add(autoData);
        }

        this.mostrarMensaje('Información del automóvil guardada exitosamente.');
      } else {
        this.mostrarMensajeRojo('Usuario no encontrado. Inicia sesión.');
      }
    } catch (error) {
      console.error('Error al guardar datos del automóvil:', error);
      this.mostrarMensajeRojo('Error al guardar los datos del automóvil.');
    }
  }

  async mostrarMensaje(mensaje: string) {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 3000,
      position: 'bottom',
      color: 'success',
    });
    toast.present();
  }

  async mostrarMensajeRojo(mensaje: string) {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 3000,
      position: 'bottom',
      color: 'danger',
    });
    toast.present();
  }
}
