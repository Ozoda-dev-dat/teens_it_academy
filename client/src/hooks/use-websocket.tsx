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
  const reconnectTimeouts = useRef<number[]>([]);
  const reconnectCount = useRef(0);
  
  const getWebSocketUrl = () => {
    if (typeof window === 'undefined') return '';
    
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    
    let host = window.location.host;
    if (!host) {
      host = process.env.NODE_ENV === 'development' ? 'localhost:5000' : window.location.hostname + ':5000';
    }
    
    return `${protocol}//${host}/ws`;
  };
  
  const defaultUrl = url || getWebSocketUrl();

  const connect = useCallback(() => {
    try {
      if (ws.current?.readyState === WebSocket.OPEN) {
        return;
      }

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
        
      };
      
      ws.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('Received WebSocket message:', message);
          
          if (message.type === 'auth_required' || message.type === 'auth_confirmed') {
            console.log('WebSocket auth status:', message.type);
            return;
          }
          
          const notification: RealtimeNotification = message;
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
          
          reconnectTimeouts.current.push(timeout as any);
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

  useEffect(() => {
    connect();
    
    return () => {
      reconnectTimeouts.current.forEach(timeout => clearTimeout(timeout));
      reconnectTimeouts.current = [];
    
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [connect]);

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

export function useRealtimeUpdates() {
  const { lastMessage, isConnected } = useWebSocket();
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);

  useEffect(() => {
    if (lastMessage) {
      setNotifications(prev => {
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
