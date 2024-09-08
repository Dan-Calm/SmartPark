// pago-ticket.page.ts

import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { AlertController } from '@ionic/angular';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { PaypalService } from 'src/app/services/paypal.service'; // Asegúrate de importar PaypalService desde la ubicación correcta

@Component({
  selector: 'app-pago-ticket',
  templateUrl: './pago-ticket.page.html',
  styleUrls: ['./pago-ticket.page.scss'],
})
export class PagoTicketPage {
  tickets: Observable<any[]>;
  detallesTicket: any;
  userId: string | null = null;

  constructor(
    private firestore: AngularFirestore,
    private alertController: AlertController,
    private afAuth: AngularFireAuth,
    private paypalService: PaypalService // Asegúrate de incluir PaypalService en el constructor
  ) {}

  ngOnInit() {

    this.paypalService.initPaypalButton();
    
    // Obtener el ID de usuario actual
    this.afAuth.authState.subscribe((user) => {
      if (user) {
        this.userId = user.uid;
        // Llamar a la función para cargar los tickets pendientes de pago al inicializar la página
        this.mostrarTicketsPendientesPago();
      }
    });
  }

  mostrarTicketsPendientesPago() {
    // Verificar si se tiene el ID de usuario
    if (this.userId) {
      // Implementar lógica para cargar los tickets pendientes de pago desde Firestore
      this.tickets = this.firestore
        .collection('tickets', (ref) => ref.where('id_usuario', '==', this.userId).where('pago', '==', false))
        .valueChanges();
    }
  }

  async mostrarDetalle(ticket: any) {
    this.detallesTicket = ticket;

    const alert = await this.alertController.create({
      header: 'Detalles del Ticket',
      message: `
        Hora de Inicio: ${this.formatFecha(ticket.hora_inicio)}
        Hora de Fin: ${this.formatFecha(ticket.hora_final)}
        Patente: ${ticket.patente}
        Costo por Minuto: ${ticket.costo_por_minuto}
        Tiempo Usado: ${ticket.tiempo_usado} minutos
        Costo: ${ticket.costo} unidades monetarias
        Estacionamiento: ${ticket.numero_estacionamiento}
      `,
      buttons: ['OK'],
    });

    await alert.present();
  }

  formatFecha(timestamp: any) {
    // Convierte el Timestamp a un objeto de fecha de JavaScript
    const fecha = timestamp ? timestamp.toDate() : null;

    // Implementar lógica para formatear la fecha según tus necesidades
    return fecha ? fecha : 'Fecha inválida';
  }
}
