import { WebSocket } from 'ws';
import type { RealtimeNotification } from '@shared/schema';

interface ConnectedClient {
  socket: WebSocket;
  userId?: string;
  role?: string;
}

class NotificationService {
  private clients: Map<WebSocket, ConnectedClient> = new Map();
  
  constructor() {
    console.log('NotificationService initialized');
  }
  
  addClient(socket: WebSocket, userId?: string, role?: string) {
    const client: ConnectedClient = { socket, userId, role };
    this.clients.set(socket, client);
    
    console.log(`WebSocket client connected: userId=${userId}, role=${role}, total clients: ${this.clients.size}`);
    
    // Send welcome message
    this.sendToSocket(socket, {
      type: 'stats_updated' as const,
      data: { message: 'Connected to real-time updates' },
      timestamp: new Date().toISOString()
    });
    
    // Handle client disconnect
    socket.on('close', () => {
      this.clients.delete(socket);
      console.log(`WebSocket client disconnected: userId=${userId}, remaining clients: ${this.clients.size}`);
    });
    
    socket.on('error', (error) => {
      console.error('WebSocket error:', error);
      this.clients.delete(socket);
    });
  }
  
  removeClient(socket: WebSocket) {
    this.clients.delete(socket);
  }
  
  private sendToSocket(socket: WebSocket, notification: RealtimeNotification) {
    if (socket.readyState === WebSocket.OPEN) {
      try {
        socket.send(JSON.stringify(notification));
      } catch (error) {
        console.error('Error sending notification to client:', error);
        this.clients.delete(socket);
      }
    }
  }
  
  // Broadcast to all authenticated clients (sensitive notifications)
  broadcast(notification: RealtimeNotification) {
    console.log(`Broadcasting notification: ${notification.type} to authenticated clients`);
    
    // Only send sensitive notifications to authenticated clients
    const isSensitive = ['medal_awarded', 'user_created', 'payment_created', 'attendance_created'].includes(notification.type);
    
    Array.from(this.clients.entries()).forEach(([socket, client]) => {
      if (isSensitive && !client.userId) {
        // Skip unauthenticated clients for sensitive notifications
        return;
      }
      this.sendToSocket(socket, notification);
    });
  }
  
  // Broadcast to clients with specific role
  broadcastToRole(role: string, notification: RealtimeNotification) {
    console.log(`Broadcasting to ${role}: ${notification.type}`);
    
    Array.from(this.clients.entries()).forEach(([socket, client]) => {
      if (client.role === role || role === 'all') {
        this.sendToSocket(socket, notification);
      }
    });
  }
  
  // Broadcast to specific user
  broadcastToUser(userId: string, notification: RealtimeNotification) {
    console.log(`Broadcasting to user ${userId}: ${notification.type}`);
    
    Array.from(this.clients.entries()).forEach(([socket, client]) => {
      if (client.userId === userId) {
        this.sendToSocket(socket, notification);
      }
    });
  }
  
  getConnectedClients() {
    return Array.from(this.clients.values());
  }
  
  getClientCount() {
    return this.clients.size;
  }
}

export const notificationService = new NotificationService();
