// pages/administrador/administrador.page.ts

import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController, ToastController, LoadingController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-administrador',
  templateUrl: './administrador.page.html',
  styleUrls: ['./administrador.page.scss'],
})
export class AdministradorPage implements OnInit {
  estacionamientos: Observable<any[]>;
  costoForm: FormGroup;
  cantidadEstacionamientosForm: FormGroup;
  ultimoId: number;
  tipoUsuario: number | null = null;
  userId: string | null = null;
  costoPorMinuto: number = 0;
  estacionamientosDisponibles: number = 0;

  constructor(
    private firestore: AngularFirestore,
    private formBuilder: FormBuilder,
    private navCtrl: NavController,
    private afAuth: AngularFireAuth,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private route: ActivatedRoute
  ) {
    this.costoForm = this.formBuilder.group({
      costoPorMinuto: ['', Validators.required],
    });

    this.cantidadEstacionamientosForm = this.formBuilder.group({
      cantidadEstacionamientos: ['', Validators.required],
    });

    this.route.params.subscribe((params) => {
      this.getUserTypeFromFirestore();
    });

    // Obtener el ID de usuario actual
    this.afAuth.authState.subscribe((user) => {
      if (user) {
        this.userId = user.uid;
      }
    });
    

    // Obtener el costo por minuto
    this.firestore
      .collection('costo_minuto', (ref) => ref.orderBy('fecha_modificacion', 'desc').limit(1))
      .valueChanges()
      .subscribe((costoMinuto: any) => {
        this.costoPorMinuto = costoMinuto[0].costo_por_minuto;
      });

  }

  ngOnInit() {
    this.firestore
      .collection('estacionamiento', (ref) => ref.orderBy('numero_est', 'desc').limit(1))
      .snapshotChanges()
      .pipe(
        map((actions) => actions.map((a) => a.payload.doc.data() as any))
      )
      .subscribe((estacionamientos: any[]) => {
        this.ultimoId = estacionamientos.length > 0 ? estacionamientos[0].numero_est : 0;
      });
  }

  async getUserTypeFromFirestore() {
    try {
      // Obtén el ID del usuario actual desde Firebase Authentication
      const userId = '...'; // Reemplazar con la lógica para obtener el ID del usuario actual

      const user = await this.firestore.collection('users').doc(userId).get().toPromise();
      if (user.exists) {
        this.tipoUsuario = user.get('tipo_usuario');

        // Comprueba el tipo de usuario y redirige según sea necesario
        if (this.tipoUsuario === 1) {
          this.navCtrl.navigateRoot('/auth/disponibles');
        }
        // No hace falta una redirección para tipoUsuario === 2, ya que el acceso a esta página está permitido.
      } else {
        console.error('Usuario no encontrado en la base de datos.');
      }
    } catch (error) {
      console.error('Error al obtener el tipo de usuario:', error);
    }
  }

  async guardarCostoPorMinuto() {
    if (this.costoForm.valid) {
      const costoPorMinuto = this.costoForm.value.costoPorMinuto;

      if (costoPorMinuto > 0) {
        // Obtener la colección y convertir el Observable a una Promise
        const snapshot = await this.firestore.collection('costo_minuto').get().toPromise();

        if (snapshot.size > 0) {
          // Si hay documentos, actualizar el primer documento encontrado
          const documento = snapshot.docs[0];
          await documento.ref.update({
            costo_por_minuto: costoPorMinuto,
            fecha_modificacion: new Date(),
          });
          this.mostrarMensaje('Costo por minuto actualizado.');
          console.log('Costo por minuto actualizado:', costoPorMinuto);
        } else {
          // Si no hay documentos, crear uno nuevo en la colección
          const fechaCreacion = new Date();
          await this.firestore.collection('costo_minuto').add({
            costo_por_minuto: costoPorMinuto,
            fecha_creacion: fechaCreacion,
          });
          this.mostrarMensaje('Costo por minuto creado.');
          console.log('Costo por minuto creado:', costoPorMinuto);
        }
      } else {
        this.mostrarMensajeRojo('Se ha ingresado un valor inválido.');
      }

    }
  }

  async gestionarCantidadEstacionamientos() {
    if (this.cantidadEstacionamientosForm.valid) {
      const cantidadEstacionamientos = this.cantidadEstacionamientosForm.value.cantidadEstacionamientos;

      // Obtener la cantidad de estacionamientos existentes
      const estacionamientosExist = await this.firestore.collection('estacionamiento').get().toPromise();
      const cantidadEstacionamientosExist = estacionamientosExist.size;

      if (cantidadEstacionamientos > 0) {
        if (cantidadEstacionamientos < cantidadEstacionamientosExist) {
          // Eliminar estacionamientos adicionales
          const estacionamientosAEliminar = cantidadEstacionamientosExist - cantidadEstacionamientos;
          const estacionamientosSnapshot = await this.firestore
            .collection('estacionamiento', (ref) => ref.orderBy('numero_est', 'desc').limit(estacionamientosAEliminar))
            .get()
            .toPromise();

          const batchEliminar = this.firestore.firestore.batch();
          estacionamientosSnapshot.forEach((doc) => batchEliminar.delete(doc.ref));
          await batchEliminar.commit();

          console.log('Estacionamientos eliminados:', estacionamientosAEliminar);
          this.mostrarMensaje(`Se eliminaron ${estacionamientosAEliminar} estacionamientos.`);
        } else if (cantidadEstacionamientos > cantidadEstacionamientosExist) {
          // Crear documentos en la colección de estacionamientos
          const batchCrear = this.firestore.firestore.batch();

          for (let i = 1; i <= cantidadEstacionamientos - cantidadEstacionamientosExist; i++) {
            const nuevoEstacionamientoId = this.firestore.createId();
            const nuevoEstacionamientoRef = this.firestore.collection('estacionamiento').doc(nuevoEstacionamientoId);
            const nuevoEstacionamiento = {
              estado: true,
              fecha_creacion: new Date(),
              numero_est: this.ultimoId + i,
              id_campo: nuevoEstacionamientoId,
              patente: '', // Añadir el campo de patente
            };

            batchCrear.set(nuevoEstacionamientoRef.ref, nuevoEstacionamiento);
          }

          await batchCrear.commit();

          // Actualizar el último ID
          this.ultimoId += cantidadEstacionamientos - cantidadEstacionamientosExist;

          console.log('Estacionamientos creados:', cantidadEstacionamientos - cantidadEstacionamientosExist);
          this.mostrarMensaje(`Se agregaron ${cantidadEstacionamientos - cantidadEstacionamientosExist} estacionamientos.`);
        } else {
          console.log('No se necesitan cambios en la cantidad de estacionamientos.');
        }
      } else {
        this.mostrarMensajeRojo('Se ha ingresado un valor inválido.');
      }


    }
  }

  async agregarUnEstacionamiento() {
    if (this.formValidationEstacionamiento()) {
      let loader = await this.loadingCtrl.create({
        message: 'Espere Por Favor...',
      });
      await loader.present();

      try {
        // Generar un nuevo ID de estacionamiento automáticamente
        const estacionamientoId = this.firestore.createId();

        // Crear referencia al nuevo estacionamiento
        const nuevoEstacionamientoRef = this.firestore.collection('estacionamiento').doc(estacionamientoId);

        const nuevoEstacionamiento = {
          estado: true,
          fecha_creacion: new Date(),
          numero_est: this.ultimoId + 1,
          id_campo: estacionamientoId,
          patente: '', // Añadir el campo de patente
        };

        await nuevoEstacionamientoRef.set(nuevoEstacionamiento);

        // Actualizar el último ID
        this.ultimoId++;

        console.log('Estacionamiento agregado:', nuevoEstacionamiento);
        this.showToast('Estacionamiento agregado correctamente.');
      } catch (error) {
        console.error('Error al guardar en Firestore:', error);
        this.showToast(
          'Error al guardar el estacionamiento. Consulta la consola para obtener más detalles.'
        );
      }

      await loader.dismiss();
    }
  }

  formValidationEstacionamiento() {
    // Agrega aquí la lógica de validación del formulario de estacionamiento
    // Devuelve true si la validación es exitosa, de lo contrario, muestra un mensaje y devuelve false.
    // Puedes utilizar esto en la función agregarUnEstacionamiento para verificar la validación antes de realizar la operación.
    return true;
  }

  async eliminarUltimoEstacionamiento() {
    if (this.ultimoId > 0) {
      this.firestore
        .collection('estacionamiento', (ref) => ref.orderBy('numero_est', 'desc').limit(1))
        .get()
        .pipe(
          map((actions) => actions.docs.map((a) => a.data() as any))
        )
        .subscribe((ultimoEstacionamiento: any[]) => {
          if (ultimoEstacionamiento.length > 0) {
            const ultimoEstacionamientoId = ultimoEstacionamiento[0].id_campo;

            this.firestore.collection('estacionamiento').doc(ultimoEstacionamientoId).delete();

            // Actualizar el último ID
            this.ultimoId--;

            console.log('Último estacionamiento eliminado:', ultimoEstacionamientoId);
          }
        });
    }
  }

  async showToast(mensaje: string) {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 3000,
      position: 'bottom',
    });
    toast.present();
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

  async mostrarMensajeRojo(mensaje: string) {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 3000,
      position: 'bottom',
      color: 'danger', // Cambia el color según tus preferencias
    });
    toast.present();
  }

  async cerrarSesion() {
    try {
      await this.afAuth.signOut();
      this.navCtrl.navigateRoot('/auth');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }

  private calculaEstacionamientosDisponibles() {
    this.estacionamientos.subscribe((estacionamientos) => {
      this.estacionamientosDisponibles = estacionamientos.filter((est) => est.estado).length;
    });
  }

  
}
