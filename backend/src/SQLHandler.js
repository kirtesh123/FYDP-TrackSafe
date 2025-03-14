import React, { useState } from 'react';
const axios = require('axios')

const SQLHandler = () => {
    const [data, setData] = useState([]);
    const [inputData, setInputData] = useState([]); // Adjust based on your table schema
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const serverPort = process.env.REACT_APP_SERVER_PORT;

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`http://localhost:${serverPort}/sessions`);
            const result = await response.json();
            console.log('Data fetched from API:', result); // Log the fetched data
            setData(result || []);
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Error fetching data');
        } finally {
            setLoading(false);
        }
    };

    const sendData = async () => {
        setLoading(true);
        setError(null);
        try {
            // const parsedData = JSON.parse(inputData); // Parse JSON input
            const parsedData = {
                "KeyID": 6,
                "sessionID":1,
                "time_started":"08:00:00"
            };
            console.log('Parsed data:', parsedData); // Log parsed data
            const response = await fetch(`http://localhost:${serverPort}/sessions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain'
                },
                body: parsedData
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Network response was not ok: ${errorText}`);
            }

            const result = await response.json();
            console.log('Data sent successfully:', result);
            fetchData(); // Refresh data after sending
        } catch (error) {
            console.error('Error sending data:', error);
            setError(`Error sending data: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setInputData(e.target.value); // Handle JSON input change
    };

    const renderTableHeader = () => {
        if (!data.length) return null;
        return (
            <tr>
                {Object.keys(data[0]).map((key) => (
                    <th key={key}>{key}</th>
                ))}
            </tr>
        );
    };

    const renderTableRows = () => {
        return data.map((row, index) => (
            <tr key={index}>
                {Object.values(row).map((value, idx) => (
                    <td key={idx}>{value}</td>
                ))}
            </tr>
        ));
    };

    return (
        <div>
            <h1>SQL Handler</h1>
            <button onClick={fetchData}>Fetch Data</button>
            <div>
                <textarea
                    rows="5"
                    cols="50"
                    value={inputData}
                    onChange={handleInputChange}
                    placeholder='Enter JSON data here'
                />
                <button onClick={sendData}>Send Data</button>
            </div>
            {loading && <p>Loading...</p>}
            {error && <p>{error}</p>}
            <div>
                <h2>Data from MySQL</h2>
                {data.length > 0 ? (
                    <table>
                        <thead>
                            {renderTableHeader()}
                        </thead>
                        <tbody>
                            {renderTableRows()}
                        </tbody>
                    </table>
                ) : (
                    <p>No data available</p>
                )}
            </div>
        </div>
    );
};

export default SQLHandler;
