import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:8000/ws';

const ContractList = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    clientName: '',
    contractId: '',
  });
  const [pagination, setPagination] = useState({
    skip: 0,
    limit: 10,
    total: 0,
  });

  const handleDelete = async (contractId) => {
    try {
      const response = await fetch(`${API_URL}/contracts/${contractId}`, {
        method: 'DELETE',
      });
  
      if (!response.ok) {
        throw new Error('Failed to delete contract');
      }
  
      // Refresh the contracts list after successful deletion
      fetchContracts();
  
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSearch = () => {
    fetchContracts();
  };


  const fetchContracts = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        status: filters.status,
        clientName: filters.clientName,
        contractId: filters.contractId,
        skip: pagination.skip.toString(),
        limit: pagination.limit.toString()
      });

      const response = await fetch(`${API_URL}/contracts/?${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch contracts');

      const data = await response.json();
      setContracts(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError(err.message);
      setContracts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, [pagination.skip, pagination.limit]);

  return (

    <div>

      {loading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
      {!loading && !error && contracts && (
        <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Contracts</h2>
          <Link to="/new">
            <Button>New Contract</Button>
          </Link>
        </div>
  
        <div className="grid grid-cols-3 gap-4 mb-4">
        <TextField
          placeholder="Search by Client Name"
          value={filters.clientName}
          onChange={(e) => setFilters(prev => ({ ...prev, clientName: e.target.value }))}
          fullWidth
        />
        <TextField
          placeholder="Search by Contract ID"
          value={filters.contractId}
          onChange={(e) => setFilters(prev => ({ ...prev, contractId: e.target.value }))}
          fullWidth
        />
        <div className="flex gap-2">
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.status}
              label="Status"
              onChange={(e) => {
                setFilters(prev => ({ ...prev, status: e.target.value }));
                fetchContracts(); // Status changes trigger immediate search
              }}
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="DRAFT">Draft</MenuItem>
              <MenuItem value="FINALIZED">Finalized</MenuItem>
            </Select>
          </FormControl>
          <Button 
            variant="contained"
            onClick={handleSearch}
            sx={{ minWidth: '100px' }}
          >
            Search
          </Button>
        </div>
      </div>
  
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Contract ID</TableCell>
                <TableCell>Client Name</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {contracts.map((contract) => (
                <TableRow key={contract.id}>
                  <TableCell>{contract.contract_id}</TableCell>
                  <TableCell>{contract.client_name}</TableCell>
                  <TableCell>{contract.status}</TableCell>
                  <TableCell>
                    <Button
                      component={Link}
                      to={`/edit/${contract.contract_id}`}
                      variant="outlined"
                      sx={{ mr: 1 }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => handleDelete(contract.contract_id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
  
        <div className="flex justify-between items-center">
          <div>
            Showing {pagination.skip + 1} to {Math.min(pagination.skip + pagination.limit, pagination.total)} of {pagination.total} results
          </div>
          <div className="space-x-2">
            <Button
              disabled={pagination.skip === 0}
              onClick={() => setPagination(prev => ({ ...prev, skip: prev.skip - prev.limit }))}
            >
              Previous
            </Button>
            <Button
              disabled={pagination.skip + pagination.limit >= pagination.total}
              onClick={() => setPagination(prev => ({ ...prev, skip: prev.skip + prev.limit }))}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
      )}
    </div>
    
  );
};

export default ContractList;