'use client';

import { useState, useEffect } from 'react';

interface JobPosting {
  id: number;
  jobTitle: string;
  jobTitleArabic?: string;
  status: string;
  experienceYears?: number;
  educationLevel?: string;
  salaryMin?: number;
  salaryMax?: number;
  vacancies?: number;
}

interface Applicant {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  jobPostingId: number;
  currentStage: string;
  score?: number;
}

export default function RecruitmentPage() {
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [activeTab, setActiveTab] = useState('jobs');
  const [loading, setLoading] = useState(true);

  const fetchJobPostings = async () => {
    try {
      const response = await fetch('http://localhost:3000/recruitment/job-postings');
      const data = await response.json();
      setJobPostings(data as JobPosting[]);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching job postings:', error);
      setLoading(false);
    }
  };

  const fetchApplicants = async () => {
    try {
      const response = await fetch('http://localhost:3000/recruitment/applicants');
      const data = await response.json();
      setApplicants(data as Applicant[]);
    } catch (error) {
      console.error('Error fetching applicants:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchJobPostings(), fetchApplicants()]);
    };
    loadData();
  }, []);

  const handlePublish = async (id: number) => {
    try {
      await fetch(`http://localhost:3000/recruitment/job-postings/${id}/publish`, {
        method: 'POST',
      });
      fetchJobPostings();
    } catch (error) {
      console.error('Error publishing job:', error);
    }
  };

  const handleShortlist = async (id: number) => {
    try {
      await fetch(`http://localhost:3000/recruitment/applicants/${id}/shortlist`, {
        method: 'POST',
      });
      fetchApplicants();
    } catch (error) {
      console.error('Error shortlisting applicant:', error);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Recruitment & Talent Acquisition</h1>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('jobs')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'jobs'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Job Postings ({jobPostings.length})
          </button>
          <button
            onClick={() => setActiveTab('applicants')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'applicants'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Applicants ({applicants.length})
          </button>
        </nav>
      </div>

      {/* Job Postings Tab */}
      {activeTab === 'jobs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobPostings.map((job) => (
            <div key={job.id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{job.jobTitle}</h3>
                  <p className="text-sm text-gray-500">{job.jobTitleArabic}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  job.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' :
                  job.status === 'DRAFT' ? 'bg-gray-100 text-gray-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {job.status}
                </span>
              </div>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">Experience:</span>
                  <span className="font-medium">{job.experienceYears} years</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Education:</span>
                  <span className="font-medium">{job.educationLevel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Salary Range:</span>
                  <span className="font-medium">{job.salaryMin?.toLocaleString()} - {job.salaryMax?.toLocaleString()} SAR</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Vacancies:</span>
                  <span className="font-medium">{job.vacancies}</span>
                </div>
              </div>
              {job.status === 'DRAFT' && (
                <button
                  onClick={() => handlePublish(job.id)}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Publish
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Applicants Tab */}
      {activeTab === 'applicants' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Job</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stage</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {applicants.map((applicant) => (
                <tr key={applicant.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{applicant.fullName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{applicant.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{applicant.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{applicant.jobPostingId}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                      {applicant.currentStage}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{applicant.score || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {applicant.currentStage === 'APPLICATION_REVIEW' && (
                      <button
                        onClick={() => handleShortlist(applicant.id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Shortlist
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
