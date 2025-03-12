import React, { useEffect, useState } from 'react';
import Pagination from 'react-bootstrap/Pagination';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ProviderHome = ({ providerKeys }) => {
    const [visibleDrivers, setVisibleDrivers] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [regionStats, setRegionStats] = useState({});
    const [overallAvgScore, setOverallAvgScore] = useState(0);
    const [scoreTrends, setScoreTrends] = useState([]);

    useEffect(() => {
        console.log("Received: ", providerKeys);

        // Compute Stats
        if (providerKeys.length > 0) {
            computeStatistics(providerKeys);
        }

        setTotalPages(Math.ceil((providerKeys || []).length / 5));
    }, [providerKeys]);

    const computeStatistics = (drivers) => {
        let regionData = {};
        let totalScore = 0;
        let totalPreviousScore = 0;
        let totalCurrentScore = 0;

        drivers.forEach(driver => {
            // Accumulate by region
            if (!regionData[driver.region]) {
                regionData[driver.region] = { count: 0, totalScore: 0 };
            }
            regionData[driver.region].count++;
            regionData[driver.region].totalScore += driver.currentScore;

            // Accumulate total score
            totalScore += driver.currentScore;
            totalPreviousScore += driver.previousScore || 0;
            totalCurrentScore += driver.currentScore;
        });

        // Compute region averages
        let processedRegionStats = {};
        Object.keys(regionData).forEach(region => {
            processedRegionStats[region] = {
                count: regionData[region].count,
                avgScore: Math.round(regionData[region].totalScore / regionData[region].count)
            };
        });

        // Compute overall average score
        setRegionStats(processedRegionStats);
        setOverallAvgScore(Math.round(totalScore / drivers.length));

        // Process monthly data for scatter plot
        let trendData = [
            { month: "Jan", avgScore: 700 }, // Fixed value
            { month: "Feb", avgScore: Math.round(totalPreviousScore / drivers.length) }, // Avg previousScore
            { month: "Mar", avgScore: Math.round(totalCurrentScore / drivers.length) } // Avg currentScore
        ];

        setScoreTrends(trendData);
    }

    const handleSeeMore = () => {
        setVisibleDrivers(visibleDrivers + 5);
      };
    
    const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    }

    const currentData = providerKeys.slice(
        (currentPage - 1) * 5,
        currentPage * 5
      );

    return (
        <div>
            <div className="statistics-container">
                <h2>Statistics</h2>
                <div className="stats-row">
                    <div className="stat-box">
                        <h3>Total Drivers</h3>
                        <p>{providerKeys.length}</p>
                    </div>
                    <div className="stat-box">
                        <h3>Overall Average Score</h3>
                        <p>{overallAvgScore}</p>
                    </div>
                    {Object.keys(regionStats).map(region => (
                        <div className="stat-box" key={region}>
                            <h3>{region}</h3>
                            <p>{regionStats[region].count} drivers</p>
                            <p>Avg Score: {regionStats[region].avgScore}</p>
                        </div>
                    ))}
                </div>
                
                <div className="chart-container">
                    <h3>Overall Average Score Trend (Past 6 Months)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={scoreTrends}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="avgScore" stroke="#8884d8" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        
            <div className="driver-table">
                <h2>Registered Drivers</h2>
                <table className="table">
                <thead>
                    <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone Number</th>
                    <th>Region</th>
                    <th>Car Model</th>
                    <th>License Plate</th>
                    <th>Current Score</th>
                    </tr>
                </thead>
                <tbody>
                    {currentData.map((driver, index) => (
                    <tr key={index}>
                        <td>{index + 1 + (currentPage - 1) * 5}</td>
                        <td>{driver.name}</td>
                        <td>{driver.email}</td>
                        <td>{driver.phoneNumber}</td>
                        <td>{driver.region}</td>
                        <td>{driver.carModel}</td>
                        <td>{driver.licensePlate}</td>
                        <td>{driver.currentScore}</td>
                    </tr>
                    ))}
                </tbody>
                </table>
                {visibleDrivers < providerKeys.length && (
                <button onClick={handleSeeMore} className="see-more-button">
                    See More
                </button>
                )}
                <PaginationComponent totalPages={totalPages} onPageChange={handlePageChange} activePage={currentPage} />
            </div>
        </div>
    );
};

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

export default ProviderHome;