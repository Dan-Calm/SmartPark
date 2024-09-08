import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { AlertController } from '@ionic/angular';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-historial',
  templateUrl: './historial.page.html',
  styleUrls: ['./historial.page.scss'],
})
export class HistorialPage implements OnInit {
  tickets: Observable<any[]>;
  detallesTicket: any;
  userId: string | null = null;

  constructor(private firestore: AngularFirestore, private alertController: AlertController, private afAuth: AngularFireAuth) {}

  ngOnInit() {
    // Obtener el ID de usuario actual
    this.afAuth.authState.subscribe((user) => {
      if (user) {
        this.userId = user.uid;

        // Llamar a la función para cargar el historial después de obtener el userId
        this.mostrarHistorial();
      }
    });
  }

  mostrarHistorial() {
    // Verificar si se tiene el ID de usuario
    if (this.userId) {
      // Implementa lógica para cargar el historial de tickets desde Firestore
      this.tickets = this.firestore
        .collection('tickets', (ref) => ref.where('id_usuario', '==', this.userId).orderBy('hora_inicio', 'desc'))
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

    // Implementa lógica para formatear la fecha según tus necesidades
    return fecha ? fecha : 'Fecha inválida';
  }
}
