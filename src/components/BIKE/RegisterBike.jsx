import React, { useState, useEffect } from 'react';
import { Form, Button, Alert, Row, Col, Card, Nav } from 'react-bootstrap';
import { useAuth } from '../USER/Auth/AuthContext';
import { registerBike, getBikeData } from '../../lib/db/firebaseServices';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMotorcycle, faCarSide, faTachometerAlt, faCalendarAlt, faPalette, faPlus, faOilCan, faWrench, faGasPump, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import Cleave from 'cleave.js/react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

import './RegisterBike.css'; // Importe o arquivo CSS

function RegisterBike() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [bikeData, setBikeData] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [activePill, setActivePill] = useState('info');
    const [isAutomaticConsumption, setIsAutomaticConsumption] = useState(true);

    // Informações da Moto
    const [make, setMake] = useState('');
    const [model, setModel] = useState('');
    const [year, setYear] = useState('');
    const [plate, setPlate] = useState('');
    const [color, setColor] = useState('');
    const [initialMileage, setInitialMileage] = useState('');

    // Manutenção
    const [oilChangeInterval, setOilChangeInterval] = useState(3000);
    const [relationChangeKm, setRelationChangeKm] = useState('');
    const [oilChangeKm, setOilChangeKm] = useState('');
    const [lubricationKm, setLubricationKm] = useState('');
    const [lastMaintenance, setLastMaintenance] = useState('');

    // Abastecimento
    const [tankVolume, setTankVolume] = useState('');
    const [averageConsumption, setAverageConsumption] = useState('');

    // Dados para os selects (podem vir de um banco de dados posteriormente)
    const [models, setModels] = useState(['Modelo 1', 'Modelo 2', 'Modelo 3']);
    const [colors, setColors] = useState(['Preto', 'Branco', 'Vermelho', 'Azul']);
    const [years, setYears] = useState(['2023', '2022', '2021', '2020']);

    useEffect(() => {
        const fetchBikeData = async () => {
            try {
                const data = await getBikeData(currentUser.uid);
                if (data) {
                    setBikeData(data);
                    // Preenche os campos com os dados existentes
                    setMake(data.make || '');
                    setModel(data.model || '');
                    setYear(data.year || '');
                    setPlate(data.plate || '');
                    setColor(data.color || '');
                    setInitialMileage(data.initialMileage || '');
                    setOilChangeInterval(data.oilChangeInterval || 3000);
                    setRelationChangeKm(data.relationChangeKm || '');
                    setOilChangeKm(data.oilChangeKm || '');
                    setLubricationKm(data.lubricationKm || '');
                    setLastMaintenance(data.lastMaintenance || '');
                    setTankVolume(data.tankVolume || '');
                    setAverageConsumption(data.averageConsumption || '');
                    setIsAutomaticConsumption(data.averageConsumption ? false : true);
                }
            } catch (error) {
                console.error("Erro ao buscar dados da moto:", error);
            }
        };

        fetchBikeData();
    }, [currentUser]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setSuccess(false);

        const bike = {
            make,
            model,
            year: parseInt(year),
            plate,
            color,
            initialMileage: parseFloat(initialMileage),
            oilChangeInterval: parseInt(oilChangeInterval),
            relationChangeKm: parseFloat(relationChangeKm),
            oilChangeKm: parseFloat(oilChangeKm),
            lubricationKm: parseFloat(lubricationKm),
            lastMaintenance,
            tankVolume: parseFloat(tankVolume),
            averageConsumption: isAutomaticConsumption ? null : parseFloat(averageConsumption),
        };

        try {
            await registerBike(currentUser.uid, bike);
            setSuccess(true);
            setBikeData(bike);

            Swal.fire({
                icon: 'success',
                title: 'Dados da moto registrados com sucesso!',
                showConfirmButton: false,
                timer: 1500
            });
        } catch (error) {
            setError('Erro ao registrar os dados da moto. Tente novamente.');
            console.error("Erro ao registrar moto:", error);
        }
    };

    return (
        <div className="container mt-5">
            <Card className="mb-4">
                <Card.Body>
                    <Row>
                        <Col md={4} className="text-center">
                            <FontAwesomeIcon icon={faMotorcycle} size="6x" className="text-primary" />
                        </Col>
                        <Col md={8}>
                            <Card.Title>{make} {model}</Card.Title>
                            <Card.Subtitle className="mb-2 text-muted">{year}</Card.Subtitle>
                            <Card.Text>
                                <strong>Placa:</strong> {plate}<br />
                                <strong>Cor:</strong> {color}<br />
                                <strong>KM Inicial:</strong> {initialMileage}
                            </Card.Text>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {error && <Alert variant="danger">{error}</Alert>}

            <Nav variant="pills" activeKey={activePill} onSelect={setActivePill} className="mb-3 justify-content-center">
                <Nav.Item>
                    <Nav.Link eventKey="info" className="pill-link">
                        <FontAwesomeIcon icon={faCarSide} className="me-2" />
                        Informações da Moto
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey="maintenance" className="pill-link">
                        <FontAwesomeIcon icon={faWrench} className="me-2" />
                        Manutenção
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey="fuel" className="pill-link">
                        <FontAwesomeIcon icon={faGasPump} className="me-2" />
                        Abastecimento
                    </Nav.Link>
                </Nav.Item>
            </Nav>

            <Form onSubmit={handleSubmit}>
                {activePill === 'info' && (
                    <div className="config-section mb-5">
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Marca:</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Digite a marca da moto"
                                        value={make}
                                        onChange={(e) => setMake(e.target.value)}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Modelo:</Form.Label>
                                    <Form.Select
                                        value={model}
                                        onChange={(e) => setModel(e.target.value)}
                                        required
                                    >
                                        <option value="">Selecione o modelo</option>
                                        {models.map((modelOption) => (
                                            <option key={modelOption} value={modelOption}>
                                                {modelOption}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Ano:</Form.Label>
                                    <Form.Select
                                        value={year}
                                        onChange={(e) => setYear(e.target.value)}
                                        required
                                    >
                                        <option value="">Selecione o ano</option>
                                        {years.map((yearOption) => (
                                            <option key={yearOption} value={yearOption}>
                                                {yearOption}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Placa:</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Digite a placa da moto"
                                        value={plate}
                                        onChange={(e) => setPlate(e.target.value)}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Cor:</Form.Label>
                                    <Form.Select
                                        value={color}
                                        onChange={(e) => setColor(e.target.value)}
                                        required
                                    >
                                        <option value="">Selecione a cor</option>
                                        {colors.map((colorOption) => (
                                            <option key={colorOption} value={colorOption}>
                                                {colorOption}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Quilometragem Inicial (km):</Form.Label>
                                    <Cleave
                                        options={{
                                            numeral: true,
                                            numeralThousandsGroupStyle: 'thousand',
                                            numeralDecimalScale: 0,
                                            delimiter: '.',
                                            numeralPositiveOnly: true,
                                        }}
                                        placeholder="Digite a quilometragem inicial"
                                        value={initialMileage}
                                        onChange={(e) => setInitialMileage(e.target.rawValue)}
                                        className="form-control"
                                        required
                                    />
                                    <Form.Text className="text-muted info-text">
                                        <FontAwesomeIcon icon={faInfoCircle} className="me-1" />
                                        Informe a quilometragem inicial da sua moto.
                                    </Form.Text>
                                </Form.Group>
                            </Col>
                        </Row>
                    </div>
                )}

                {activePill === 'maintenance' && (
                    <div className="config-section mb-5">
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Troca da Relação (km):</Form.Label>
                                    <Cleave
                                        options={{
                                            numeral: true,
                                            numeralThousandsGroupStyle: 'thousand',
                                            numeralDecimalScale: 0,
                                            delimiter: '.',
                                            numeralPositiveOnly: true,
                                        }}
                                        placeholder="Digite a quilometragem da troca da relação"
                                        value={relationChangeKm}
                                        onChange={(e) => setRelationChangeKm(e.target.rawValue)}
                                        className="form-control"
                                    />
                                    <Form.Text className="text-muted info-text">
                                        <FontAwesomeIcon icon={faInfoCircle} className="me-1" />
                                        Recomendação: Trocar a cada 20.000 km.
                                    </Form.Text>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Troca de Óleo (km):</Form.Label>
                                    <Cleave
                                        options={{
                                            numeral: true,
                                            numeralThousandsGroupStyle: 'thousand',
                                            numeralDecimalScale: 0,
                                            delimiter: '.',
                                            numeralPositiveOnly: true,
                                        }}
                                        placeholder="Digite a quilometragem da troca de óleo"
                                        value={oilChangeKm}
                                        onChange={(e) => setOilChangeKm(e.target.rawValue)}
                                        className="form-control"
                                    />
                                    <Form.Text className="text-muted info-text">
                                        <FontAwesomeIcon icon={faInfoCircle} className="me-1" />
                                        Recomendação: Trocar a cada {oilChangeInterval} km.
                                    </Form.Text>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Lubrificação da Relação (km):</Form.Label>
                                    <Cleave
                                        options={{
                                            numeral: true,
                                            numeralThousandsGroupStyle: 'thousand',
                                            numeralDecimalScale: 0,
                                            delimiter: '.',
                                            numeralPositiveOnly: true,
                                        }}
                                        placeholder="Digite a quilometragem da lubrificação da relação"
                                        value={lubricationKm}
                                        onChange={(e) => setLubricationKm(e.target.rawValue)}
                                        className="form-control"
                                    />
                                    <Form.Text className="text-muted info-text">
                                        <FontAwesomeIcon icon={faInfoCircle} className="me-1" />
                                        Recomendação: Lubrificar a cada 500 km.
                                    </Form.Text>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Última Manutenção:</Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={lastMaintenance}
                                        onChange={(e) => setLastMaintenance(e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </div>
                )}

                {activePill === 'fuel' && (
                    <div className="config-section mb-5">
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Capacidade do Tanque (litros):</Form.Label>
                                    <Cleave
                                        options={{
                                            numeral: true,
                                            numeralDecimalScale: 2,
                                            delimiter: '.',
                                            numeralPositiveOnly: true,
                                        }}
                                        placeholder="Digite a capacidade do tanque"
                                        value={tankVolume}
                                        onChange={(e) => setTankVolume(e.target.rawValue)}
                                        className="form-control"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Média de Consumo (km/l):</Form.Label>
                                    <div className="d-flex">
                                        <Form.Check
                                            type="checkbox"
                                            id="automaticConsumption"
                                            label="Automático"
                                            checked={isAutomaticConsumption}
                                            onChange={() => setIsAutomaticConsumption(!isAutomaticConsumption)}
                                            className="me-3"
                                        />
                                        <Cleave
                                            options={{
                                                numeral: true,
                                                numeralDecimalScale: 2,
                                                delimiter: '.',
                                                numeralPositiveOnly: true,
                                            }}
                                            placeholder="Média de consumo"
                                            value={averageConsumption}
                                            onChange={(e) => setAverageConsumption(e.target.rawValue)}
                                            className="form-control"
                                            disabled={isAutomaticConsumption}
                                        />
                                    </div>
                                    <Form.Text className="text-muted">
                                        {isAutomaticConsumption ? 'Calculado automaticamente com base nos abastecimentos.' : 'Informe a média manualmente.'}
                                    </Form.Text>
                                </Form.Group>
                            </Col>
                        </Row>
                    </div>
                )}

                <Button variant="primary" type="submit" className="w-100 mb-2">
                    {bikeData ? 'Atualizar Informações' : 'Registrar Moto'}
                </Button>
                <Button variant="secondary" onClick={() => navigate('/view-bike')} className="w-100">
                    <FontAwesomeIcon icon={faMotorcycle} className="me-2" />
                    Visualizar Moto
                </Button>
            </Form>
        </div>
    );
}

export default RegisterBike;
