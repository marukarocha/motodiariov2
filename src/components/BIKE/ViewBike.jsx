import React, { useState, useEffect } from 'react';
import { Card, Button, Row, Col } from 'react-bootstrap';
import { useAuth } from '../USER/Auth/AuthContext';
import { getBikeData } from '../../lib/db/firebaseServices';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMotorcycle, faPlus } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

function ViewBike() {
    const { currentUser } = useAuth();
    const [bikeData, setBikeData] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBikeData = async () => {
            try {
                const data = await getBikeData(currentUser.uid);
                if (data) {
                    setBikeData(data);
                }
            } catch (error) {
                console.error("Erro ao buscar dados da moto:", error);
            } finally {
                setLoading(false);
            }
        };

        if (currentUser) {
            fetchBikeData();
        }
    }, [currentUser]);

    if (loading) {
        return <p>Carregando dados da moto...</p>;
    }

    return (
        <div className="container mt-5">
            {bikeData ? (
                <Card className="mb-4">
                    <Card.Body>
                        <Row>
                            <Col md={4} className="text-center">
                                <FontAwesomeIcon icon={faMotorcycle} size="6x" className="text-primary" />
                            </Col>
                            <Col md={8}>
                                <Card.Title>{bikeData.make} {bikeData.model}</Card.Title>
                                <Card.Subtitle className="mb-2 text-muted">{bikeData.year}</Card.Subtitle>
                                <Card.Text>
                                    <strong>Placa:</strong> {bikeData.plate}<br />
                                    <strong>Cor:</strong> {bikeData.color}<br />
                                    <strong>KM Inicial:</strong> {bikeData.initialMileage}<br />
                                    <strong>Próxima Troca de Óleo:</strong> {bikeData.oilChangeKm} km<br />
                                    <strong>Próxima Troca de Relação:</strong> {bikeData.relationChangeKm} km<br />
                                    <strong>Próxima Lubrificação:</strong> {bikeData.lubricationKm} km<br />
                                    <strong>Última Manutenção:</strong> {bikeData.lastMaintenance}<br />
                                    <strong>Capacidade do Tanque:</strong> {bikeData.tankVolume} L<br />
                                    <strong>Média de Consumo:</strong> {bikeData.averageConsumption} km/L
                                </Card.Text>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            ) : (
                <Card className="text-center">
                    <Card.Body>
                        <Card.Title>Nenhuma moto registrada</Card.Title>
                        <Card.Text>
                            Você ainda não registrou nenhuma moto.
                        </Card.Text>
                        <Button variant="primary" onClick={() => navigate('/register-bike')}>
                            <FontAwesomeIcon icon={faPlus} className="me-2" />
                            Registrar Moto
                        </Button>
                    </Card.Body>
                </Card>
            )}
        </div>
    );
}

export default ViewBike;
