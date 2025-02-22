import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form } from 'react-bootstrap';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase'; // Certifique-se do caminho correto

const RecordList = () => {
    const [records, setRecords] = useState([]);
    const [editRecord, setEditRecord] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);

    // Fetch registros do Firestore
    useEffect(() => {
        const fetchRecords = async () => {
            const querySnapshot = await getDocs(collection(db, 'dailyRecords'));
            const data = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setRecords(data);
        };
        fetchRecords();
    }, []);

    // Abrir modal de edição com os dados do registro
    const handleEdit = (record) => {
        setEditRecord(record);
        setShowEditModal(true);
    };

    // Atualizar registro no Firestore
    const handleUpdate = async () => {
        if (editRecord) {
            const recordRef = doc(db, 'dailyRecords', editRecord.id);
            await updateDoc(recordRef, editRecord);
            setRecords((prev) =>
                prev.map((r) => (r.id === editRecord.id ? editRecord : r))
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
                            <td>{record.date}</td>
                            <td>{record.km}</td>
                            <td>{record.fuel}</td>
                            <td>{record.earnings.length}</td>
                            <td>{record.extras.length}</td>
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
                                    value={editRecord.date}
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
        </div>
    );
};

export default RecordList;
