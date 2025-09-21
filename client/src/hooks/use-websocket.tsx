import { useEffect, useState, useRef, useCallback } from 'react';
import type { RealtimeNotification } from '@shared/schema';

type WebSocketReadyState = typeof WebSocket.CONNECTING | typeof WebSocket.OPEN | typeof WebSocket.CLOSING | typeof WebSocket.CLOSED;

interface UseWebSocketOptions {
  shouldReconnect?: boolean;
  reconnectAttempts?: number;
  reconnectInterval?: number;
}

interface UseWebSocketReturn {
  lastMessage: RealtimeNotification | null;
  sendMessage: (message: any) => void;
  readyState: WebSocketReadyState;
  isConnected: boolean;
}

export function useWebSocket(
  url?: string,
  options: UseWebSocketOptions = {}
): UseWebSocketReturn {
  const {
    shouldReconnect = true,
    reconnectAttempts = 5,
    reconnectInterval = 3000,
  } = options;

  const [lastMessage, setLastMessage] = useState<RealtimeNotification | null>(null);
  const [readyState, setReadyState] = useState<WebSocketReadyState>(WebSocket.CONNECTING);
  
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeouts = useRef<NodeJS.Timeout[]>([]);
  const reconnectCount = useRef(0);
  
  const getWebSocketUrl = () => {
    // Handle cases where window.location might not be fully available
    if (typeof window === 'undefined') return '';
    
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host || 'localhost:5000';
    
    return `${protocol}//${host}/ws`;
  };
  
  const defaultUrl = url || getWebSocketUrl();

  const connect = useCallback(() => {
    try {
      if (ws.current?.readyState === WebSocket.OPEN) {
        return;
      }

      // Skip connection if URL is not available yet
      if (!defaultUrl || defaultUrl.includes('undefined')) {
        console.warn('WebSocket URL not ready yet, skipping connection');
        return;
      }

      console.log('Connecting to WebSocket:', defaultUrl);
      ws.current = new WebSocket(defaultUrl);
      
      ws.current.onopen = (event) => {
        console.log('WebSocket connected');
        setReadyState(WebSocket.OPEN);
        reconnectCount.current = 0;
        
        // Send authentication info if available
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        if (user && ws.current) {
          ws.current.send(JSON.stringify({
            type: 'authenticate',
            userId: user.id,
            role: user.role
          }));
        }
      };
      
      ws.current.onmessage = (event) => {
        try {
          const notification: RealtimeNotification = JSON.parse(event.data);
          console.log('Received WebSocket message:', notification);
          setLastMessage(notification);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      ws.current.onclose = (event) => {
        console.log('WebSocket connection closed:', event.code, event.reason);
        setReadyState(WebSocket.CLOSED);
        
        if (shouldReconnect && reconnectCount.current < reconnectAttempts) {
          const timeout = setTimeout(() => {
            reconnectCount.current++;
            console.log(`Attempting to reconnect... (${reconnectCount.current}/${reconnectAttempts})`);
            setReadyState(WebSocket.CONNECTING);
            connect();
          }, reconnectInterval);
          
          reconnectTimeouts.current.push(timeout);
        }
      };
      
      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setReadyState(WebSocket.CLOSED);
      };
      
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      setReadyState(WebSocket.CLOSED);
    }
  }, [defaultUrl, shouldReconnect, reconnectAttempts, reconnectInterval]);

  const sendMessage = useCallback((message: any) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      try {
        ws.current.send(JSON.stringify(message));
      } catch (error) {
        console.error('Error sending WebSocket message:', error);
      }
    } else {
      console.warn('WebSocket not connected. Message not sent:', message);
    }
  }, []);

  // Initialize connection
  useEffect(() => {
    connect();
    
    return () => {
      // Clear any pending reconnection timeouts
      reconnectTimeouts.current.forEach(timeout => clearTimeout(timeout));
      reconnectTimeouts.current = [];
      
      // Close WebSocket connection
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [connect]);

  // Update ready state when connection changes
  useEffect(() => {
    if (ws.current) {
      setReadyState(ws.current.readyState as WebSocketReadyState);
    }
  }, [ws.current?.readyState]);

  return {
    lastMessage,
    sendMessage,
    readyState,
    isConnected: readyState === WebSocket.OPEN,
  };
}

// Hook specifically for real-time data updates
export function useRealtimeUpdates() {
  const { lastMessage, isConnected } = useWebSocket();
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);

  useEffect(() => {
    if (lastMessage) {
      setNotifications(prev => {
        // Keep only the last 50 notifications to avoid memory issues
        const newNotifications = [lastMessage, ...prev].slice(0, 50);
        return newNotifications;
      });
    }
  }, [lastMessage]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    lastMessage,
    notifications,
    isConnected,
    clearNotifications,
  };
}
