'use client';

import { useState, useEffect } from 'react';

interface Integration {
  id: number;
  name: string;
  system: string;
  isActive: boolean;
  apiEndpoint: string;
  syncDirection: string;
  lastSyncAt?: string;
}

interface SyncLog {
  id: number;
  integrationId: number;
  entityType: string;
  direction: string;
  recordCount: number;
  successCount: number;
  errorCount: number;
  status: string;
  createdAt: string;
}

export default function ERPIntegrationPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchIntegrations = async () => {
    try {
      const response = await fetch('http://localhost:3000/erp/integrations');
      const data = await response.json();
      setIntegrations(data as Integration[]);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching integrations:', error);
      setLoading(false);
    }
  };

  const fetchSyncLogs = async () => {
    try {
      const response = await fetch('http://localhost:3000/erp/sync-logs');
      const data = await response.json();
      setSyncLogs((data as SyncLog[]).slice(0, 50)); // Last 50 logs
    } catch (error) {
      console.error('Error fetching sync logs:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchIntegrations(), fetchSyncLogs()]);
    };
    loadData();
  }, []);

  const handleSyncEmployees = async (id: number) => {
    try {
      await fetch(`http://localhost:3000/erp/integrations/${id}/sync-employees`, {
        method: 'POST',
      });
      alert('Employee sync initiated');
      setTimeout(fetchSyncLogs, 2000);
    } catch (error) {
      console.error('Error syncing employees:', error);
    }
  };

  const handleSyncPayroll = async (id: number) => {
    try {
      const now = new Date();
      await fetch(`http://localhost:3000/erp/integrations/${id}/sync-payroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          month: now.getMonth() + 1,
          year: now.getFullYear(),
        }),
      });
      alert('Payroll sync initiated');
      setTimeout(fetchSyncLogs, 2000);
    } catch (error) {
      console.error('Error syncing payroll:', error);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">ERP Integration</h1>

      {/* Integrations */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Configured Integrations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {integrations.map((integration) => (
            <div key={integration.id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{integration.name}</h3>
                  <p className="text-sm text-gray-500">{integration.system}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  integration.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {integration.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">Endpoint:</span>
                  <span className="font-medium text-xs">{integration.apiEndpoint}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Sync Direction:</span>
                  <span className="font-medium">{integration.syncDirection}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Last Sync:</span>
                  <span className="font-medium">
                    {integration.lastSyncAt ? new Date(integration.lastSyncAt).toLocaleString() : 'Never'}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleSyncEmployees(integration.id)}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
                >
                  Sync Employees
                </button>
                <button
                  onClick={() => handleSyncPayroll(integration.id)}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
                >
                  Sync Payroll
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sync Logs */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Recent Sync Logs</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Integration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Direction</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Records</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Success</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Errors</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {syncLogs.map((log) => (
                <tr key={log.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{log.integrationId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{log.entityType}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{log.direction}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{log.recordCount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">{log.successCount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">{log.errorCount}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      log.status === 'SUCCESS' ? 'bg-green-100 text-green-800' :
                      log.status === 'PARTIAL' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
