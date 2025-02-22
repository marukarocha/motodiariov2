import React, { useState } from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import UserConfig from './UserConfig';
import EarningConfig from './EarningConfig';
import AppConfig from './AppConfig';
import { saveUserConfig, saveEarningsConfig, saveAppConfig } from '../../../lib/db/firebaseServices'; // Importe as funções
import { useAuth } from '../Auth/AuthContext';
import Swal from 'sweetalert2';
import './ConfigPage.css';

const ConfigPage = () => {
    const { currentUser } = useAuth();
    const [activeTab, setActiveTab] = useState('user');

    const handleSave = async (data, type) => {
        if (!currentUser) {
            Swal.fire({
                icon: 'error',
                title: 'Erro',
                text: 'Usuário não autenticado.',
            });
            return;
        }

        try {
            if (type === 'user') {
                await saveUserConfig(currentUser.uid, data);
            } else if (type === 'earnings') {
                await saveEarningsConfig(currentUser.uid, data);
            } else if (type === 'app') {
                await saveAppConfig(currentUser.uid, data);
            }

            Swal.fire({
                icon: 'success',
                title: 'Sucesso!',
                text: 'Configurações salvas com sucesso!',
            });
        } catch (error) {
            console.error("Erro ao salvar configurações:", error);
            Swal.fire({
                icon: 'error',
                title: 'Erro!',
                text: 'Erro ao salvar configurações. Tente novamente.',
            });
        }
    };

    return (
        <div className="container mt-5">
            <h2 className="text-center mb-4">Configurações</h2>
            <Tabs
                id="controlled-tab-example"
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k)}
                className="mb-3 justify-content-center"
            >
                <Tab eventKey="user" title="Usuário">
                    <UserConfig saveData={(data) => handleSave(data, 'user')} />
                </Tab>
                <Tab eventKey="earnings" title="Ganhos">
                    <EarningConfig saveData={(data) => handleSave(data, 'earnings')} />
                </Tab>
                <Tab eventKey="app" title="Aplicativo">
                    <AppConfig saveData={(data) => handleSave(data, 'app')} />
                </Tab>
            </Tabs>
        </div>
    );
};

export default ConfigPage;
