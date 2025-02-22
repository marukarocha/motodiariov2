import React, { useState } from 'react';
import { Modal, Button, Table, Form, InputGroup } from 'react-bootstrap';
import { addDoc, collection } from "firebase/firestore";
import { db } from "../../lib/db/firebase";  // Caminho correto se estiver dentro de DIARIA


import { FaCalendarAlt} from 'react-icons/fa'; // Removido FaPencilAlt
import { BiGasPump } from "react-icons/bi";
import { FaRoad } from "react-icons/fa6";
import { SiIfood } from "react-icons/si";
import { FaUber, FaTruck } from 'react-icons/fa'; // Importando ícones






const DayRegister = ({ onSaveDay }) => {
    const [dayData, setDayData] = useState({
        date: new Date().toISOString().split('T')[0], // Data atual no formato yyyy-mm-dd
        km: '',
        fuel: '',
        earnings: [],
        extras: [],
    });

    const [showEarningsModal, setShowEarningsModal] = useState(false);
    const [showExtrasModal, setShowExtrasModal] = useState(false);
    const [currentEarning, setCurrentEarning] = useState({ app: '', value: '', hours: '' });
    const [currentExtra, setCurrentExtra] = useState({ description: '', value: '' });

    // Adicionar um ganho por aplicativo
    const addEarning = () => {
        setDayData((prev) => ({
            ...prev,
            earnings: [...prev.earnings, currentEarning],
        }));
        setCurrentEarning({ app: '', value: '', hours: '' });
        console.log("Ganho Adicionado: ", currentEarning);
        setShowEarningsModal(false);
    };
    
    const handleIconClick = (app) => {
        setCurrentEarning({ ...currentEarning, app });
    };
    // Adicionar um gasto extra
    const addExtra = () => {
        setDayData((prev) => ({
            ...prev,
            extras: [...prev.extras, currentExtra],
        }));
        setCurrentExtra({ description: '', value: '' });
        setShowExtrasModal(false);
    };

    // Excluir registro
    const deleteEarning = (index) => {
        setDayData((prev) => ({
            ...prev,
            earnings: prev.earnings.filter((_, i) => i !== index),
        }));
    };

    const deleteExtra = (index) => {
        setDayData((prev) => ({
            ...prev,
            extras: prev.extras.filter((_, i) => i !== index),
        }));
    };

   // Função de validação
const validateFields = () => {
    if (!dayData.km || !dayData.fuel || dayData.earnings.length === 0) {
        alert("Por favor, preencha todos os campos antes de salvar.");
        return false;
    }
    return true;
};

// Função de salvar
const handleSubmit = async () => {
    if (!validateFields()) return;

    try {
        // Salva no Firestore
        const docRef = await addDoc(collection(db, "dailyRecords"), dayData);
        console.log("Documento salvo com ID: ", docRef.id);

        // Atualiza o estado global (se necessário)
        if (onSaveDay) {
            onSaveDay({ ...dayData, id: docRef.id });
        }

        // Limpa os campos
        setDayData({
            date: new Date().toISOString().split('T')[0],
            km: '',
            fuel: '',
            earnings: [],
            extras: [],
        });
    } catch (error) {
        console.error("Erro ao salvar no Firestore: ", error);
    }
};


    return (
        <div className="container">
            
            <h3>Registro Diário</h3>
            <Form>
                {/* Campo de Data com ícone e data atual */}
                <Form.Group controlId="date">
                    <Form.Label>Data</Form.Label>
                    <InputGroup>
                        <InputGroup.Text>
                            <FaCalendarAlt />
                        </InputGroup.Text>
                        <Form.Control
                            type="date"
                            value={dayData.date}
                            onChange={(e) => setDayData({ ...dayData, date: e.target.value })}
                        />
                    </InputGroup>
                </Form.Group>

                {/* Campo de Quilometragem com máscara */}
                <Form.Group controlId="km">
                    <Form.Label>Quilômetros Rodados</Form.Label>
                    <InputGroup>
                        <InputGroup.Text>
                             <FaRoad />
                        </InputGroup.Text>
                        <Form.Control
                            type="text"
                            value={dayData.km}
                            onChange={(e) => setDayData({ ...dayData, km: e.target.value.replace(/\D/g, '') })}
                            placeholder="Informe os km"
                        />
                    </InputGroup>
                </Form.Group>

                {/* Campo de Combustível com máscara */}
                <Form.Group controlId="fuel">
                    <Form.Label>Litros de Combustível</Form.Label>
                    <InputGroup>
                        <InputGroup.Text>
                        <BiGasPump />
                        </InputGroup.Text>
                        <Form.Control
                            type="text"
                            value={dayData.fuel}
                            onChange={(e) => setDayData({ ...dayData, fuel: e.target.value.replace(/[^0-9.]/g, '') })}
                            placeholder="Informe os litros"
                        />
                    </InputGroup>
                </Form.Group>
                

                <h4 className="mt-3">Ganhos</h4>
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th><h5>Aplicativo</h5></th>
                            <th><h5>Valor (R$)</h5></th>
                            <th><h5>Horas Trabalhadas</h5></th>
                            <th><h5>Ações</h5></th>
                        </tr>
                    </thead>
                    <tbody>
                        {dayData.earnings.map((earning, index) => (
                            <tr key={index}>
                                <td><h5>{earning.app}</h5></td>
                                <td><h5>{earning.value}</h5></td>
                                <td><h5>{earning.hours}</h5></td>
                                <td>
                                    <Button variant="danger" size="sm" onClick={() => deleteEarning(index)}>
                                        Excluir
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
                <div className="row">
                    <Button className="col-6" variant="success" onClick={() => setShowEarningsModal(true)}>
                    Adicionar Ganho
                </Button>
                
                </div>
                <h4>Gastos Extras</h4>
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th><h5>Descrição</h5></th>
                            <th><h5>Valor (R$)</h5></th>
                            <th><h5>Ações</h5></th>
                        </tr>
                    </thead>
                    <tbody>
                        {dayData.extras.map((extra, index) => (
                            <tr key={index}>
                                <td>{extra.description}</td>
                                <td>{extra.value}</td>
                                <td>
                                    <Button variant="danger" size="sm" onClick={() => deleteExtra(index)}>
                                        Excluir
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
                <Button className="col-6" variant="danger" onClick={() => setShowExtrasModal(true)} >
                    Adicionar Gasto Extra
                </Button>

                <Button variant="success" className="mt-3" onClick={handleSubmit}>
                    Salvar Registro do Dia
                </Button>
            </Form>

            {/* Modal para adicionar ganhos */}
            <Modal show={showEarningsModal} onHide={() => setShowEarningsModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Adicionar Ganho</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="app">
                            <Form.Label>Aplicativo</Form.Label>
                            {/* Exibindo ícones clicáveis */}
                            <div className="d-flex justify-content-around">
                                <Button
                                    variant={currentEarning.app === "Uber" ? "primary" : "light"}
                                    onClick={() => handleIconClick("Uber")}
                                >
                                    <FaUber size={30} />
                                    Uber
                                </Button>
                                <Button
                                    variant={currentEarning.app === "99" ? "primary" : "light"}
                                    onClick={() => handleIconClick("99")}
                                >
                                    <FaTruck size={30} />
                                    99
                                </Button>
                                <Button
                                    variant={currentEarning.app === "Ifood" ? "primary" : "light"}
                                    onClick={() => handleIconClick("Ifood")}
                                >
                                    <SiIfood size={30} />
                                    Ifood
                                </Button>
                            </div>
                        </Form.Group>

                        <Form.Group controlId="value">
                            <Form.Label>Valor (R$)</Form.Label>
                            <Form.Control
                                type="number"
                                value={currentEarning.value}
                                onChange={(e) =>
                                    setCurrentEarning({ ...currentEarning, value: e.target.value })
                                }
                                placeholder="Valor"
                            />
                        </Form.Group>

                        <Form.Group controlId="hours">
                            <Form.Label>Horas Trabalhadas</Form.Label>
                            <Form.Control
                                type="number"
                                value={currentEarning.hours}
                                onChange={(e) =>
                                    setCurrentEarning({ ...currentEarning, hours: e.target.value })
                                }
                                placeholder="Horas"
                            />
                        </Form.Group>

                        <Button variant="primary" onClick={addEarning}>
                            Adicionar
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Modal para adicionar gastos extras */}
            <Modal show={showExtrasModal} onHide={() => setShowExtrasModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Adicionar Gasto Extra</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="description">
                            <Form.Label>Descrição</Form.Label>
                            <Form.Control
                                type="text"
                                value={currentExtra.description}
                                onChange={(e) =>
                                    setCurrentExtra({ ...currentExtra, description: e.target.value })
                                }
                                placeholder="Descrição do gasto"
                            />
                        </Form.Group>
                        <Form.Group controlId="value">
                            <Form.Label>Valor (R$)</Form.Label>
                            <Form.Control
                                type="number"
                                value={currentExtra.value}
                                onChange={(e) =>
                                    setCurrentExtra({ ...currentExtra, value: e.target.value })
                                }
                                placeholder="Valor"
                            />
                        </Form.Group>
                        <Button variant="primary" onClick={addExtra}>
                            Adicionar
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default DayRegister;
