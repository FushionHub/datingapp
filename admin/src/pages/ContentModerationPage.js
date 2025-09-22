import React, { useState, useEffect } from 'react';
import { getReports } from '../services/adminService';

const ContentModerationPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReports = async () => {
      setLoading(true);
      const pendingReports = await getReports();
      setReports(pendingReports);
      setLoading(false);
    };
    loadReports();
  }, []);

  const handleReview = (reportId, action) => {
    // In a real app, this would update the report status and potentially
    // take action against the reported user (e.g., ban, warning).
    alert(`Action '${action}' taken for report ${reportId}.`);
    setReports(reports.filter(r => r.id !== reportId));
  };

  if (loading) return <div>Loading reports...</div>;

  return (
    <div>
      <h2>Content Moderation Queue</h2>
      {reports.length > 0 ? (
        <table style={{ width: '100%', textAlign: 'left' }}>
          <thead>
            <tr>
              <th>Reported User</th>
              <th>Reported By</th>
              <th>Reason</th>
              <th>Reported At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map(report => (
              <tr key={report.id}>
                <td>{report.reported.name}</td>
                <td>{report.reporter.name}</td>
                <td>{report.reason}</td>
                <td>{new Date(report.created_at).toLocaleString()}</td>
                <td>
                  <button onClick={() => handleReview(report.id, 'Dismiss')} style={{color: 'green'}}>Dismiss Report</button>
                  <button onClick={() => handleReview(report.id, 'Ban User')} style={{color: 'red', marginLeft: '8px'}}>Ban User</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No pending reports.</p>
      )}
    </div>
  );
};

export default ContentModerationPage;
