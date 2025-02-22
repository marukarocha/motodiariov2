import React, { useState, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';
import Cleave from 'cleave.js/react';
import { useAuth } from '../Auth/AuthContext';
import { getEarningsConfig } from '../../../lib/db/firebaseServices'; // Importe a função


const EarningConfig = ({ saveData }) => {
    const { currentUser } = useAuth();
    const [monthlyGoal, setMonthlyGoal] = useState('');
    const [dailyHours, setDailyHours] = useState('');
    const [fixedCosts, setFixedCosts] = useState([
        { id: 1, description: '', value: '', frequency: 'mensal', monthlyCost: 0, annualCost: 0 },
    ]);


    useEffect(() => {
        const fetchEarningsConfig = async () => {
            if (currentUser) {
                try {
                    const config = await getEarningsConfig(currentUser.uid);
                    if (config) {
                        setMonthlyGoal(config.monthlyGoal || '');
                        setDailyHours(config.dailyHours || '');
                        setFixedCosts(config.fixedCosts || [
                            { id: 1, description: '', value: '', frequency: 'mensal', monthlyCost: 0, annualCost: 0 },
                        ]);
                    }
                } catch (error) {
                    console.error("Erro ao carregar configurações de ganhos:", error);
                }
            }
        };

        fetchEarningsConfig();
    }, [currentUser]);


    const handleSave = () => {
        const formattedFixedCosts = fixedCosts.map(cost => ({
            ...cost,
            value: parseFloat(cost.value.replace(/[^\d,-]/g, '').replace(',', '.')) || 0
        }));

        saveData({
            monthlyGoal: parseFloat(monthlyGoal.replace(/[^\d,-]/g, '').replace(',', '.')) || 0,
            dailyHours,
            fixedCosts: formattedFixedCosts.filter((cost) => cost.description && cost.value),
        });
    };

    const addFixedCost = () => {
        setFixedCosts([
            ...fixedCosts,
            { id: fixedCosts.length + 1, description: '', value: '', frequency: 'mensal', monthlyCost: 0, annualCost: 0 },
        ]);
    };

    const removeFixedCost = (id) => {
        setFixedCosts(fixedCosts.filter((cost) => cost.id !== id));
    };

    const updateFixedCost = (id, field, value) => {
        setFixedCosts(
            fixedCosts.map((cost) =>
                cost.id === id
                    ? {
                          ...cost,
                          [field]: value,
                          ...calculateCosts({ ...cost, [field]: value }),
                      }
                    : cost
            )
        );
    };

    const calculateCosts = (cost) => {
        if (!cost.value) return { monthlyCost: 0, annualCost: 0 };

        const value = parseFloat(cost.value.replace(/[^0-9.-]+/g, '')) || 0; // Trata o valor para aceitar formatos de moeda
        let monthlyCost = 0;

        switch (cost.frequency) {
            case 'quinzenal':
                monthlyCost = value * 2;
                break;
            case 'mensal':
                monthlyCost = value;
                break;
            case 'anual':
                monthlyCost = value / 12;
                break;
            default:
                monthlyCost = 0;
        }

        const annualCost = monthlyCost * 12;
        return { monthlyCost, annualCost };
    };

    return (
        <div className="config-section financeiro">
            <div className="d-flex align-items-center">
                <h5>Financeiro</h5>
            </div>
            <div className="d-flex row">
                <div className="form-group col-6">
                    <Form.Label>Meta Mensal (R$):</Form.Label>
                    <Cleave
                        options={{
                            prefix: 'R$ ',
                            numeral: true,
                            numeralThousandsGroupStyle: 'thousand',
                            numeralDecimalScale: 2,
                            numeralDecimalMark: ',',
                            delimiter: '.',
                        }}
                        className="form-control"
                        value={monthlyGoal}
                        onChange={(e) => setMonthlyGoal(e.target.rawValue)}
                        placeholder="Digite sua meta mensal"
                    />
                </div>
                <div className="form-group col-6">
                    <Form.Label>Horas Desejadas por Dia:</Form.Label>
                    <Form.Control
                        type="number"
                        className="form-control"
                        value={dailyHours}
                        onChange={(e) => setDailyHours(e.target.value)}
                        placeholder="Digite as horas de trabalho por dia"
                    />
                </div>
            </div>
            <div className="form-group">
                <Form.Label>Custos Fixos:</Form.Label>
                {fixedCosts.map((cost) => (
                    <div key={cost.id} className="mb-3">
                        <div className="d-flex align-items-center mb-2">
                            <Form.Control
                                type="text"
                                className="form-control me-2"
                                placeholder="Descrição (ex: IPVA)"
                                value={cost.description}
                                onChange={(e) =>
                                    updateFixedCost(cost.id, 'description', e.target.value)
                                }
                            />
                            <Cleave
                                options={{
                                    prefix: 'R$ ',
                                    numeral: true,
                                    numeralThousandsGroupStyle: 'thousand',
                                    numeralDecimalScale: 2,
                                    numeralDecimalMark: ',',
                                    delimiter: '.',
                                }}
                                className="form-control me-2"
                                placeholder="Valor (R$)"
                                value={cost.value}
                                onChange={(e) =>
                                    updateFixedCost(cost.id, 'value', e.target.rawValue)
                                }
                            />
                            <Form.Select
                                className="form-control me-2"
                                value={cost.frequency}
                                onChange={(e) =>
                                    updateFixedCost(cost.id, 'frequency', e.target.value)
                                }
                            >
                                <option value="mensal">Mensal</option>
                                <option value="quinzenal">Quinzenal</option>
                                <option value="anual">Anual</option>
                            </Form.Select>
                            <Button
                                variant="danger"
                                onClick={() => removeFixedCost(cost.id)}
                            >
                                Remover
                            </Button>
                        </div>
                        <div>
                            <small>Gasto Mensal: R$ {cost.monthlyCost.toFixed(2)}</small> |{' '}
                            <small>Total Anual: R$ {cost.annualCost.toFixed(2)}</small>
                        </div>
                    </div>
                ))}
                <Button variant="secondary" className="mt-2" onClick={addFixedCost}>
                    Adicionar Custo Fixo
                </Button>
            </div>
            <Button variant="primary" className="mt-3" onClick={handleSave}>
                Salvar
            </Button>
        </div>
    );
};

export default EarningConfig;
