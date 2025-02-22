import React, { useState } from 'react';
import BackToHomeButton from './UI/BackToHomeButton';
import { Form, Button } from 'react-bootstrap';

const Collaborate = () => {
    const [feedback, setFeedback] = useState({
        name: '',
        email: '',
        message: '',
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFeedback({ ...feedback, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Feedback enviado:', feedback);
        // Aqui, você pode integrar o Firebase ou enviar um e-mail com os dados.
        setFeedback({
            name: '',
            email: '',
            message: '',
        });
    };

    return (
        <div className="collaborate-container">
            <BackToHomeButton />
            <h2>Colabore com o Aplicativo</h2>
            <Form onSubmit={handleSubmit} className="collaborate-form">
                <Form.Group controlId="name">
                    <Form.Label>Nome</Form.Label>
                    <Form.Control
                        type="text"
                        name="name"
                        value={feedback.name}
                        onChange={handleInputChange}
                        placeholder="Seu nome"
                        required
                    />
                </Form.Group>

                <Form.Group controlId="email" className="mt-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                        type="email"
                        name="email"
                        value={feedback.email}
                        onChange={handleInputChange}
                        placeholder="Seu email"
                        required
                    />
                </Form.Group>

                <Form.Group controlId="message" className="mt-3">
                    <Form.Label>Mensagem</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={4}
                        name="message"
                        value={feedback.message}
                        onChange={handleInputChange}
                        placeholder="Escreva sua ideia ou feedback"
                        required
                    />
                </Form.Group>

                <Button type="submit" variant="primary" className="mt-3">
                    Enviar Feedback
                </Button>
            </Form>
        </div>
    );
};

export default Collaborate;
