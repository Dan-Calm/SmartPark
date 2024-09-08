// pages/admin-disponibles/admin-disponibles.page.ts

import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { NavController, ToastController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { AlertController } from '@ionic/angular';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-admin-disponibles',
  templateUrl: './admin-disponibles.page.html',
  styleUrls: ['./admin-disponibles.page.scss'],
})
export class AdminDisponiblesPage implements OnInit {
  estacionamientos: Observable<any[]>;
  userId: string | null = null;
  estacionamientosDisponibles: number = 0;
  costoPorMinuto: number = 0;
  nuevaPatente: string = '';

  constructor(
    private firestore: AngularFirestore,
    private alertController: AlertController,
    private toastCtrl: ToastController,
    private afAuth: AngularFireAuth,
    private navCtrl: NavController
  ) {
    // Obtener el costo por minuto
    this.firestore
      .collection('costo_minuto', (ref) => ref.orderBy('fecha_modificacion', 'desc').limit(1))
      .valueChanges()
      .subscribe((costoMinuto: any) => {
        this.costoPorMinuto = costoMinuto[0].costo_por_minuto;
      });
      
    // Inicializa y obtén los datos necesarios al cargar la página
    this.estacionamientos = this.firestore
      .collection('estacionamiento', (ref) => ref.orderBy('numero_est'))
      .valueChanges();

    this.calculaEstacionamientosDisponibles();

    // Obtener el ID de usuario actual
    this.afAuth.authState.subscribe((user) => {
      if (user) {
        this.userId = user.uid;
      }
    });
  }

  ngOnInit() { }

  async toggleUserState(estacionamiento: any) {
    const user = await this.afAuth.currentUser;

    // Obtener la patente ingresada manualmente
    const patenteIngresada = estacionamiento.nuevaPatente;

    const confirmAlert = await this.alertController.create({
      header: 'Confirmar Acción',
      message: estacionamiento.estado
        ? `¿Está seguro de arrendar el estacionamiento número ${estacionamiento.numero_est}?`
        : `¿Desea terminar el arriendo del estacionamiento número ${estacionamiento.numero_est}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: estacionamiento.estado ? 'ARRENDAR' : 'TERMINAR ARRIENDO',
          handler: async () => {
            if (estacionamiento.estado) {
              // Verificar si hay un ticket pendiente de pago
              const pendingTicketSnapshot = await this.firestore
                .collection('tickets', (ref) => ref.where('id_usuario', '==', user?.uid).where('pago', '==', false).limit(1))
                .get()
                .toPromise();

              if (pendingTicketSnapshot.docs.length > 0) {
                this.mostrarMensaje_rojo('Se debe pagar el ticket pendiente antes de arrendar otro estacionamiento.');
                console.log('Se debe pagar el ticket pendiente antes de arrendar otro estacionamiento.');
                return;
              }

              const userData = await this.firestore.collection('users').doc(user?.uid).get().toPromise();
              const patente = userData.get('patente');

              const activeTicket = await this.firestore
                .collection('tickets', (ref) => ref.where('patente', '==', patente).where('hora_final', '==', null).limit(1))
                .get()
                .toPromise();

              if (activeTicket.docs.length === 0) {
                // Obtener el ID de usuario
                const userId = user?.uid;

                const costoMinutoSnapshot = await this.firestore
                  .collection('costo_minuto', (ref) => ref.orderBy('fecha_creacion', 'desc').limit(1))
                  .get()
                  .toPromise();

                const costoPorMinuto = costoMinutoSnapshot.docs[0].get('costo_por_minuto');

                const ticketData = {
                  id_usuario: userId,
                  numero_estacionamiento: estacionamiento.numero_est,
                  hora_inicio: new Date(),
                  hora_final: null,
                  patente: patenteIngresada, // Utilizar la patente ingresada manualmente
                  tiempo_usado: 1,
                  costo: 0,
                  costo_por_minuto: costoPorMinuto,
                  pago: true,
                };

                const ticketRef = await this.firestore.collection('tickets').add(ticketData);
                const ticketId = ticketRef.id;

                console.log('Nuevo ticket creado:', ticketData);
                console.log('Ticket ID:', ticketId);

                // Actualizar el estado del estacionamiento y la información del usuario
                await Promise.all([
                  this.firestore.collection('estacionamiento').doc(estacionamiento.id_campo).update({
                    estado: false,
                    id_usuario: userId,
                    patente: patenteIngresada,
                    ticket_id: ticketId,
                  }),
                  this.firestore.collection('users').doc(user?.uid).update({
                    estado: false,
                  }),
                ]);

                // Limpiar la propiedad nuevaPatente después de utilizarla
                estacionamiento.nuevaPatente = '';

                // Guardar el ID del ticket en el campo 'ticket' de la colección 'users'
                await this.firestore.collection('users').doc(user?.uid).update({
                  ticket: ticketId,
                });

                this.mostrarMensaje(`Arriendo del estacionamiento iniciado.`);

                console.log('Estado del estacionamiento actualizado a false');
              } else {
                this.mostrarMensaje_rojo(`Ya tienes un ticket activo.`);
                console.log('Ya tienes un ticket activo.');
              }
            } else {
              if (this.userId !== estacionamiento.id_usuario) {
                this.mostrarMensaje_rojo(`No tienes permisos para terminar este ticket.`);
                console.log('No tienes permisos para terminar este ticket.');
                return;
              }

              // Verificar si el id_usuario del estacionamiento coincide con el uid del usuario actual
              if (this.userId === estacionamiento.id_usuario) {
                const patenteAntigua = estacionamiento.patente;

                await this.firestore.collection('estacionamiento').doc(estacionamiento.id_campo).update({
                  id_campo: estacionamiento.id_campo,
                  estado: true,
                  id_usuario: null, // Limpiar el id_usuario al habilitar el estacionamiento
                  patente: '', // Limpiar la patente al habilitar el estacionamiento
                });

                console.log('Campo id_campo habilitado para el estacionamiento:', estacionamiento.id_campo);

                /// Recuperar el ID del ticket desde el campo 'ticket_id' del estacionamiento
                const ticketId = estacionamiento.ticket_id;

                if (ticketId) {
                  const ticketRef = this.firestore.collection('tickets').doc(ticketId);
                  const ticket = await ticketRef.get().toPromise();

                  console.log('Datos del ticket antes de la actualización:', ticket.data());

                  const horaFinal = new Date();
                  await ticketRef.update({
                    hora_final: horaFinal,
                    pago: true,
                  });

                  const horaInicio = ticket.get('hora_inicio').toDate();
                  const tiempoUsado = Math.ceil((horaFinal.getTime() - horaInicio.getTime()) / (1000 * 60));

                  await ticketRef.update({
                    tiempo_usado: tiempoUsado,
                    costo: tiempoUsado * ticket.get('costo_por_minuto'),
                  });

                  this.mostrarMensaje(`Arriendo del estacionamiento terminado.`);

                  this.showTicketInfoAlert(ticket.data());

                  console.log('Ticket actualizado:', ticket.data());
                }

                // Actualizar la patente en el estacionamiento
                await this.firestore.collection('estacionamiento').doc(estacionamiento.id_campo).update({
                  patente: '', // Restaurar la patente original
                });
              } else {
                this.mostrarMensaje_rojo(`No puedes terminar un ticket que no iniciaste.`);
                console.log('No puedes terminar un ticket que no iniciaste.');
              }
            }
          },
        },
      ],
    });

    await confirmAlert.present();
  }

  private calculaEstacionamientosDisponibles() {
    // Calcula la cantidad de estacionamientos disponibles
    this.estacionamientos.subscribe((estacionamientos) => {
      this.estacionamientosDisponibles = estacionamientos.filter((est) => est.estado).length;
    });
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

  async mostrarMensaje_rojo(mensaje: string) {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 3000,
      position: 'bottom',
      color: 'danger', // Cambia el color según tus preferencias
    });
    toast.present();
  }

  async showTicketInfoAlert(ticketData: any) {
    const alert = await this.alertController.create({
      header: 'Información del Ticket',
      message: `
        >HORA DE INICIO: ${ticketData.hora_inicio} \n
        >HORA DE TERMINO: ${ticketData.hora_final} \n
        >PATENTE: ${ticketData.patente} \n
        >NUMERO DE ESTACIONAMIENTO: ${ticketData.numero_estacionamiento} \n
        >TIEMPO USADO: ${ticketData.tiempo_usado} minutos \n
        >COSTO: ${ticketData.costo} unidades monetarias \n
        >COSTO POR MINUTO: ${ticketData.costo_por_minuto}
      `,
      buttons: ['OK'],
    });

    await alert.present();
  }
}
