import { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function Activity() {
  const [logs, setLogs] = useState([]);

  useEffect(() => { api.get('/activity').then(r => setLogs(r.data)).catch(() => {}); }, []);

  return (
    <section className="view active">
      <div className="section">
        <div className="view-header">
          <div><h2>Activity Log</h2><p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>Audit trail of system events and operations</p></div>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Timestamp</th><th>Action</th><th>Owner</th><th>Details</th></tr></thead>
            <tbody>
              {logs.length === 0 ? <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 30 }}>No activity recorded yet</td></tr>
              : logs.map(log => (
                <tr key={log._id}>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12, whiteSpace: 'nowrap' }}>{new Date(log.createdAt).toLocaleString()}</td>
                  <td><span className="badge preparing">{log.action}</span></td>
                  <td style={{ fontWeight: 600 }}>{log.username}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
