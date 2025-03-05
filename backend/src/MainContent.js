import React, { useEffect, useState, lazy, Suspense } from 'react';
import Pagination from 'react-bootstrap/Pagination';
import './MainContent.css';
import { FaPlay } from 'react-icons/fa';

// Dynamically import CustomGauge with SSR disabled
const CustomGauge = lazy(() => import('./CustomGauge'));
function MainContent() {
  const [driver, setDriver] = useState({});
  const serverPort = process.env.REACT_APP_SERVER_PORT;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const keyID = localStorage.getItem("KeyID");
        const response = await fetch(`http://localhost:${serverPort}/driver?user=${keyID}`);
        const result = await response.json();
        // console.log('Driver Data fetched from API:', result); // Log the fetched data
        setDriver(result[0] || {});
        console.log(result)
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const driverScore = driver.currentScore;
  console.log("Score: ", driverScore)
  // const driverScore = driver[0].currentScore;

  return (
    <div className="main-content">
      <Suspense fallback={<div>Loading...</div>}>
        <CustomGauge driveScore={driverScore} />
      </Suspense>
      <SessionsToday />
    </div>
  );
}

function SessionsToday() {
  const [sessions, setSessions] = useState([]);
  const [visibleSessions, setVisibleSessions] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const serverPort = process.env.REACT_APP_SERVER_PORT;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const keyID = localStorage.getItem("KeyID");
        const offset = (currentPage - 1) * 5;
        const response = await fetch(`http://localhost:${serverPort}/sessions?limit=5&offset=${offset}&user=${keyID}`);
        const result = await response.json();
        console.log('Sessions Data fetched from API:', result); // Log the fetched data
        setSessions(result || []);
        setTotalPages(Math.ceil((result || []).length / 5));
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [currentPage]);

  const handleSeeMore = () => {
    setVisibleSessions(visibleSessions + 5);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  }

  const currentData = sessions.slice(
    (currentPage - 1) * 5,
    currentPage * 5
  );

  return (
    <div className="session-table">
      <h2>Sessions Today</h2>
      <table className="table">
        <thead>
          <tr>
            <th>#</th>
            <th>Session ID</th>
            <th>Time Start</th>
            <th>Time End</th>
            <th>Recording</th>
          </tr>
        </thead>
        <tbody>
          {currentData.map((session, index) => (
            <tr key={index}>
              <td>{index + 1 + (currentPage - 1) * 5}</td>
              <td>{session.sessionID}</td>
              <td>{session.time_started}</td>
              <td>{session.time_ended}</td>
              <td><FaPlay /></td>
            </tr>
          ))}
        </tbody>
      </table>
      {visibleSessions < sessions.length && (
        <button onClick={handleSeeMore} className="see-more-button">
          See More
        </button>
      )}
      <PaginationComponent totalPages={totalPages} onPageChange={handlePageChange} activePage={currentPage} />
    </div>
  );
}

function PaginationComponent({ totalPages, onPageChange, activePage }) {
  const items = [];

  for (let number = 1; number <= totalPages; number++) {
    items.push(
      <Pagination.Item key={number} active={number === activePage} onClick={() => onPageChange(number)}>
        {number}
      </Pagination.Item>,
    );
  }

  return (
    <div className="pagination-container">
      <Pagination>{items}</Pagination>
    </div>
  );
}

export default MainContent;