// paypal.service.ts

import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FirebaseService } from './firebase.service';
import { QuerySnapshot } from '@angular/fire/compat/firestore';
import { AlertController } from '@ionic/angular';  // Asegúrate de importar AlertController

declare let paypal: any;

@Injectable({
  providedIn: 'root'
})
export class PaypalService {

  userId: string | null = null;

  constructor(
    private firestore: AngularFirestore,
    private firebaseService: FirebaseService,
    private alertController: AlertController  // Incluye AlertController en el constructor
  ) {}

  private async showAlert(message: string): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Error',
      message: message,
      buttons: ['OK']
    });

    await alert.present();
  }

  private loadPaypalScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://www.paypal.com/sdk/js?client-id=AXb_JNYxX2daJvLLec3qzscp6eEWCYNsxrlMnf4cbbn8fHNh78G1OVFTx0vXHJXu0Bg_lqOeGrjCrvVF';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Error al cargar el script de PayPal'));
      document.body.appendChild(script);
    });
  }

  initPaypalButton(): Promise<void> {
    return this.loadPaypalScript().then(() => {
      const paypalContainer = document.getElementById('paypal-button-container');
      if (!paypalContainer) {
        console.error('Elemento #paypal-button-container no encontrado.');
        return;
      }
  
      paypal.Buttons({
        createOrder: async (data: any, actions: any) => {
          const userDetails = await this.firebaseService.auth.currentUser;
          const userId = userDetails?.uid;
  
          // Buscar el último ticket no pagado del usuario actual
          const lastUnpaidTicketData = await this.findCosto(userId);
  
          // Obtener el costo del ticket
          const costoDelTicket = lastUnpaidTicketData?.costo || '1.00';
  
          // Crear la orden con el costo del ticket
          return actions.order.create({
            purchase_units: [{
              amount: {
                value: (costoDelTicket * 0.0011)
              }
            }]
          });
        },
        onApprove: async (data: any, actions: any) => {
          const userDetails = await this.firebaseService.auth.currentUser;
          const userId = userDetails?.uid;
  
          return actions.order.capture().then(async (details: any) => {
            console.log(details);
            console.log('Usuario actual UID:', userId);
  
            // Buscar el último ticket no pagado del usuario actual
            await this.findLastUnpaidTicket(userId);
          });
        }
      }).render(paypalContainer);
    }).catch(async (error) => {
      console.error('Error durante la inicialización del botón de PayPal:', error);
      await this.showAlert('Error durante la inicialización del botón de PayPal');
    });
  }

  private async findLastUnpaidTicket(userId: string | undefined): Promise<any | null> {
    if (!userId) {
      console.error('ID de usuario no válido.');
      return null;
    }
  
    try {
      const ticketsSnapshot = await this.firebaseService.firestore
        .collection('tickets', (ref) => ref.where('id_usuario', '==', userId).orderBy('hora_inicio', 'desc').limit(1))
        .get()
        .toPromise();
  
      if (!ticketsSnapshot.empty) {
        const lastUnpaidTicketDoc = ticketsSnapshot.docs[0];
        const lastUnpaidTicketData = lastUnpaidTicketDoc.data();
  
        // Imprimir información por consola
        console.log('Último ticket no pagado:', lastUnpaidTicketData);
  
        // Actualizar el campo "pago" a true
        await lastUnpaidTicketDoc.ref.update({ pago: true });
        console.log('Campo "pago" actualizado a true.');
  
        // Buscar el documento del usuario en la colección 'users'
        const userDoc = await this.firebaseService.firestore.collection('users').doc(userId).get().toPromise();
  
        if (userDoc.exists) {
          // Actualizar el campo 'estado' a true
          await userDoc.ref.update({ estado: true });
          await userDoc.ref.update({ ticket: '' });
          console.log('Campo "estado" del usuario actualizado a true.');
        } else {
          console.log('No se encontró el documento del usuario en la colección "users".');
        }
  
        // Devolver los datos del ticket
        return lastUnpaidTicketData;
      } else {
        console.log('No se encontraron tickets no pagados para este usuario.');
        return null;
      }
    } catch (error) {
      console.error('Error al buscar el último ticket no pagado:', error);
      return null;
    }
  }

private async findCosto(userId: string | undefined): Promise<any | null> {
  if (!userId) {
    console.error('ID de usuario no válido.');
    return null;
  }

  try {
    const ticketsSnapshot = await this.firebaseService.firestore
      .collection('tickets', (ref) => ref.where('id_usuario', '==', userId).orderBy('hora_inicio', 'desc').limit(1))
      .get()
      .toPromise();

    if (!ticketsSnapshot.empty) {
      const lastUnpaidTicketDoc = ticketsSnapshot.docs[0];
      const lastUnpaidTicketData = lastUnpaidTicketDoc.data();

      // Imprimir información por consola
      console.log('Último ticket no pagado:', lastUnpaidTicketData);


      // Devolver los datos del ticket
      return lastUnpaidTicketData;
    } else {
      console.log('No se encontraron tickets no pagados para este usuario.');
      return null;
    }
  } catch (error) {
    console.error('Error al buscar el último ticket no pagado:', error);
    return null;
  }
}


}
