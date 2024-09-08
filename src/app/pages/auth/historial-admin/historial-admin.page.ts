// historial-admin.page.ts
import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-historial-admin',
  templateUrl: './historial-admin.page.html',
  styleUrls: ['./historial-admin.page.scss'],
})
export class HistorialAdminPage {
  tickets: Observable<any[]>;
  detallesTicket: any;

  constructor(private firestore: AngularFirestore, private alertController: AlertController) {}

  ngOnInit() {
    // Llamar a la función para cargar el historial admin
    this.mostrarHistorialAdmin();
  }

  mostrarHistorialAdmin() {
    // Implementa lógica para cargar el historial de todos los tickets desde Firestore
    this.tickets = this.firestore
      .collection('tickets', (ref) => ref.orderBy('hora_inicio', 'desc'))
      .valueChanges();
  }

  formatFecha(timestamp: any) {
    const fecha = timestamp ? timestamp.toDate() : null;
    return fecha ? fecha : 'Fecha inválida';
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
}
