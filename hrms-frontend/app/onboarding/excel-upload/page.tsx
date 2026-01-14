'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OnboardingExcelUploadPage() {
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
      const response = await fetch('http://localhost:3001/onboarding/upload-excel', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
      }

      const data = await response.json();
      setResults(data);
      alert(`Upload successful! Processed: ${data.processed}/${data.totalRecords} records`);
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
        'First Name': 'Ahmed',
        'Last Name': 'AlSaeed',
        'First Name (Arabic)': 'أحمد',
        'Last Name (Arabic)': 'السعيد',
        'Email': 'ahmed.alsaeed@example.com',
        'Phone': '+966501234567',
        'Date of Birth': '1990-01-15',
        'Gender': 'MALE',
        'Nationality': 'Saudi Arabian',
        'Is Saudi': 'Yes',
        'National ID / Saudi ID': '1234567890',
        'Iqama Number': '',
        'Iqama Expiry': '',
        'Passport Number': 'A12345678',
        'Passport Expiry': '2028-06-30',
        'Address': '123 King Fahd Road',
        'City': 'Riyadh',
        'Postal Code': '12345',
        'Emergency Contact Name': 'Fatima AlSaeed',
        'Emergency Contact Phone': '+966509876543',
        'Emergency Contact Relation': 'Wife',
        'Department ID': '1',
        'Position': 'Software Engineer',
        'Contract Type': 'UNLIMITED',
        'Joining Date': '2024-02-01',
        'Basic Salary': '15000',
        'Housing Allowance': '3000',
        'Transport Allowance': '1000',
        'Food Allowance': '500',
        'Bank Name': 'Al Rajhi Bank',
        'Bank Account Number': '123456789012',
        'IBAN': 'SA1234567890123456789012',
        'Skills': 'JavaScript, React, Node.js, SQL',
        'Education 1 - Degree': 'Bachelor',
        'Education 1 - Field': 'Computer Science',
        'Education 1 - Institution': 'King Saud University',
        'Education 1 - Start Date': '2008-09-01',
        'Education 1 - End Date': '2012-06-30',
        'Education 1 - Grade': '3.8/4.0',
        'Experience 1 - Company': 'Tech Corp',
        'Experience 1 - Position': 'Junior Developer',
        'Experience 1 - Start Date': '2012-07-01',
        'Experience 1 - End Date': '2015-12-31',
        'Experience 1 - Description': 'Developed web applications',
        'Certification 1 - Name': 'AWS Certified Developer',
        'Certification 1 - Issuer': 'Amazon Web Services',
        'Certification 1 - Issue Date': '2020-01-15',
        'Certification 1 - Expiry Date': '2023-01-15',
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
    link.download = 'onboarding_template.csv';
    link.click();
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Onboarding - Excel Upload</h1>

        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                Download the template, fill in candidate information, and upload the Excel/CSV file to bulk import onboarding data.
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
            📥 Download Excel Template
          </button>
          <p className="mt-2 text-sm text-gray-600">
            Download the template with sample data and all required columns.
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
              {uploading ? 'Uploading...' : 'Upload & Import'}
            </button>
          </form>

          {results && (
            <div className="mt-6 border-t pt-4">
              <h3 className="font-semibold mb-2">Upload Results</h3>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-gray-100 p-3 rounded">
                  <div className="text-sm text-gray-600">Total Records</div>
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
                  onClick={() => router.push('/onboarding')}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  View Onboarding List
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
          <h2 className="text-lg font-semibold mb-4">Required Columns</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-medium mb-2">Personal Information</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>First Name</li>
                <li>Last Name</li>
                <li>Email</li>
                <li>Phone</li>
                <li>Date of Birth</li>
                <li>Gender</li>
                <li>Nationality</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">Employment</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Position</li>
                <li>Department ID</li>
                <li>Contract Type</li>
                <li>Joining Date</li>
                <li>Basic Salary</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">Saudi Compliance</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Is Saudi (Yes/No)</li>
                <li>National ID / Iqama Number</li>
                <li>Passport Number</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">Optional (Multiple)</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Education 1-5</li>
                <li>Experience 1-5</li>
                <li>Certification 1-5</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
