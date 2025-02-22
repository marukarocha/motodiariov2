import React, { useState, useRef } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { addFueling } from '../../lib/db/firebaseServices';
import { useAuth } from '../USER/Auth/AuthContext';
import { createRoot } from 'react-dom/client';
import { findDOMNode } from 'react-dom';

function RegisterFueling({ onClose }) {
    const { currentUser } = useAuth();
    const userId = currentUser ? currentUser.uid : null;
    const [data, setData] = useState({
        data: new Date().toLocaleDateString(),
        hora: new Date().toLocaleTimeString(),
        posto: '',
        combustivel: '',
        litros: '',
        valorLitro: '',
    });

    const postos = ['Posto A', 'Posto B', 'Posto C'];
    const combustiveis = ['Gasolina', 'Etanol', 'Diesel'];

    const handleChange = (e) => {
        setData({ ...data, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!data.posto || !data.combustivel || !data.litros || !data.valorLitro) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Preencha todos os campos!',
            });
            return;
        }

        try {
            await addFueling(userId, data);

            Swal.fire({
                title: 'Sucesso!',
                html: `Abastecimento registrado com sucesso. <br/> <a href="/listar-abastecimento">Ver lista de abastecimentos</a>`,
                icon: 'success',
                confirmButtonText: 'Fechar',
                timer: 2000, // Fecha automaticamente após 3 segundos
            }).then((result) => {
                if (result.isConfirmed) {
                    onClose();
                    setData({
                        data: new Date().toLocaleDateString(),
                        hora: new Date().toLocaleTimeString(),
                        posto: '',
                        combustivel: '',
                        litros: '',
                        valorLitro: '',
                    });
                }
            });
        } catch (error) {
            console.error('Erro ao registrar abastecimento:', error);
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Erro ao registrar o abastecimento!',
            });
        }
    };

    return (
        <Form onSubmit={handleSubmit}>
            <Row>
                <Col md={6}>
                    <Form.Group controlId="posto">
                        <Form.Label>Posto</Form.Label>
                        <Form.Control as="select" name="posto" value={data.posto} onChange={handleChange}>
                            <option value="">Selecione um posto</option>
                            {postos.map(posto => <option key={posto} value={posto}>{posto}</option>)}
                        </Form.Control>
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group controlId="combustivel">
                        <Form.Label>Combustível</Form.Label>
                        <Form.Control as="select" name="combustivel" value={data.combustivel} onChange={handleChange}>
                            <option value="">Selecione um combustível</option>
                            {combustiveis.map(combustivel => <option key={combustivel} value={combustivel}>{combustivel}</option>)}
                        </Form.Control>
                    </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col md={6}>
                    <Form.Group controlId="litros">
                        <Form.Label>Litros</Form.Label>
                        <Form.Control type="number" name="litros" value={data.litros} onChange={handleChange} placeholder="Litros" />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group controlId="valorLitro">
                        <Form.Label>Valor do Litro</Form.Label>
                        <Form.Control type="number" step="0.01" name="valorLitro" value={data.valorLitro} onChange={handleChange} placeholder="Valor do Litro" />
                    </Form.Group>
                </Col>
            </Row>
            <Button variant="primary" type="submit" className="w-100">
                Registrar
            </Button>
        </Form>
    );
}

export default RegisterFueling;
