import React, { useState } from 'react';
import BackToHomeButton from './UI/BackToHomeButton';
import { Form, Button } from 'react-bootstrap';

const Maintenance = () => {
    const [formData, setFormData] = useState({
        date: '',
        oilChange: '',
        kmPerLiter: '',
        chainReplacement: '',
        notes: '',
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Dados de manutenção enviados:', formData);
        // Aqui, você pode integrar o Firebase para salvar os dados no Firestore.
        setFormData({
            date: '',
            oilChange: '',
            kmPerLiter: '',
            chainReplacement: '',
            notes: '',
        });
    };

    return (
        <div className="maintenance-container">
            <BackToHomeButton />
            <h2>Registro de Manutenção</h2>
            <Form onSubmit={handleSubmit} className="maintenance-form">
                <Form.Group controlId="date">
                    <Form.Label>Data</Form.Label>
                    <Form.Control
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        required
                    />
                </Form.Group>

                <Form.Group controlId="oilChange" className="mt-3">
                    <Form.Label>Troca de Óleo (Km)</Form.Label>
                    <Form.Control
                        type="number"
                        name="oilChange"
                        value={formData.oilChange}
                        onChange={handleInputChange}
                        placeholder="Ex: 5000"
                        required
                    />
                </Form.Group>

                <Form.Group controlId="kmPerLiter" className="mt-3">
                    <Form.Label>Km por Litro</Form.Label>
                    <Form.Control
                        type="number"
                        name="kmPerLiter"
                        value={formData.kmPerLiter}
                        onChange={handleInputChange}
                        placeholder="Ex: 25"
                    />
                </Form.Group>

                <Form.Group controlId="chainReplacement" className="mt-3">
                    <Form.Label>Troca da Relação (Km)</Form.Label>
                    <Form.Control
                        type="number"
                        name="chainReplacement"
                        value={formData.chainReplacement}
                        onChange={handleInputChange}
                        placeholder="Ex: 15000"
                    />
                </Form.Group>

                <Form.Group controlId="notes" className="mt-3">
                    <Form.Label>Notas</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        placeholder="Informações adicionais sobre a manutenção"
                    />
                </Form.Group>

                <Button type="submit" variant="primary" className="mt-3">
                    Salvar Manutenção
                </Button>
            </Form>
        </div>
    );
};

export default Maintenance;
