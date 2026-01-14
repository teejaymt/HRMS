'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';

interface BiometricDevice {
  id: number;
  name: string;
  deviceType: string;
  location: string;
  ipAddress: string;
  port: number;
  serialNumber?: string;
  isActive: boolean;
  lastSyncAt?: string;
}

export default function BiometricDevicesPage() {
  const [devices, setDevices] = useState<BiometricDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDevice, setEditingDevice] = useState<BiometricDevice | null>(null);
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    deviceType: 'ZKTeco',
    location: '',
    ipAddress: '',
    port: 4370,
    serialNumber: '',
    isActive: true,
  });

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      const response = await fetch('http://localhost:3001/biometric/devices');
      const data = await response.json();
      setDevices(data);
    } catch (error) {
      console.error('Failed to fetch devices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingDevice
        ? `http://localhost:3001/biometric/devices/${editingDevice.id}`
        : 'http://localhost:3001/biometric/devices';
      
      const method = editingDevice ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          port: Number(formData.port),
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${editingDevice ? 'update' : 'register'} device`);
      }

      alert(`Device ${editingDevice ? 'updated' : 'registered'} successfully!`);
      setShowForm(false);
      setEditingDevice(null);
      resetForm();
      fetchDevices();
    } catch (error) {
      console.error('Failed to save device:', error);
      alert('Failed to save device');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      deviceType: 'ZKTeco',
      location: '',
      ipAddress: '',
      port: 4370,
      serialNumber: '',
      isActive: true,
    });
  };

  const handleEdit = (device: BiometricDevice) => {
    setEditingDevice(device);
    setFormData({
      name: device.name,
      deviceType: device.deviceType,
      location: device.location,
      ipAddress: device.ipAddress,
      port: device.port,
      serialNumber: device.serialNumber || '',
      isActive: device.isActive,
    });
    setShowForm(true);
  };

  const handleSync = async (deviceId: number) => {
    try {
      const response = await fetch(
        `http://localhost:3001/biometric/devices/${deviceId}/sync`,
        { method: 'POST' }
      );

      if (!response.ok) {
        throw new Error('Sync failed');
      }

      alert('Device sync initiated successfully!');
      fetchDevices();
    } catch (error) {
      console.error('Failed to sync device:', error);
      alert('Failed to sync device');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Biometric Device Management</h1>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingDevice(null);
            resetForm();
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : '+ Register Device'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingDevice ? 'Edit Device' : 'Register New Device'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">Device Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="e.g., Main Entrance Device"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Device Type *</label>
                <select
                  required
                  value={formData.deviceType}
                  onChange={(e) => setFormData({ ...formData, deviceType: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="ZKTeco">ZKTeco</option>
                  <option value="Anviz">Anviz</option>
                  <option value="RFID">RFID</option>
                  <option value="Fingerprint">Fingerprint</option>
                  <option value="Face Recognition">Face Recognition</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Location *</label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="e.g., Building A - Main Entrance"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">IP Address *</label>
                <input
                  type="text"
                  required
                  value={formData.ipAddress}
                  onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="e.g., 192.168.1.100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Port *</label>
                <input
                  type="number"
                  required
                  value={formData.port}
                  onChange={(e) => setFormData({ ...formData, port: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="4370"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Serial Number</label>
                <input
                  type="text"
                  value={formData.serialNumber}
                  onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Optional"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm font-medium">Active</span>
              </label>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingDevice(null);
                  resetForm();
                }}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                {editingDevice ? 'Update Device' : 'Register Device'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <h2 className="text-xl font-semibold p-4 border-b">Registered Devices</h2>
        {loading ? (
          <div className="p-4">Loading devices...</div>
        ) : devices.length === 0 ? (
          <div className="p-4 text-gray-500">No devices registered yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Location</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">IP Address</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Port</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Last Sync</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {devices.map((device) => (
                  <tr key={device.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{device.name}</td>
                    <td className="px-4 py-3 text-sm">{device.deviceType}</td>
                    <td className="px-4 py-3 text-sm">{device.location}</td>
                    <td className="px-4 py-3 text-sm font-mono">{device.ipAddress}</td>
                    <td className="px-4 py-3 text-sm">{device.port}</td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          device.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {device.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {device.lastSyncAt
                        ? new Date(device.lastSyncAt).toLocaleString()
                        : 'Never'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(device)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleSync(device.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Sync
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
