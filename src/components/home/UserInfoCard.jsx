import React, { useState, useEffect } from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { useAuth } from '../USER/Auth/AuthContext';
import { getUserConfig, getBikeData } from '../../lib/db/firebaseServices';
import './CardWelcome.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMotorcycle } from '@fortawesome/free-solid-svg-icons';

const UserInfoCard = () => {
    const { currentUser } = useAuth();
    const [userName, setUserName] = useState('Visitante');
    const [bikeModel, setBikeModel] = useState('');
    const [currentDate, setCurrentDate] = useState("");
    const [currentTime, setCurrentTime] = useState("");

    useEffect(() => {
        const fetchUserData = async () => {
            if (currentUser) {
                try {
                    const userConfig = await getUserConfig(currentUser.uid);
                    if (userConfig && userConfig.name) {
                        setUserName(userConfig.name);
                    }
                    const bikeData = await getBikeData(currentUser.uid);
                    if (bikeData && bikeData.model) {
                        setBikeModel(bikeData.model);
                    }
                } catch (error) {
                    console.error("Erro ao buscar dados do usuário:", error);
                }
            }
        };

        fetchUserData();
    }, [currentUser]);

    useEffect(() => {
        const updateDateTime = () => {
            const now = new Date();
            setCurrentDate(now.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }));
            setCurrentTime(now.toLocaleTimeString("pt-BR"));
        };

        updateDateTime();
        const interval = setInterval(updateDateTime, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <Card className="  m-4 col-md-6 mb-4 card-user-info">
            <Card.Body>
                <Row className="align-items-center">
                    <Col xs={12} md={4} className="text-center mb-3 mb-md-0">
                        <FontAwesomeIcon icon={faMotorcycle} size="5x" className="text-primary" />
                    </Col>
                    <Col xs={12} md={8}>
                        <Card.Title className="welcome-title">Olá, <strong>{userName}</strong>!</Card.Title>
                        <Card.Subtitle className="mb-2 text-muted">Bem-vindo ao diário de moto {bikeModel && `com sua ${bikeModel}`}!</Card.Subtitle>
                        <p>
                            <strong>{currentDate}</strong> <strong>{currentTime}</strong>
                        </p>
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    );
};

export default UserInfoCard;
