'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';

interface ApprovalStep {
  stepNumber: number;
  approverRole: string;
  approverUserId?: number;
  requiresAllApprovers: boolean;
}

interface WorkflowDefinition {
  id: number;
  name: string;
  description?: string;
  entityType: string;
  approvalSteps: ApprovalStep[];
  isActive: boolean;
}

export default function WorkflowConfigPage() {
  const [workflows, setWorkflows] = useState<WorkflowDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    entityType: 'LEAVE_REQUEST',
    isActive: true,
  });

  const [steps, setSteps] = useState<ApprovalStep[]>([
    { stepNumber: 1, approverRole: 'MANAGER', approverUserId: undefined, requiresAllApprovers: false },
  ]);

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      const response = await fetch('http://localhost:3001/workflows/definitions');
      const data = await response.json();
      setWorkflows(data);
    } catch (error) {
      console.error('Failed to fetch workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/workflows/definitions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          approvalSteps: steps,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create workflow');
      }

      alert('Workflow created successfully!');
      setShowForm(false);
      resetForm();
      fetchWorkflows();
    } catch (error) {
      console.error('Failed to create workflow:', error);
      alert('Failed to create workflow');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      entityType: 'LEAVE_REQUEST',
      isActive: true,
    });
    setSteps([
      { stepNumber: 1, approverRole: 'MANAGER', approverUserId: undefined, requiresAllApprovers: false },
    ]);
  };

  const addStep = () => {
    setSteps([
      ...steps,
      {
        stepNumber: steps.length + 1,
        approverRole: 'MANAGER',
        approverUserId: undefined,
        requiresAllApprovers: false,
      },
    ]);
  };

  const removeStep = (index: number) => {
    const newSteps = steps.filter((_, i) => i !== index);
    // Renumber steps
    newSteps.forEach((step, i) => {
      step.stepNumber = i + 1;
    });
    setSteps(newSteps);
  };

  const updateStep = (index: number, field: keyof ApprovalStep, value: any) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setSteps(newSteps);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Workflow Configuration</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : '+ Create Workflow'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Create New Workflow</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">Workflow Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="e.g., Leave Approval Workflow"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Entity Type *</label>
                <select
                  required
                  value={formData.entityType}
                  onChange={(e) => setFormData({ ...formData, entityType: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="LEAVE_REQUEST">Leave Request</option>
                  <option value="ADVANCE_REQUEST">Advance Request</option>
                  <option value="TICKET_REQUEST">Ticket Request</option>
                  <option value="PURCHASE_ORDER">Purchase Order</option>
                  <option value="EXPENSE_CLAIM">Expense Claim</option>
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                rows={3}
                placeholder="Describe the workflow purpose"
              />
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

            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium">Approval Steps *</label>
                <button
                  type="button"
                  onClick={addStep}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  + Add Step
                </button>
              </div>

              {steps.map((step, index) => (
                <div key={index} className="border p-4 rounded mb-2 bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">Step {step.stepNumber}</h4>
                    {steps.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeStep(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm mb-1">Approver Role *</label>
                      <select
                        required
                        value={step.approverRole}
                        onChange={(e) => updateStep(index, 'approverRole', e.target.value)}
                        className="w-full px-2 py-1 border rounded text-sm"
                      >
                        <option value="MANAGER">Manager</option>
                        <option value="HR">HR</option>
                        <option value="ADMIN">Admin</option>
                        <option value="FINANCE">Finance</option>
                        <option value="DEPARTMENT_HEAD">Department Head</option>
                      </select>
                    </div>

                    <div>
                      <label className="flex items-center mt-6">
                        <input
                          type="checkbox"
                          checked={step.requiresAllApprovers}
                          onChange={(e) => updateStep(index, 'requiresAllApprovers', e.target.checked)}
                          className="mr-2"
                        />
                        <span className="text-sm">Requires All Approvers</span>
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
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
                Create Workflow
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <h2 className="text-xl font-semibold p-4 border-b">Existing Workflows</h2>
        {loading ? (
          <div className="p-4">Loading workflows...</div>
        ) : workflows.length === 0 ? (
          <div className="p-4 text-gray-500">No workflows configured yet.</div>
        ) : (
          <div className="divide-y">
            {workflows.map((workflow) => (
              <div key={workflow.id} className="p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{workflow.name}</h3>
                    <p className="text-sm text-gray-600">{workflow.description}</p>
                    <div className="mt-2 flex gap-4 text-sm">
                      <span className="text-gray-600">
                        <span className="font-medium">Entity:</span> {workflow.entityType.replace(/_/g, ' ')}
                      </span>
                      <span className={workflow.isActive ? 'text-green-600' : 'text-gray-400'}>
                        {workflow.isActive ? '● Active' : '○ Inactive'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-3">
                  <h4 className="text-sm font-medium mb-2">Approval Steps:</h4>
                  <div className="flex gap-2">
                    {workflow.approvalSteps?.map((step, index) => (
                      <div
                        key={index}
                        className="bg-blue-50 border border-blue-200 rounded px-3 py-1 text-sm"
                      >
                        <span className="font-medium">Step {step.stepNumber}:</span> {step.approverRole}
                        {step.requiresAllApprovers && (
                          <span className="text-xs text-blue-600 ml-1">(All required)</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
