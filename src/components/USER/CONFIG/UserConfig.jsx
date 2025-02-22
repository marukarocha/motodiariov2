import React, { useState, useEffect } from 'react';
import { Form, Button, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faPhoneAlt } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../Auth/AuthContext';
import { getUserConfig } from '../../../lib/db/firebaseServices'; // Importe a função

const UserConfig = ({ saveData }) => {
    const { currentUser } = useAuth();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');

    useEffect(() => {
        const fetchUserConfig = async () => {
            if (currentUser) {
                try {
                    const config = await getUserConfig(currentUser.uid);
                    if (config) {
                        setName(config.name || '');
                        setPhone(config.phone || '');
                    }
                } catch (error) {
                    console.error("Erro ao carregar configurações do usuário:", error);
                }
            }
        };

        fetchUserConfig();
    }, [currentUser]);

    const handleSave = () => {
        saveData({
            name,
            phone,
        });
    };

    return (
        <Card className="mb-4">
            <Card.Body>
                <Card.Title><FontAwesomeIcon icon={faUser} className="me-2" />Dados do Usuário</Card.Title>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Nome</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Nome"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label><FontAwesomeIcon icon={faPhoneAlt} className="me-2" />Telefone</Form.Label>
                        <Form.Control
                            type="tel"
                            placeholder="Telefone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </Form.Group>
                    <Button variant="primary" onClick={handleSave}>Salvar Dados</Button>
                </Form>
            </Card.Body>
        </Card>
    );
};

export default UserConfig;
