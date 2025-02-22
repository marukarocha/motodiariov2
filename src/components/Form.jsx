import React, { useState } from 'react';
import InputMask from 'react-input-mask';

const Form = ({ onAddEntry }) => {
    const [form, setForm] = useState({
        app: '',
        earnings: '',
        km: '',
        fuel: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validação dos campos
        if (
            !form.app ||
            isNaN(parseFloat(form.earnings)) ||
            isNaN(parseFloat(form.km)) ||
            isNaN(parseFloat(form.fuel))
        ) {
            alert('Preencha todos os campos corretamente!');
            return;
        }

        // Conversão dos campos para números
        const entry = {
            app: form.app,
            earnings: parseFloat(form.earnings),
            km: parseFloat(form.km),
            fuel: parseFloat(form.fuel),
        };

        onAddEntry(entry);

        // Limpar o formulário
        setForm({ app: '', earnings: '', km: '', fuel: '' });
    };

    return (
        <form onSubmit={handleSubmit}>
            <label>
                Aplicativo:
                <select
                    value={form.app}
                    onChange={(e) => setForm({ ...form, app: e.target.value })}
                >
                    <option value="">Selecione o aplicativo</option>
                    <option value="Uber">Uber</option>
                    <option value="99">99</option>
                    <option value="Ifood">Ifood</option>
                    <option value="Outro">Outro</option>
                </select>
            </label>

            <label>
                Quilômetros rodados (km):
                <InputMask
                    mask="99999"
                    placeholder="Ex.: 123"
                    value={form.km}
                    onChange={(e) => setForm({ ...form, km: e.target.value })}
                />
            </label>

            <label>
                Combustível (litros):
                <InputMask
                    mask="99.9"
                    placeholder="Ex.: 10.5"
                    value={form.fuel}
                    onChange={(e) => setForm({ ...form, fuel: e.target.value })}
                />
            </label>

            <label>
                Ganhos do dia (R$):
                <InputMask
                    mask="9999.99"
                    placeholder="Ex.: 250.50"
                    value={form.earnings}
                    onChange={(e) =>
                        setForm({
                            ...form,
                            earnings: e.target.value.replace(',', '.'),
                        })
                    }
                />
            </label>

            <button type="submit">Adicionar</button>
        </form>
    );
};

export default Form;
