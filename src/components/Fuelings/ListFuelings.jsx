import React, { useState, useEffect } from 'react';
import { getFuelings, deleteEarning } from '../../lib/db/firebaseServices';
import { useAuth } from '../USER/Auth/AuthContext';
import { Alert, Card, Row, Col, Form, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGasPump, faTrash, faEdit, faChartLine, faCalendarAlt, faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { doc, deleteDoc } from 'firebase/firestore';
import Swal from 'sweetalert2';
import { db } from '../../lib/db/firebaseServices';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from 'react-datepicker';
import ptBR from 'date-fns/locale/pt-BR';
import { createRoot } from 'react-dom/client';
import RegisterFueling from '../Fuelings/RegisterFueling';
import { AuthProvider } from '../USER/Auth/AuthContext';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

registerLocale('pt-BR', ptBR);

function ListFuelings() {
    const { currentUser } = useAuth();
    const userId = currentUser ? currentUser.uid : null;
    const [fuelings, setFuelings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [weeklyData, setWeeklyData] = useState({
        totalLiters: 0,
        averageConsumption: 0,
        totalSpent: 0,
        dailyLiters: [],
    });
    const [filterStartDate, setFilterStartDate] = useState(new Date(new Date().setHours(0, 0, 0, 0)));
    const [filterEndDate, setFilterEndDate] = useState(new Date(new Date().setHours(23, 59, 59, 999)));

    useEffect(() => {
        const fetchFuelings = async () => {
            if (!userId) {
                setError("Usuário não autenticado.");
                setLoading(false);
                return;
            }
            try {
                const data = await getFuelings(userId, filterStartDate, filterEndDate);
                setFuelings(data);
                calculateWeeklyData(data);
            } catch (error) {
                setError('Erro ao carregar os abastecimentos.');
                console.error("Erro ao obter abastecimentos:", error);
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchFuelings();
        }
    }, [userId, filterStartDate, filterEndDate]);

    const handleDelete = async (fuelingId) => {
        try {
            const confirmResult = await Swal.fire({
                title: 'Tem certeza?',
                text: "Você não poderá reverter isso!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sim, exclua!'
            });

            if (confirmResult.isConfirmed) {
                await deleteDoc(doc(db, 'users', userId, 'abastecimentos', fuelingId));
                setFuelings(fuelings.filter(fueling => fueling.id !== fuelingId));
                Swal.fire(
                    'Excluído!',
                    'O abastecimento foi excluído.',
                    'success'
                );
            }
        } catch (error) {
            console.error("Erro ao excluir abastecimento:", error);
            Swal.fire(
                'Erro!',
                'Ocorreu um erro ao excluir o abastecimento.',
                'error'
            );
        }
    };

    const calculateWeeklyData = (fuelingsData) => {
        const today = filterEndDate;
        const weekAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6);
        const last7Days = fuelingsData.filter(fueling => {
            const [day, month, year] = fueling.data.split('/');
            const fuelingDate = new Date(year, month - 1, day);
            return fuelingDate >= weekAgo && fuelingDate <= today;
        });

        let totalLiters = 0;
        let totalSpent = 0;
        const dailyLiters = [0, 0, 0, 0, 0, 0, 0];

        last7Days.forEach(fueling => {
            totalLiters += parseFloat(fueling.litros);
            totalSpent += parseFloat(fueling.litros) * parseFloat(fueling.valorLitro);

            const [day, month, year] = fueling.data.split('/');
            const fuelingDate = new Date(year, month - 1, day);
            const dayOfWeek = fuelingDate.getDay();
            dailyLiters[dayOfWeek] += parseFloat(fueling.litros);
        });

        // Removido o cálculo da média de consumo, pois não temos essa informação aqui
        setWeeklyData({
            totalLiters,
            averageConsumption: 0, // Defina como 0 ou calcule se tiver dados
            totalSpent,
            dailyLiters,
        });
    };

    const chartData = {
        labels: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
        datasets: [{
            label: 'Litros Abastecidos',
            data: weeklyData.dailyLiters,
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
        }],
    };

    const chartOptions = {
        scales: {
            y: {
                beginAtZero: true
            }
        },
        plugins: {
            legend: {
                display: false,
            },
        },
    };

    const handleStartDateChange = (date) => {
        setFilterStartDate(date);
    };

    const handleEndDateChange = (date) => {
        setFilterEndDate(date);
    };

    const setToday = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        setFilterStartDate(today);
        setFilterEndDate(new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999));
    };

    const setLast7Days = () => {
        const today = new Date();
        const last7Days = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6);
        last7Days.setHours(0, 0, 0, 0);
        setFilterStartDate(last7Days);
        setFilterEndDate(new Date());
    };

    const setLast15Days = () => {
        const today = new Date();
        const last15Days = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 14);
        last15Days.setHours(0, 0, 0, 0);
        setFilterStartDate(last15Days);
        setFilterEndDate(new Date());
    };

    const setThisMonth = () => {
        const today = new Date();
        setFilterStartDate(new Date(today.getFullYear(), today.getMonth(), 1));
        setFilterEndDate(new Date());
    };

    const handleShowModal = () => {
        Swal.fire({
            title: 'Registrar Abastecimento',
            html: '<div id="swal-fueling-form"></div>',
            showCloseButton: true,
            showConfirmButton: false,
            didOpen: () => {
                const container = document.getElementById('swal-fueling-form');
                const root = createRoot(container);
                root.render(
                    <AuthProvider>
                        <RegisterFueling onClose={() => Swal.close()} />
                    </AuthProvider>
                );
            },
            willClose: () => {
                const container = document.getElementById('swal-fueling-form');
                if (container) {
                    const root = createRoot(container);
                    root.unmount();
                }
            }
        });
    };

    if (loading) {
        return <p>Carregando abastecimentos...</p>;
    }

    if (error) {
        return <Alert variant="danger">{error}</Alert>;
    }

    return (
        <div className="container mt-5">
            <Row className="mb-3">
                <Col className="text-start">
                    <Button variant="success" onClick={handleShowModal}>
                        <FontAwesomeIcon icon={faPlusCircle} className="me-2" />
                        Registrar Abastecimento
                    </Button>
                </Col>
            </Row>
            <h2 className="text-center mb-4">
                <FontAwesomeIcon icon={faGasPump} className="me-2" /> Lista de Abastecimentos
            </h2>

            <Row className="mb-4">
                <Col xs={12} md={4} className="mb-3">
                    <Form.Group controlId="filterStartDate">
                        <Form.Label style={{ fontSize: '0.9rem' }}>
                            <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                            Data Inicial
                        </Form.Label>
                        <DatePicker
                            selected={filterStartDate}
                            onChange={handleStartDateChange}
                            dateFormat="dd/MM/yyyy"
                            locale="pt-BR"
                            className="form-control form-control-sm"
                        />
                    </Form.Group>
                </Col>
                <Col xs={12} md={4} className="mb-3">
                    <Form.Group controlId="filterEndDate">
                        <Form.Label style={{ fontSize: '0.9rem' }}>
                            <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                            Data Final
                        </Form.Label>
                        <DatePicker
                            selected={filterEndDate}
                            onChange={handleEndDateChange}
                            dateFormat="dd/MM/yyyy"
                            locale="pt-BR"
                            className="form-control form-control-sm"
                        />
                    </Form.Group>
                </Col>
                <Col xs={12} md={4} className="d-flex align-items-end justify-content-center">
                    <Button variant="outline-primary" size="sm" className="me-2" onClick={setToday}>Hoje</Button>
                    <Button variant="outline-primary" size="sm" className="me-2" onClick={setLast7Days}>Últimos 7 dias</Button>
                    <Button variant="outline-primary" size="sm" className="me-2" onClick={setLast15Days}>Últimos 15 dias</Button>
                    <Button variant="outline-primary" size="sm" onClick={setThisMonth}>Este mês</Button>
                </Col>
            </Row>

            <Row className="mb-4">
                <Col md={4}>
                    <Card>
                        <Card.Body>
                            <Card.Title>
                                <FontAwesomeIcon icon={faChartLine} className="me-2" />
                                Total Litros (Semana)
                            </Card.Title>
                            <Card.Text>{weeklyData.totalLiters.toFixed(2)} L</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card>
                        <Card.Body>
                            <Card.Title>
                                <FontAwesomeIcon icon={faChartLine} className="me-2" />
                                Média de Consumo
                            </Card.Title>
                            <Card.Text>{weeklyData.averageConsumption.toFixed(2)} km/L</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card>
                        <Card.Body>
                            <Card.Title>
                                <FontAwesomeIcon icon={faChartLine} className="me-2" />
                                Total Gasto (Semana)
                            </Card.Title>
                            <Card.Text>R$ {weeklyData.totalSpent.toFixed(2)}</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <div className="mb-4">
                <Bar data={chartData} options={chartOptions} />
            </div>

            {fuelings.length === 0 && <p className="text-center">Nenhum abastecimento registrado para a data selecionada.</p>}

            {fuelings.map((fueling) => (
                <Card key={fueling.id} className="mb-3">
                    <Card.Body>
                        <Row>
                            <Col xs={6} sm={4} md={3} lg={2}>
                                <strong>Data:</strong> {fueling.data}
                            </Col>
                            <Col xs={6} sm={4} md={3} lg={2}>
                                <strong>Hora:</strong> {fueling.hora}
                            </Col>
                            <Col xs={6} sm={4} md={3} lg={2}>
                                <strong>Posto:</strong> {fueling.posto}
                            </Col>
                            <Col xs={6} sm={4} md={3} lg={2}>
                                <strong>Combustível:</strong> {fueling.combustivel}
                            </Col>
                            <Col xs={6} sm={4} md={3} lg={2}>
                                <strong>Litros:</strong> {fueling.litros}
                            </Col>
                            <Col xs={6} sm={4} md={3} lg={2}>
                                <strong>Valor/Litro:</strong> R$ {fueling.valorLitro}
                            </Col>
                            <Col xs={6} sm={4} md={3} lg={2}>
                                <strong>Total:</strong> R$ {(fueling.litros * fueling.valorLitro).toFixed(2)}
                            </Col>
                            <Col xs={12} sm={8} md={9} lg={6} className="mt-2 mt-sm-0">
                                <Button variant="warning" size="sm" className="me-2">
                                    <FontAwesomeIcon icon={faEdit} /> Editar
                                </Button>
                                <Button variant="danger" size="sm" onClick={() => handleDelete(fueling.id)}>
                                    <FontAwesomeIcon icon={faTrash} /> Excluir
                                </Button>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            ))}
        </div>
    );
}

export default ListFuelings;
