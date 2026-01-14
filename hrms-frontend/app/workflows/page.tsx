'use client';

import { useState, useEffect } from 'react';

interface WorkflowDefinition {
  id: number;
  name: string;
  description: string;
  entityType: string;
  isActive: boolean;
}

interface PendingApproval {
  id: number;
  entityType: string;
  entityId: number;
  status: string;
  initiatedBy: string;
  currentStep: number;
}

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<WorkflowDefinition[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWorkflows = async () => {
    try {
      const response = await fetch('http://localhost:3000/workflows/definitions');
      const data = await response.json();
      
      // Ensure data is an array
      if (Array.isArray(data)) {
        setWorkflows(data as WorkflowDefinition[]);
      } else {
        console.warn('Workflows response is not an array:', data);
        setWorkflows([]);
      }
    } catch (error) {
      console.error('Error fetching workflows:', error);
      setWorkflows([]);
    }
  };

  const fetchPendingApprovals = async () => {
    try {
      const response = await fetch('http://localhost:3000/workflows/pending-approvals');
      const data = await response.json();
      
      // Ensure data is an array
      if (Array.isArray(data)) {
        setPendingApprovals(data as PendingApproval[]);
      } else {
        console.warn('Pending approvals response is not an array:', data);
        setPendingApprovals([]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
      setPendingApprovals([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchWorkflows();
      await fetchPendingApprovals();
    };
    
    void loadData();
  }, []);

  const handleApprove = async (instanceId: number) => {
    try {
      const email = localStorage.getItem('userEmail') || 'admin@company.sa';
      await fetch(`http://localhost:3000/workflows/instances/${instanceId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actorEmail: email, comments: 'Approved' }),
      });
      fetchPendingApprovals();
    } catch (error) {
      console.error('Error approving workflow:', error);
    }
  };

  const handleReject = async (instanceId: number) => {
    try {
      const email = localStorage.getItem('userEmail') || 'admin@company.sa';
      await fetch(`http://localhost:3000/workflows/instances/${instanceId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actorEmail: email, comments: 'Rejected' }),
      });
      fetchPendingApprovals();
    } catch (error) {
      console.error('Error rejecting workflow:', error);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Workflow Management</h1>

      {/* Pending Approvals */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Pending Approvals ({pendingApprovals.length})</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {pendingApprovals.length === 0 ? (
            <p className="p-4 text-gray-500">No pending approvals</p>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entity ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Initiated By</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Step</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingApprovals.map((approval) => (
                  <tr key={approval.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{approval.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{approval.entityType}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{approval.entityId}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                        {approval.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{approval.initiatedBy}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{approval.currentStep}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleApprove(approval.id)}
                        className="text-green-600 hover:text-green-900 mr-3"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(approval.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Workflow Definitions */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Workflow Definitions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workflows.map((workflow) => (
            <div key={workflow.id} className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">{workflow.name}</h3>
              <p className="text-gray-600 text-sm mb-4">{workflow.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">{workflow.entityType}</span>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  workflow.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {workflow.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
