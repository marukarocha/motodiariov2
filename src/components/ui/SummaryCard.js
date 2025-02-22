import React from 'react';
import { Card, Col } from 'react-bootstrap';

const SummaryCard = ({ title, value, icon }) => (
    <Col md={4}>
        <Card className="summary-card">
            <Card.Body>
                {icon && <div className="card-header">{icon}</div>}
                <Card.Title>{title}</Card.Title>
                <Card.Text><strong>{value}</strong></Card.Text>
            </Card.Body>
        </Card>
    </Col>
);

export default SummaryCard;
