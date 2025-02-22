import React from 'react';
import ReactDOM from 'react-dom';
import Swal from 'sweetalert2';
import DayRegister from './DayRegister'; // Certifique-se do caminho correto

const StartDayButton = ({ onSaveDay }) => {
    const startDay = () => {
        Swal.fire({
            title: 'Iniciar o Dia',
            html: `<div id="day-register-modal"></div>`,
            showConfirmButton: false,
            allowOutsideClick: false,
            didOpen: () => {
                const modalElement = document.getElementById('day-register-modal');
                ReactDOM.render(<DayRegister onSaveDay={onSaveDay} />, modalElement);
            },
            willClose: () => {
                ReactDOM.unmountComponentAtNode(document.getElementById('day-register-modal'));
            }
        });
    };

    return (
        <button onClick={startDay} className="btn btn-success">
            Iniciar Dia
        </button>
    );
};

export default StartDayButton;
