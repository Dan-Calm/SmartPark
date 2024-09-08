export interface User {
    uid?: string;
    email?: string;
    password?: string;
    name?: string;
    patente?: string;
    tipo_usuario?: number; // Agrega el nuevo campo tipo_usuario
    estado?: boolean;
    ticket?: string;
    fecha_creacion?: Date;
  }