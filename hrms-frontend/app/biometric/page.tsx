'use client';

import { useState, useEffect } from 'react';

interface BiometricDevice {
  id: number;
  name: string;
  deviceCode: string;
  deviceType: string;
  location: string;
  ipAddress: string;
  isActive: boolean;
  lastSyncAt: string | null;
}

interface BiometricLog {
  id: number;
  deviceId: number;
  employeeId: number | null;
  logType: string;
  timestamp: string;
  isProcessed: boolean;
}

export default function BiometricPage() {
  const [devices, setDevices] = useState<BiometricDevice[]>([]);
  const [logs, setLogs] = useState<BiometricLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const response = await fetch('http://localhost:3000/biometric/logs');
      const data = await response.json();
      setLogs(Array.isArray(data) ? data.slice(0, 50) : []); // Show last 50 logs
    } catch (error) {
      console.error('Error fetching logs:', error);
      setLogs([]);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [devicesRes, logsRes] = await Promise.all([
          fetch('http://localhost:3000/biometric/devices'),
          fetch('http://localhost:3000/biometric/logs')
        ]);
        const devicesData = await devicesRes.json();
        const logsData = await logsRes.json();
        
        // Ensure devices is an array
        setDevices(Array.isArray(devicesData) ? devicesData : []);
        // Ensure logs is an array
        setLogs(Array.isArray(logsData) ? logsData.slice(0, 50) : []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setDevices([]);
        setLogs([]);
        setLoading(false);
      }
    };
    
    void loadData();
  }, []);

  const handleSync = async (deviceId: number) => {
    try {
      await fetch(`http://localhost:3000/biometric/devices/${deviceId}/sync`, {
        method: 'POST',
      });
      alert('Sync initiated successfully');
      fetchLogs();
    } catch (error) {
      console.error('Error syncing device:', error);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Biometric Device Management</h1>

      {/* Devices */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Devices</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {devices.map((device) => (
            <div key={device.id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{device.name}</h3>
                  <p className="text-sm text-gray-500">{device.deviceCode}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  device.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {device.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">Type:</span>
                  <span className="font-medium">{device.deviceType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Location:</span>
                  <span className="font-medium">{device.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">IP:</span>
                  <span className="font-medium">{device.ipAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Last Sync:</span>
                  <span className="font-medium">
                    {device.lastSyncAt ? new Date(device.lastSyncAt).toLocaleString() : 'Never'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleSync(device.id)}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Sync Now
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Logs */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Recent Logs (Last 50)</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Device</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{log.deviceId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{log.employeeId || 'Unknown'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{log.logType}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      log.isProcessed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {log.isProcessed ? 'Processed' : 'Pending'}
                    </span>
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
