'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RecruitmentExcelUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResults(null);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert('Please select a file');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:3001/recruitment/applicants/upload-excel', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
      }

      const data = await response.json();
      setResults(data);
      alert(`Upload successful! Processed: ${data.processed}/${data.totalRecords} applicants`);
    } catch (error) {
      console.error('Upload failed:', error);
      alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    // Create template data
    const templateData = [
      {
        'Job Posting ID': '1',
        'Full Name': 'Mohammed Abdullah',
        'Email': 'mohammed.abdullah@example.com',
        'Phone': '+966501234567',
        'Nationality': 'Saudi Arabian',
        'Current Location': 'Riyadh, Saudi Arabia',
        'Years of Experience': '5',
        'Current Job Title': 'Senior Developer',
        'Current Company': 'Tech Solutions Inc',
        'Current Salary': '12000',
        'Expected Salary': '15000',
        'Notice Period (Days)': '30',
        'Education': 'Bachelor of Computer Science',
        'Skills': 'React, Node.js, TypeScript, AWS, MongoDB',
        'LinkedIn URL': 'https://linkedin.com/in/mohammedabdullah',
        'Portfolio URL': 'https://github.com/mohammedabdullah',
        'Source': 'LinkedIn',
      },
      {
        'Job Posting ID': '2',
        'Full Name': 'Sarah Ahmed',
        'Email': 'sarah.ahmed@example.com',
        'Phone': '+966509876543',
        'Nationality': 'Egyptian',
        'Current Location': 'Jeddah, Saudi Arabia',
        'Years of Experience': '3',
        'Current Job Title': 'HR Specialist',
        'Current Company': 'HR Consulting Group',
        'Current Salary': '8000',
        'Expected Salary': '10000',
        'Notice Period (Days)': '60',
        'Education': 'Master of Human Resources Management',
        'Skills': 'Recruitment, Talent Acquisition, HRIS, Employee Relations',
        'LinkedIn URL': 'https://linkedin.com/in/sarahahmed',
        'Portfolio URL': '',
        'Source': 'Indeed',
      },
    ];

    // Convert to CSV
    const headers = Object.keys(templateData[0]);
    const csv = [
      headers.join(','),
      ...templateData.map(row =>
        headers.map(header => {
          const value = row[header as keyof typeof row] || '';
          return `"${value}"`;
        }).join(',')
      ),
    ].join('\n');

    // Download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'talent_acquisition_template.csv';
    link.click();
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Talent Acquisition - Excel Upload</h1>

        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                Download the template, have candidates fill in their information, and upload the Excel/CSV file to bulk import applicant data.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Step 1: Download Template</h2>
          <button
            onClick={downloadTemplate}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
          >
            📥 Download Talent Acquisition Template
          </button>
          <p className="mt-2 text-sm text-gray-600">
            Download the template with sample applicant data and all required columns.
          </p>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Step 2: Upload Completed File</h2>
          <form onSubmit={handleUpload}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Select Excel/CSV File</label>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border rounded"
              />
              {file && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={!file || uploading}
              className={`px-6 py-2 rounded ${
                !file || uploading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
            >
              {uploading ? 'Uploading...' : 'Upload & Import Applicants'}
            </button>
          </form>

          {results && (
            <div className="mt-6 border-t pt-4">
              <h3 className="font-semibold mb-2">Upload Results</h3>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-gray-100 p-3 rounded">
                  <div className="text-sm text-gray-600">Total Applicants</div>
                  <div className="text-2xl font-bold">{results.totalRecords}</div>
                </div>
                <div className="bg-green-100 p-3 rounded">
                  <div className="text-sm text-green-600">Processed</div>
                  <div className="text-2xl font-bold text-green-700">{results.processed}</div>
                </div>
                <div className="bg-red-100 p-3 rounded">
                  <div className="text-sm text-red-600">Errors</div>
                  <div className="text-2xl font-bold text-red-700">{results.errors}</div>
                </div>
              </div>

              {results.details.errors.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium text-red-600 mb-2">Errors:</h4>
                  <div className="max-h-60 overflow-y-auto bg-red-50 p-3 rounded">
                    {results.details.errors.map((error: any, index: number) => (
                      <div key={index} className="mb-2 text-sm">
                        <span className="font-medium">Row {index + 1}:</span> {error.error}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => router.push('/recruitment')}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  View Applicants List
                </button>
                <button
                  onClick={() => {
                    setFile(null);
                    setResults(null);
                  }}
                  className="border px-4 py-2 rounded hover:bg-gray-100"
                >
                  Upload Another File
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 mt-6">
          <h2 className="text-lg font-semibold mb-4">Template Columns</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-medium mb-2">Required Information</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Job Posting ID (if applicable)</li>
                <li>Full Name *</li>
                <li>Email *</li>
                <li>Phone *</li>
                <li>Nationality</li>
                <li>Current Location</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">Experience & Salary</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Years of Experience</li>
                <li>Current Job Title</li>
                <li>Current Company</li>
                <li>Current Salary</li>
                <li>Expected Salary</li>
                <li>Notice Period (Days)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">Qualifications</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Education</li>
                <li>Skills (comma-separated)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">Additional</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>LinkedIn URL</li>
                <li>Portfolio URL</li>
                <li>Source (how they found job)</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Note:</strong> All applicants uploaded will have status "NEW" and stage "APPLICATION_REVIEW". You can review and update their status in the recruitment module.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
