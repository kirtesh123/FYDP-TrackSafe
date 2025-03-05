import React, { useState, useEffect } from 'react';

function Score() {
  const [driver, setDriver] = useState({});
  const serverPort = process.env.REACT_APP_SERVER_PORT;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const keyID = localStorage.getItem("KeyID");
        const response = await fetch(`http://localhost:${serverPort}/driver?user=${keyID}`);
        const result = await response.json();
        console.log('Data fetched from API:', result); // Log the fetched data
        setDriver(result[0] || {});
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);
};

export default Score;