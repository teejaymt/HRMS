'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

export default function OnboardingPage() {
  const { user } = useAuth();
  const [onboardings, setOnboardings] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<any>({
    // Personal Info
    firstName: '',
    lastName: '',
    firstNameArabic: '',
    lastNameArabic: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: 'MALE',
    nationality: '',
    isSaudi: false,
    nationalId: '',
    iqamaNumber: '',
    iqamaExpiry: '',
    passportNumber: '',
    passportExpiry: '',
    address: '',
    city: '',
    postalCode: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
    // Employment
    departmentId: '',
    position: '',
    contractType: 'FULL_TIME',
    joiningDate: '',
    basicSalary: '',
    housingAllowance: '',
    transportAllowance: '',
    foodAllowance: '',
    bankName: '',
    bankAccountNumber: '',
    iban: '',
    // Related data
    experiences: [],
    education: [],
    certificates: [],
    status: 'PENDING',
    createdBy: user?.email || 'system',
  });

  const [experience, setExperience] = useState({
    companyName: '',
    position: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    responsibilities: '',
    reasonForLeaving: '',
  });

  const [education, setEducation] = useState({
    institution: '',
    degree: '',
    fieldOfStudy: '',
    startDate: '',
    endDate: '',
    grade: '',
  });

  const [certificate, setCertificate] = useState({
    name: '',
    issuingOrganization: '',
    issueDate: '',
    expiryDate: '',
    credentialId: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [onboardingsData, departmentsData] = await Promise.all([
        api.getOnboardings(),
        api.getDepartments(),
      ]);
      setOnboardings(onboardingsData as any[]);
      setDepartments(departmentsData as any[]);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const addExperience = () => {
    if (experience.companyName && experience.position) {
      setFormData({
        ...formData,
        experiences: [...formData.experiences, { ...experience }],
      });
      setExperience({
        companyName: '',
        position: '',
        startDate: '',
        endDate: '',
        isCurrent: false,
        responsibilities: '',
        reasonForLeaving: '',
      });
    }
  };

  const removeExperience = (index: number) => {
    setFormData({
      ...formData,
      experiences: formData.experiences.filter((_: any, i: number) => i !== index),
    });
  };

  const addEducation = () => {
    if (education.institution && education.degree) {
      setFormData({
        ...formData,
        education: [...formData.education, { ...education }],
      });
      setEducation({
        institution: '',
        degree: '',
        fieldOfStudy: '',
        startDate: '',
        endDate: '',
        grade: '',
      });
    }
  };

  const removeEducation = (index: number) => {
    setFormData({
      ...formData,
      education: formData.education.filter((_: any, i: number) => i !== index),
    });
  };

  const addCertificate = () => {
    if (certificate.name && certificate.issuingOrganization) {
      setFormData({
        ...formData,
        certificates: [...formData.certificates, { ...certificate }],
      });
      setCertificate({
        name: '',
        issuingOrganization: '',
        issueDate: '',
        expiryDate: '',
        credentialId: '',
      });
    }
  };

  const removeCertificate = (index: number) => {
    setFormData({
      ...formData,
      certificates: formData.certificates.filter((_: any, i: number) => i !== index),
    });
  };

  const handleSubmit = async () => {
    try {
      const submitData = {
        ...formData,
        departmentId: formData.departmentId ? Number(formData.departmentId) : null,
        basicSalary: formData.basicSalary ? Number(formData.basicSalary) : null,
        housingAllowance: formData.housingAllowance ? Number(formData.housingAllowance) : null,
        transportAllowance: formData.transportAllowance ? Number(formData.transportAllowance) : null,
        foodAllowance: formData.foodAllowance ? Number(formData.foodAllowance) : null,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : null,
        iqamaExpiry: formData.iqamaExpiry ? new Date(formData.iqamaExpiry).toISOString() : null,
        passportExpiry: formData.passportExpiry ? new Date(formData.passportExpiry).toISOString() : null,
        joiningDate: formData.joiningDate ? new Date(formData.joiningDate).toISOString() : null,
        experiences: formData.experiences.map((exp: any) => ({
          ...exp,
          startDate: new Date(exp.startDate).toISOString(),
          endDate: exp.endDate ? new Date(exp.endDate).toISOString() : null,
        })),
        education: formData.education.map((edu: any) => ({
          ...edu,
          startDate: new Date(edu.startDate).toISOString(),
          endDate: edu.endDate ? new Date(edu.endDate).toISOString() : null,
        })),
        certificates: formData.certificates.map((cert: any) => ({
          ...cert,
          issueDate: new Date(cert.issueDate).toISOString(),
          expiryDate: cert.expiryDate ? new Date(cert.expiryDate).toISOString() : null,
        })),
      };

      if (editingId) {
        await api.updateOnboarding(editingId, submitData);
        alert('Onboarding updated successfully!');
      } else {
        await api.createOnboarding(submitData);
        alert('Onboarding created successfully!');
      }
      setShowForm(false);
      setCurrentStep(1);
      setEditingId(null);
      fetchData();
      resetForm();
    } catch (error: unknown) {
      alert(`Failed to ${editingId ? 'update' : 'create'} onboarding: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      firstNameArabic: '',
      lastNameArabic: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: 'MALE',
      nationality: '',
      isSaudi: false,
      nationalId: '',
      iqamaNumber: '',
      iqamaExpiry: '',
      passportNumber: '',
      passportExpiry: '',
      address: '',
      city: '',
      postalCode: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      emergencyContactRelation: '',
      departmentId: '',
      position: '',
      contractType: 'FULL_TIME',
      joiningDate: '',
      basicSalary: '',
      housingAllowance: '',
      transportAllowance: '',
      foodAllowance: '',
      bankName: '',
      bankAccountNumber: '',
      iban: '',
      experiences: [],
      education: [],
      certificates: [],
      status: 'PENDING',
      createdBy: user?.email || 'system',
    });
  };

  const handleCompleteOnboarding = async (id: number) => {
    if (!confirm('Complete this onboarding and create employee record?')) return;

    try {
      await api.completeOnboarding(id, user?.email || 'system');
      alert('Onboarding completed and employee record created successfully!');
      fetchData();
    } catch (error: unknown) {
      alert(`Failed to complete onboarding: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleEdit = (onboarding: typeof formData) => {
    setEditingId(onboarding.id);
    setFormData({
      firstName: onboarding.firstName || '',
      lastName: onboarding.lastName || '',
      firstNameArabic: onboarding.firstNameArabic || '',
      lastNameArabic: onboarding.lastNameArabic || '',
      email: onboarding.email || '',
      phone: onboarding.phone || '',
      dateOfBirth: onboarding.dateOfBirth ? new Date(onboarding.dateOfBirth).toISOString().split('T')[0] : '',
      gender: onboarding.gender || 'MALE',
      nationality: onboarding.nationality || '',
      isSaudi: onboarding.isSaudi || false,
      nationalId: onboarding.nationalId || '',
      iqamaNumber: onboarding.iqamaNumber || '',
      iqamaExpiry: onboarding.iqamaExpiry ? new Date(onboarding.iqamaExpiry).toISOString().split('T')[0] : '',
      passportNumber: onboarding.passportNumber || '',
      passportExpiry: onboarding.passportExpiry ? new Date(onboarding.passportExpiry).toISOString().split('T')[0] : '',
      address: onboarding.address || '',
      city: onboarding.city || '',
      postalCode: onboarding.postalCode || '',
      emergencyContactName: onboarding.emergencyContactName || '',
      emergencyContactPhone: onboarding.emergencyContactPhone || '',
      emergencyContactRelation: onboarding.emergencyContactRelation || '',
      departmentId: onboarding.departmentId?.toString() || '',
      position: onboarding.position || '',
      contractType: onboarding.contractType || 'FULL_TIME',
      joiningDate: onboarding.joiningDate ? new Date(onboarding.joiningDate).toISOString().split('T')[0] : '',
      basicSalary: onboarding.basicSalary?.toString() || '',
      housingAllowance: onboarding.housingAllowance?.toString() || '',
      transportAllowance: onboarding.transportAllowance?.toString() || '',
      foodAllowance: onboarding.foodAllowance?.toString() || '',
      bankName: onboarding.bankName || '',
      bankAccountNumber: onboarding.bankAccountNumber || '',
      iban: onboarding.iban || '',
      experiences: onboarding.experiences?.map((exp: any) => ({
        ...exp,
        startDate: exp.startDate ? new Date(exp.startDate).toISOString().split('T')[0] : '',
        endDate: exp.endDate ? new Date(exp.endDate).toISOString().split('T')[0] : '',
      })) || [],
      education: onboarding.education?.map((edu: any) => ({
        ...edu,
        startDate: edu.startDate ? new Date(edu.startDate).toISOString().split('T')[0] : '',
        endDate: edu.endDate ? new Date(edu.endDate).toISOString().split('T')[0] : '',
      })) || [],
      certificates: onboarding.certificates?.map((cert: any) => ({
        ...cert,
        issueDate: cert.issueDate ? new Date(cert.issueDate).toISOString().split('T')[0] : '',
        expiryDate: cert.expiryDate ? new Date(cert.expiryDate).toISOString().split('T')[0] : '',
      })) || [],
      status: onboarding.status || 'PENDING',
      createdBy: onboarding.createdBy || user?.email || 'system',
    });
    setShowForm(true);
    setCurrentStep(1);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this onboarding record?')) return;

    try {
      await api.deleteOnboarding(id);
      alert('Onboarding deleted successfully!');
      fetchData();
    } catch (error: unknown) {
      alert(`Failed to delete onboarding: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  if (loading) {
    return <div className="text-gray-600">Loading onboarding data...</div>;
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employee Onboarding</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage new employee onboarding process
          </p>
        </div>
        <button
          onClick={() => {
            if (showForm) {
              setShowForm(false);
              setEditingId(null);
              resetForm();
            } else {
              setEditingId(null);
              resetForm();
              setShowForm(true);
            }
          }}
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : 'New Onboarding'}
        </button>
      </div>

      {showForm && (
        <div className="mb-8 rounded-lg bg-white p-6 shadow">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingId ? 'Edit Employee Onboarding' : 'New Employee Onboarding'}
              </h2>
              <div className="text-sm text-gray-500">Step {currentStep} of 4</div>
            </div>
            <div className="mt-4 flex gap-2">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`h-2 flex-1 rounded ${
                    step <= currentStep ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">First Name (Arabic)</label>
                  <input
                    type="text"
                    name="firstNameArabic"
                    value={formData.firstNameArabic}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 font-arabic text-gray-900"
                    dir="rtl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Name (Arabic)</label>
                  <input
                    type="text"
                    name="lastNameArabic"
                    value={formData.lastNameArabic}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 font-arabic text-gray-900"
                    dir="rtl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date of Birth *</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Gender *</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nationality *</label>
                  <input
                    type="text"
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isSaudi"
                    checked={formData.isSaudi}
                    onChange={handleInputChange}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <label className="ml-2 text-sm font-medium text-gray-700">Saudi National</label>
                </div>
                {formData.isSaudi ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">National ID</label>
                    <input
                      type="text"
                      name="nationalId"
                      value={formData.nationalId}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                    />
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Iqama Number</label>
                      <input
                        type="text"
                        name="iqamaNumber"
                        value={formData.iqamaNumber}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Iqama Expiry</label>
                      <input
                        type="date"
                        name="iqamaExpiry"
                        value={formData.iqamaExpiry}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                      />
                    </div>
                  </>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Passport Number</label>
                  <input
                    type="text"
                    name="passportNumber"
                    value={formData.passportNumber}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Passport Expiry</label>
                  <input
                    type="date"
                    name="passportExpiry"
                    value={formData.passportExpiry}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Postal Code</label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                  />
                </div>
              </div>

              <h4 className="mt-6 text-md font-medium text-gray-900">Emergency Contact</h4>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact Name</label>
                  <input
                    type="text"
                    name="emergencyContactName"
                    value={formData.emergencyContactName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact Phone</label>
                  <input
                    type="tel"
                    name="emergencyContactPhone"
                    value={formData.emergencyContactPhone}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Relation</label>
                  <input
                    type="text"
                    name="emergencyContactRelation"
                    value={formData.emergencyContactRelation}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                  />
                </div>
              </div>

              <h4 className="mt-6 text-md font-medium text-gray-900">Employment Details</h4>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Department</label>
                  <select
                    name="departmentId"
                    value={formData.departmentId}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Position</label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contract Type</label>
                  <select
                    name="contractType"
                    value={formData.contractType}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                  >
                    <option value="FULL_TIME">Full Time</option>
                    <option value="PART_TIME">Part Time</option>
                    <option value="CONTRACT">Contract</option>
                    <option value="TEMPORARY">Temporary</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Joining Date</label>
                  <input
                    type="date"
                    name="joiningDate"
                    value={formData.joiningDate}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Basic Salary (SAR)</label>
                  <input
                    type="number"
                    name="basicSalary"
                    value={formData.basicSalary}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Housing Allowance (SAR)</label>
                  <input
                    type="number"
                    name="housingAllowance"
                    value={formData.housingAllowance}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Transport Allowance (SAR)</label>
                  <input
                    type="number"
                    name="transportAllowance"
                    value={formData.transportAllowance}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Food Allowance (SAR)</label>
                  <input
                    type="number"
                    name="foodAllowance"
                    value={formData.foodAllowance}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                  />
                </div>
              </div>

              <h4 className="mt-6 text-md font-medium text-gray-900">Bank Details</h4>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bank Name</label>
                  <input
                    type="text"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Account Number</label>
                  <input
                    type="text"
                    name="bankAccountNumber"
                    value={formData.bankAccountNumber}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">IBAN</label>
                  <input
                    type="text"
                    name="iban"
                    value={formData.iban}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  Next: Experience
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Experience */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Work Experience</h3>
              
              <div className="rounded-md bg-gray-50 p-4">
                <h4 className="mb-3 text-sm font-medium text-gray-700">Add Experience</h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Company Name</label>
                    <input
                      type="text"
                      value={experience.companyName}
                      onChange={(e) => setExperience({ ...experience, companyName: e.target.value })}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Position</label>
                    <input
                      type="text"
                      value={experience.position}
                      onChange={(e) => setExperience({ ...experience, position: e.target.value })}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Start Date</label>
                    <input
                      type="date"
                      value={experience.startDate}
                      onChange={(e) => setExperience({ ...experience, startDate: e.target.value })}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">End Date</label>
                    <input
                      type="date"
                      value={experience.endDate}
                      onChange={(e) => setExperience({ ...experience, endDate: e.target.value })}
                      disabled={experience.isCurrent}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                    />
                  </div>
                  <div className="flex items-center md:col-span-2">
                    <input
                      type="checkbox"
                      checked={experience.isCurrent}
                      onChange={(e) => setExperience({ ...experience, isCurrent: e.target.checked, endDate: '' })}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <label className="ml-2 text-sm font-medium text-gray-700">Currently Working Here</label>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Responsibilities</label>
                    <textarea
                      value={experience.responsibilities}
                      onChange={(e) => setExperience({ ...experience, responsibilities: e.target.value })}
                      rows={3}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                    />
                  </div>
                </div>
                <button
                  onClick={addExperience}
                  className="mt-4 rounded-md bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
                >
                  Add Experience
                </button>
              </div>

              {formData.experiences.length > 0 && (
                <div>
                  <h4 className="mb-3 text-sm font-medium text-gray-700">Added Experience</h4>
                  {formData.experiences.map((exp: any, index: number) => (
                    <div key={index} className="mb-2 flex items-center justify-between rounded-md bg-gray-100 p-3">
                      <div>
                        <p className="font-medium text-gray-900">{exp.position} at {exp.companyName}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(exp.startDate).toLocaleDateString()} - {exp.isCurrent ? 'Present' : new Date(exp.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => removeExperience(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 flex justify-between">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="rounded-md bg-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-400"
                >
                  Back
                </button>
                <button
                  onClick={() => setCurrentStep(3)}
                  className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  Next: Education
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Education */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Education</h3>
              
              <div className="rounded-md bg-gray-50 p-4">
                <h4 className="mb-3 text-sm font-medium text-gray-700">Add Education</h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Institution</label>
                    <input
                      type="text"
                      value={education.institution}
                      onChange={(e) => setEducation({ ...education, institution: e.target.value })}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Degree</label>
                    <input
                      type="text"
                      value={education.degree}
                      onChange={(e) => setEducation({ ...education, degree: e.target.value })}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Field of Study</label>
                    <input
                      type="text"
                      value={education.fieldOfStudy}
                      onChange={(e) => setEducation({ ...education, fieldOfStudy: e.target.value })}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Grade/GPA</label>
                    <input
                      type="text"
                      value={education.grade}
                      onChange={(e) => setEducation({ ...education, grade: e.target.value })}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Start Date</label>
                    <input
                      type="date"
                      value={education.startDate}
                      onChange={(e) => setEducation({ ...education, startDate: e.target.value })}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">End Date</label>
                    <input
                      type="date"
                      value={education.endDate}
                      onChange={(e) => setEducation({ ...education, endDate: e.target.value })}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                    />
                  </div>
                </div>
                <button
                  onClick={addEducation}
                  className="mt-4 rounded-md bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
                >
                  Add Education
                </button>
              </div>

              {formData.education.length > 0 && (
                <div>
                  <h4 className="mb-3 text-sm font-medium text-gray-700">Added Education</h4>
                  {formData.education.map((edu: any, index: number) => (
                    <div key={index} className="mb-2 flex items-center justify-between rounded-md bg-gray-100 p-3">
                      <div>
                        <p className="font-medium text-gray-900">{edu.degree} in {edu.fieldOfStudy}</p>
                        <p className="text-sm text-gray-600">{edu.institution}</p>
                      </div>
                      <button
                        onClick={() => removeEducation(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 flex justify-between">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="rounded-md bg-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-400"
                >
                  Back
                </button>
                <button
                  onClick={() => setCurrentStep(4)}
                  className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  Next: Certificates
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Certificates */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Certificates & Licenses</h3>
              
              <div className="rounded-md bg-gray-50 p-4">
                <h4 className="mb-3 text-sm font-medium text-gray-700">Add Certificate</h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Certificate Name</label>
                    <input
                      type="text"
                      value={certificate.name}
                      onChange={(e) => setCertificate({ ...certificate, name: e.target.value })}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Issuing Organization</label>
                    <input
                      type="text"
                      value={certificate.issuingOrganization}
                      onChange={(e) => setCertificate({ ...certificate, issuingOrganization: e.target.value })}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Issue Date</label>
                    <input
                      type="date"
                      value={certificate.issueDate}
                      onChange={(e) => setCertificate({ ...certificate, issueDate: e.target.value })}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Expiry Date (Optional)</label>
                    <input
                      type="date"
                      value={certificate.expiryDate}
                      onChange={(e) => setCertificate({ ...certificate, expiryDate: e.target.value })}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Credential ID</label>
                    <input
                      type="text"
                      value={certificate.credentialId}
                      onChange={(e) => setCertificate({ ...certificate, credentialId: e.target.value })}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                    />
                  </div>
                </div>
                <button
                  onClick={addCertificate}
                  className="mt-4 rounded-md bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
                >
                  Add Certificate
                </button>
              </div>

              {formData.certificates.length > 0 && (
                <div>
                  <h4 className="mb-3 text-sm font-medium text-gray-700">Added Certificates</h4>
                  {formData.certificates.map((cert: any, index: number) => (
                    <div key={index} className="mb-2 flex items-center justify-between rounded-md bg-gray-100 p-3">
                      <div>
                        <p className="font-medium text-gray-900">{cert.name}</p>
                        <p className="text-sm text-gray-600">{cert.issuingOrganization}</p>
                      </div>
                      <button
                        onClick={() => removeCertificate(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 flex justify-between">
                <button
                  onClick={() => setCurrentStep(3)}
                  className="rounded-md bg-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-400"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  {editingId ? 'Update Onboarding' : 'Submit Onboarding'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Onboarding List */}
      <div className="rounded-lg bg-white shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Position
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {onboardings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No onboarding records found
                  </td>
                </tr>
              ) : (
                onboardings.map((onboarding) => (
                  <tr key={onboarding.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      {onboarding.firstName} {onboarding.lastName}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {onboarding.email}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {onboarding.position || 'Not specified'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <span
                        className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                          onboarding.status === 'COMPLETED'
                            ? 'bg-green-100 text-green-800'
                            : onboarding.status === 'IN_PROGRESS'
                            ? 'bg-yellow-100 text-yellow-800'
                            : onboarding.status === 'CANCELLED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {onboarding.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {new Date(onboarding.createdAt).toLocaleDateString()}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                      {onboarding.status !== 'COMPLETED' && (
                        <>
                          <button
                            onClick={() => handleEdit(onboarding)}
                            className="mr-3 text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleCompleteOnboarding(onboarding.id)}
                            className="mr-3 text-green-600 hover:text-green-900"
                          >
                            Complete
                          </button>
                          <button
                            onClick={() => handleDelete(onboarding.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </>
                      )}
                      {onboarding.status === 'COMPLETED' && onboarding.employeeId && (
                        <a
                          href={`/employees/${onboarding.employeeId}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View Employee
                        </a>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
