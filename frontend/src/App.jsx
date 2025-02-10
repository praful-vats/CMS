import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ContractList from './contractList';
import ContractForm from './contractForm';
import { WebSocketProvider } from './WebSocketContext';
import { Snackbar, Alert } from '@mui/material';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:8000/ws';

const useSnackbar = () => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('info');

  const showSnackbar = ({ title, description, variant }) => {
    setMessage(description || title);
    setSeverity(variant === 'destructive' ? 'error' : 'success');
    setOpen(true);
  };

  const hideSnackbar = () => {
    setOpen(false);
  };

  return {
    open,
    message,
    severity,
    showSnackbar,
    hideSnackbar
  };
};

function App() {
  const { open, message, severity, hideSnackbar } = useSnackbar();
  return (
    <WebSocketProvider url={WS_URL}>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <nav className="bg-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex">
                  <div className="flex-shrink-0 flex items-center">
                    <h1 className="text-xl font-bold">Contract Management System</h1>
                  </div>
                </div>
              </div>
            </div>
          </nav>

          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <Routes>
              <Route path="/" element={<ContractList />} />
              <Route path="/new" element={<ContractForm />} />
              <Route path="/edit/:id" element={<ContractForm />} />
            </Routes>
          </main>
        </div>
        <Snackbar 
        open={open}
        autoHideDuration={6000}
        onClose={hideSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={hideSnackbar} severity={severity}>
          {message}
        </Alert>
      </Snackbar>
      </Router>
    </WebSocketProvider>
  );
}

export default App;