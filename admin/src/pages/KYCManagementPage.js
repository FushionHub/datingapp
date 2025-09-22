import React, { useState, useEffect } from 'react';
import { getPendingKycDocs, updateKycStatus } from '../services/adminService';

const KYCManagementPage = () => {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDocs = async () => {
      setLoading(true);
      const pendingDocs = await getPendingKycDocs();
      setDocs(pendingDocs);
      setLoading(false);
    };
    loadDocs();
  }, []);

  const handleReview = async (docId, userId, newStatus) => {
    await updateKycStatus(docId, userId, newStatus);
    alert(`KYC document has been ${newStatus}.`);
    // Refresh the list
    const pendingDocs = await getPendingKycDocs();
    setDocs(pendingDocs);
  };

  if (loading) return <div>Loading KYC submissions...</div>;

  return (
    <div>
      <h2>KYC Management</h2>
      {docs.length > 0 ? (
        <table style={{ width: '100%', textAlign: 'left' }}>
          <thead>
            <tr>
              <th>User</th>
              <th>Document Type</th>
              <th>Document</th>
              <th>Submitted At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {docs.map(doc => (
              <tr key={doc.id}>
                <td>{doc.user.name || doc.user.email}</td>
                <td>{doc.document_type}</td>
                <td><a href={doc.document_url} target="_blank" rel="noopener noreferrer">View Document</a></td>
                <td>{new Date(doc.created_at).toLocaleString()}</td>
                <td>
                  <button onClick={() => handleReview(doc.id, doc.user_id, 'approved')} style={{color: 'green'}}>Approve</button>
                  <button onClick={() => handleReview(doc.id, doc.user_id, 'rejected')} style={{color: 'red', marginLeft: '8px'}}>Reject</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No pending KYC submissions.</p>
      )}
    </div>
  );
};

export default KYCManagementPage;
