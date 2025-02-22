import React, { useState } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { useAuth } from '../USER/Auth/AuthContext';
import { setDailyGoal } from '../../lib/db/firebaseServices'; // Crie esta função no firebaseServices
import Swal from 'sweetalert2';

function DailyGoalModal({ show, onClose }) {
    const { currentUser } = useAuth();
    const [dailyGoal, setDailyGoal] = useState('');

    const handleDailyGoalChange = (event) => {
        setDailyGoal(event.target.value);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            await setDailyGoal(currentUser.uid, parseFloat(dailyGoal));
            Swal.fire({
                icon: 'success',
                title: 'Meta Diária Definida!',
                text: 'Sua meta diária foi definida com sucesso.',
            });
            onClose();
        } catch (error) {
            console.error("Erro ao definir meta diária:", error);
            Swal.fire({
                icon: 'error',
                title: 'Erro!',
                text: 'Erro ao definir meta diária. Tente novamente.',
            });
        }
    };

    return (
        <Modal show={show} onHide={onClose}>
            <Modal.Header closeButton>
                <Modal.Title>Definir Meta Diária</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Meta Diária (R$):</Form.Label>
                        <Form.Control
                            type="number"
                            placeholder="Digite sua meta diária"
                            value={dailyGoal}
                            onChange={handleDailyGoalChange}
                            required
                        />
                    </Form.Group>
                    <Button variant="primary" type="submit">
                        Salvar Meta
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
}

export default DailyGoalModal;
