import React, { createContext, useContext, useEffect, useState } from 'react';
import { Snackbar, Alert } from '@mui/material';

const WebSocketContext = createContext(null);

export function WebSocketProvider({ children, url }) {
  const [socket, setSocket] = useState(null);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');

  const handleClose = () => setOpen(false);

  useEffect(() => {
    const ws = new WebSocket(url);

    ws.onopen = () => {
      console.log('Connected to WebSocket');
    };

    ws.onmessage = (event) => {
      setMessage(event.data);
      setOpen(true);
    };

    ws.onclose = () => {
      console.log('Disconnected from WebSocket');
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [url]);

  return (
    <WebSocketContext.Provider value={socket}>
      {children}
      
      {/* MUI Snackbar for Notifications */}
      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="info">
          {message}
        </Alert>
      </Snackbar>
    </WebSocketContext.Provider>
  );
}

export const useWebSocket = () => useContext(WebSocketContext);
