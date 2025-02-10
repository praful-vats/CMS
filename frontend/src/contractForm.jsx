import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TextField, Button, MenuItem, Select, FormControl, InputLabel, CircularProgress } from '@mui/material';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:8000/ws';

const ContractForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        contract_id: '',
        client_name: '',
        content: '',
        status: 'DRAFT'
    });

    useEffect(() => {
        if (id) {
            fetchContract();
        }
    }, [id]);

    const fetchContract = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/contracts/?contractId=${id}`);
            if (!response.ok) throw new Error('Failed to fetch contract');
            
            const data = await response.json();
            if (data && data.length > 0) {
                const contract = data[0];
                setFormData({
                    contract_id: contract.contract_id || '',
                    client_name: contract.client_name || '',
                    content: contract.content ? JSON.parse(contract.content) : '',
                    status: contract.status || 'DRAFT'
                });
            }
        } catch (error) {
            console.error('Error fetching contract:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const method = id ? 'PUT' : 'POST';
        const url = id ? `${API_URL}/contracts/${id}` : `${API_URL}/contracts/`;

        await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });

        navigate('/');
    };

    return (
        loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                <CircularProgress />
            </div>
        ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <TextField
                    fullWidth
                    label="Contract ID"
                    value={formData.contract_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, contract_id: e.target.value }))}
                    required
                    margin="normal"
                />
            </div>

            <div>
                <label>Client Name</label>
                <TextField
                    fullWidth
                    label="Client Name"
                    value={formData.client_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, client_name: e.target.value }))}
                    required
                    margin="normal"
                />
            </div>

            <div>
                <label>Content</label>
                <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Content"
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    required
                    margin="normal"
                />

            </div>

            <div>
                <label>Status</label>
                <FormControl fullWidth margin="normal">
                    <InputLabel>Status</InputLabel>
                    <Select
                        value={formData.status}
                        label="Status"
                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    >
                        <MenuItem value="DRAFT">Draft</MenuItem>
                        <MenuItem value="FINALIZED">Finalized</MenuItem>
                    </Select>
                </FormControl>
            </div>

            <Button
                variant="contained"
                type="submit"
                color="primary"
            >
                {id ? 'Update Contract' : 'Create Contract'}
            </Button>
        </form>
        )
    );
};

export default ContractForm;