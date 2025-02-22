import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form } from 'react-bootstrap';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/db/firebase'; // Certifique-se do caminho correto
import BackToHomeButton from './UI/BackToHomeButton';
import { format, parseISO } from 'date-fns';

const RecordList = () => {
    const [records, setRecords] = useState([]);
    const [editRecord, setEditRecord] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);

    // Fetch registros do Firestore
    useEffect(() => {
        const fetchRecords = async () => {
            const querySnapshot = await getDocs(collection(db, 'dailyRecords'));
            const data = querySnapshot.docs.map((doc) => {
                const recordData = doc.data();
                let parsedDate = null;

                if (recordData.date) {
                    // Tenta identificar o formato do campo `date`
                    if (recordData.date.toDate) {
                        parsedDate = recordData.date.toDate(); // Firestore Timestamp
                    } else if (typeof recordData.date === 'string') {
                        parsedDate = new Date(recordData.date); // String ISO ou similar
                    } else if (typeof recordData.date === 'number') {
                        parsedDate = new Date(recordData.date); // Unix timestamp
                    }
                }

                return {
                    id: doc.id,
                    ...recordData,
                    date: parsedDate,
                };
            });

            // Ordenar registros por data (do mais recente para o mais antigo)
            const sortedData = data.sort((a, b) => new Date(b.date) - new Date(a.date));
            setRecords(sortedData);
        };
        fetchRecords();
    }, []);

    // Formatar data
    const formatDate = (date) => {
        if (!date || isNaN(new Date(date))) {
            return 'Data Inválida';
        }
        return format(new Date(date), 'dd/MM/yyyy');
    };

    // Abrir modal de edição com os dados do registro
    const handleEdit = (record) => {
        setEditRecord(record);
        setShowEditModal(true);
    };

    // Atualizar registro no Firestore
    const handleUpdate = async () => {
        if (editRecord) {
            const recordRef = doc(db, 'dailyRecords', editRecord.id);
            const updatedRecord = {
                ...editRecord,
                date: new Date(editRecord.date), // Certificar que a data está em formato Date
            };
            await updateDoc(recordRef, updatedRecord);
            setRecords((prev) =>
                prev.map((r) => (r.id === editRecord.id ? updatedRecord : r))
            );
            setShowEditModal(false);
        }
    };

    // Excluir registro no Firestore
    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir este registro?')) {
            await deleteDoc(doc(db, 'dailyRecords', id));
            setRecords((prev) => prev.filter((r) => r.id !== id));
        }
    };

    return (
        <div>
            <h3>Registros Salvos</h3>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Data</th>
                        <th>Km Rodados</th>
                        <th>Combustível</th>
                        <th>Ganhos</th>
                        <th>Extras</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {records.map((record) => (
                        <tr key={record.id}>
                            <td>{formatDate(record.date)}</td>
                            <td>{record.km}</td>
                            <td>{record.fuel}</td>
                            <td>{record.earnings?.length || 0}</td>
                            <td>{record.extras?.length || 0}</td>
                            <td>
                                <Button
                                    variant="warning"
                                    size="sm"
                                    onClick={() => handleEdit(record)}
                                >
                                    Editar
                                </Button>{' '}
                                <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => handleDelete(record.id)}
                                >
                                    Excluir
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            {/* Modal para edição */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Editar Registro</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {editRecord && (
                        <Form>
                            <Form.Group controlId="date">
                                <Form.Label>Data</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={
                                        editRecord.date
                                            ? format(new Date(editRecord.date), 'yyyy-MM-dd') // Formato padrão para inputs de data
                                            : ''
                                    }
                                    onChange={(e) =>
                                        setEditRecord({ ...editRecord, date: e.target.value })
                                    }
                                />
                            </Form.Group>
                            <Form.Group controlId="km">
                                <Form.Label>Quilômetros Rodados</Form.Label>
                                <Form.Control
                                    type="number"
                                    value={editRecord.km}
                                    onChange={(e) =>
                                        setEditRecord({ ...editRecord, km: e.target.value })
                                    }
                                />
                            </Form.Group>
                            <Form.Group controlId="fuel">
                                <Form.Label>Combustível</Form.Label>
                                <Form.Control
                                    type="number"
                                    value={editRecord.fuel}
                                    onChange={(e) =>
                                        setEditRecord({ ...editRecord, fuel: e.target.value })
                                    }
                                />
                            </Form.Group>
                        </Form>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                        Cancelar
                    </Button>
                    <Button variant="primary" onClick={handleUpdate}>
                        Salvar Alterações
                    </Button>
                </Modal.Footer>
            </Modal>
         <BackToHomeButton />

        </div>
    );
};

export default RecordList;
