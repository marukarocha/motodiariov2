import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Chart = ({ data }) => {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="km" stroke="#8884d8" name="Quilômetros" />
                <Line type="monotone" dataKey="fuel" stroke="#82ca9d" name="Combustível" />
                <Line type="monotone" dataKey="earnings" stroke="#ffc658" name="Ganhos" />
            </LineChart>
        </ResponsiveContainer>
    );
};

export default Chart;