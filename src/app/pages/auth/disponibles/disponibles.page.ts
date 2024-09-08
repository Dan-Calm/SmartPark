// pages/disponibles/disponibles.page.ts

import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { NavController, ToastController, LoadingController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { AlertController } from '@ionic/angular';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { formatDate } from '@angular/common';

import { PaypalService } from 'src/app/services/paypal.service';

@Component({
  selector: 'app-disponibles',
  templateUrl: './disponibles.page.html',
  styleUrls: ['./disponibles.page.scss'],
})
export class DisponiblesPage implements OnInit {
  estacionamientos: Observable<any[]>;
  userId: string | null = null;
  estacionamientosDisponibles: number = 0;
  costoPorMinuto: number = 0;

  constructor(
    private firestore: AngularFirestore,
    private alertController: AlertController,
    private paypalService: PaypalService,
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

    // Ordenar los estacionamientos por numero_est de menor a mayor
    this.estacionamientos = this.firestore
      .collection('estacionamiento', (ref) => ref.orderBy('numero_est'))
      .valueChanges();

    // Obtener el ID de usuario actual
    this.afAuth.authState.subscribe((user) => {
      if (user) {
        this.userId = user.uid;
      }
    });

    this.calculaEstacionamientosDisponibles();
  }

  ngOnInit() {}

  ngAfterViewInit() {
    this.paypalService.initPaypalButton();
  }

  async toggleUserState(estacionamiento: any) {
    const user = await this.afAuth.currentUser;

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
                  patente: patente,
                  tiempo_usado: 1,
                  costo: 0,
                  costo_por_minuto: costoPorMinuto,
                };

                const ticketRef = await this.firestore.collection('tickets').add(ticketData);
                const ticketId = ticketRef.id;

                console.log('Nuevo ticket creado:', ticketData);
                console.log('Ticket ID:', ticketId);

                // Guardar el ID del ticket en el campo 'ticket' de la colección 'users'
                await this.firestore.collection('users').doc(user?.uid).update({
                  ticket: ticketId,
                });

                this.mostrarMensaje(`Arriendo del estacionamiento iniciado.`);

                // Actualizar el estado del estacionamiento y la información del usuario
                await Promise.all([
                  this.firestore.collection('estacionamiento').doc(estacionamiento.id_campo).update({
                    estado: false,
                    id_usuario: userId,
                    patente: patente,
                  }),
                  this.firestore.collection('users').doc(user?.uid).update({
                    estado: false,
                  }),
                ]);

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

                // Recuperar el ID del ticket desde la colección 'users'
                const userDoc = await this.firestore.collection('users').doc(user?.uid).get().toPromise();
                const ticketId = userDoc.get('ticket');

                if (ticketId) {
                  const ticketRef = this.firestore.collection('tickets').doc(ticketId);
                  const ticket = await ticketRef.get().toPromise();

                  console.log('Datos del ticket antes de la actualización:', ticket.data());

                  const horaFinal = new Date();
                  await ticketRef.update({
                    hora_final: horaFinal,
                    pago : false,
                  });

                  const horaInicio = ticket.get('hora_inicio').toDate();
                  const tiempoUsado = Math.ceil((horaFinal.getTime() - horaInicio.getTime()) / (1000 * 60));

                  await ticketRef.update({
                    tiempo_usado: tiempoUsado,
                    costo: tiempoUsado * ticket.get('costo_por_minuto'),
                  });

                  const ticket2 = await ticketRef.get().toPromise();

                  this.mostrarMensaje(`Arriendo del estacionamiento terminado.`);
                  
                  this.showTicketInfoAlert(ticket.data(), ticket2.data());

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

  async showTicketInfoAlert(ticketData: any, ticketData2: any) {

    const alert = await this.alertController.create({
      header: 'Información del Ticket',
      message: `
      HORA DE INICIO: ${this.formatFecha(ticketData.hora_inicio)}

      HORA DE FIN: ${this.formatFecha(ticketData2.hora_final)}

      MINUTOS USADOS: ${ticketData2.tiempo_usado}
      PATENTE: ${ticketData.patente}
      COSTO: ${ticketData2.costo}
      N° ESTACIONAMIENTO: ${ticketData.numero_estacionamiento}
    `,
      buttons: ['OK'],
    });
  
    await alert.present();
  }

  formatFecha(timestamp: any) {
  // Convierte el Timestamp a un objeto de fecha de JavaScript
  const fecha = timestamp ? timestamp.toDate() : null;

  // Formatea la fecha en el formato dd/MM/yyyy HH:mm
  const formattedFecha = fecha ? formatDate(fecha, 'dd/MM/yyyy HH:mm', 'en-US') : 'Fecha inválida';

  return formattedFecha;
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

  async cerrarSesion() {
    try {
      await this.afAuth.signOut();
      this.navCtrl.navigateRoot('/auth');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }

  async historial() {
    try {
      this.navCtrl.navigateRoot('/auth/historial');
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async pago() {
    try {
      this.navCtrl.navigateRoot('/auth/pago-ticket');
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async datosAuto() {
    try {
      this.navCtrl.navigateRoot('/auth/datos-auto');
    } catch (error) {
      console.error('Error:', error);
    }
  }

  private calculaEstacionamientosDisponibles() {
    this.estacionamientos.subscribe((estacionamientos) => {
      this.estacionamientosDisponibles = estacionamientos.filter((est) => est.estado).length;
    });
  }
}
