// src/socket.io/sockets.ts
import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';

// Interfaces para tipado
interface ServiceData {
  userId: string;
  providerId: string;
}

interface LocationData {
  serviceId: string;
  lat: number;
  long: number;
}

// Configuración de Socket.IO
export const setupSocket = (server: HttpServer) => {
  const io = new Server(server, {
    cors: {
      origin: '*', // Permitir conexiones desde cualquier origen
      methods: ['GET', 'POST'],
    },
  });

  const activeServices = new Map<string, ServiceData>(); // serviceId -> { userId, providerId }
  const availableProviders = new Set<string>(); // IDs de proveedores disponibles

  io.on('connection', (socket: Socket) => {
    console.log(`Cliente conectado: ${socket.id}`);

    // Registro de proveedor
    socket.on('registerProvider', () => {
      availableProviders.add(socket.id);
      console.log(`✅ Proveedor registrado: ${socket.id}`);
    });

    // Cliente solicita un servicio
    socket.on('requestService', () => {
      const serviceId = `srv-${Date.now()}`; // ID único del servicio
      const userId = socket.id;
      const providerId = Array.from(availableProviders)[0]; // Primer proveedor disponible

      if (providerId) {
        console.log(`Saving service id: ${serviceId}, client id: ${userId}, provider id: ${providerId}`);
        activeServices.set(serviceId, { userId, providerId });

        // Enviar al proveedor la solicitud de tracking
        io.to(providerId).emit('startTracking', { serviceId });

        // Avisar al cliente que se aceptó el servicio
        io.to(userId).emit('serviceAccepted', { serviceId });
      } else {
        console.log('No hay proveedores disponibles');
      }
    });

    // Actualización de ubicación del proveedor
    socket.on('updateLocation', ({ serviceId, lat, long }: LocationData) => {
      const service = activeServices.get(serviceId);
      if (service) {
        console.log(`Sending new location user id: ${service.userId}, ${lat}, ${long}`);
        io.to(service.userId).emit('trackLocation', { lat, long });
      } else {
        console.log(`Servicio no encontrado: ${serviceId}`);
      }
    });

    // Finalización del tracking
    socket.on('endTracking', ({ serviceId }: { serviceId: string }) => {
      const service = activeServices.get(serviceId);
      if (service) {
        console.log(`Servicio ${serviceId} finalizado.`);
        io.to(service.userId).emit('providerArrived', { serviceId });
        activeServices.delete(serviceId);
      }
    });
  });

  return io; // Opcional, por si necesitas usar io fuera de esta función
};