import React, { useState, useEffect } from 'react';

function Score() {
  const [driver, setDriver] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/driver?user=${1}`);
        const result = await response.json();
        console.log('Data fetched from API:', result); // Log the fetched data
        setDriver(result || {});
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);
};

export default Score;