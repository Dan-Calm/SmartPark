import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-admin-stats',
  templateUrl: './admin-stats.page.html',
  styleUrls: ['./admin-stats.page.scss'],
})
export class AdminStatsPage implements OnInit {
  // Variables para almacenar estadísticas
  dailyStats: any = {};
  monthlyStats: any = {};
  daysInMonth: number = 0; // Variable para almacenar la cantidad de días en el mes actual
  ticketsPerDay: any[] = []; // Variable para almacenar la cantidad de tickets creados por día


  // Variables para el gráfico de barras
  @ViewChild('barChart', { static: false }) barChart: ElementRef;
  private barChartRef;

  constructor(private firestore: AngularFirestore) {}

  ngOnInit() {
    this.loadDailyStats();
    this.loadMonthlyStats();
  }

  async loadDailyStats() {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    this.firestore
      .collection('tickets', (ref) => ref.where('hora_inicio', '>=', startOfDay).where('hora_inicio', '<', endOfDay))
      .get()
      .subscribe((querySnapshot) => {
        this.dailyStats.createdTickets = querySnapshot.size;

        // Calcular la suma de los costos y tiempo promedio
        let totalCost = 0;
        let totalTimeUsed = 0;

        querySnapshot.forEach((doc) => {
          const ticketData: any = doc.data(); // Especificar 'any' para evitar errores
          totalCost += ticketData.costo;
          totalTimeUsed += ticketData.tiempo_usado;
        });

        this.dailyStats.totalCost = totalCost;
        this.dailyStats.avgTimeUsed = querySnapshot.size > 0 ? totalTimeUsed / querySnapshot.size : 0;
      });
  }

  async loadMonthlyStats() {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  
    // Obtener la cantidad de días en el mes actual
    this.daysInMonth = today.getDate();
  
    // Inicializar el arreglo para almacenar la cantidad de tickets por día
    this.ticketsPerDay = new Array(this.daysInMonth).fill(0);
  
    this.firestore
      .collection('tickets', (ref) => ref.where('hora_inicio', '>=', startOfMonth).where('hora_inicio', '<=', endOfMonth))
      .get()
      .subscribe((querySnapshot) => {
        this.monthlyStats.createdTickets = querySnapshot.size;
  
        // Calcular la suma de los costos y tiempo promedio
        let totalCost = 0;
        let totalTimeUsed = 0;
  
        querySnapshot.forEach((doc) => {
          const ticketData: any = doc.data();
          totalCost += ticketData.costo;
          totalTimeUsed += ticketData.tiempo_usado;
  
          // Calcular el día en que se creó el ticket y aumentar el contador correspondiente
          const ticketDay = new Date(ticketData.hora_inicio).getDate();
          // Utilizar el día del mes actual para determinar la posición en el arreglo
          this.ticketsPerDay[ticketDay - 1]++;
        });
  
        this.monthlyStats.totalCost = totalCost;
        this.monthlyStats.avgTimeUsed = querySnapshot.size > 0 ? totalTimeUsed / querySnapshot.size : 0;
      });
  }
  

  // Método para actualizar la información
  async refreshStats() {
    this.loadDailyStats();
    this.loadMonthlyStats();
  }
}
