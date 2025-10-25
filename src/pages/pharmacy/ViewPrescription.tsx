import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { pharmacyApi, type Appointment } from '../../services/api';
import { useAuthStore } from '../../store/auth';

const ViewPrescription: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);

  const loadAppointment = async () => {
    try {
      setIsLoading(true);
      const response = await pharmacyApi.getAppointments();
      
      if (response.success) {
        const foundAppointment = response.data.find(apt => apt.id === id);
        if (foundAppointment) {
          setAppointment(foundAppointment);
        } else {
          console.error('Appointment not found');
          navigate('/pharmacy');
        }
      } else {
        console.error('Failed to load appointment details');
      }
    } catch (err) {
      console.error('Failed to load appointment details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPrescriptionPdf = async () => {
    if (!appointment?.prescriptionId) return;

    try {
      setIsLoadingPdf(true);
      const prescriptionPath = `2025/10/prescription_${appointment.patientName.replace(/\s+/g, '_')}_${appointment.date}_${appointment.prescriptionId}.pdf`;
      
      const blob = await pharmacyApi.getPrescriptionFile(prescriptionPath);
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (err) {
      console.error('Failed to load prescription PDF:', err);
    } finally {
      setIsLoadingPdf(false);
    }
  };

  useEffect(() => {
    loadAppointment();
  }, [id]);

  useEffect(() => {
    if (appointment) {
      loadPrescriptionPdf();
    }
  }, [appointment]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading prescription details...</p>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Appointment Not Found</h1>
          <button
            onClick={() => navigate('/pharmacy')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Pharmacy Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/pharmacy')}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Prescription Details</h1>
                <p className="text-gray-600">View prescription for {appointment.patientName}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Welcome, {user?.firstName}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Patient Information */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Patient Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <p className="text-sm text-gray-900">{appointment.patientName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <p className="text-sm text-gray-900">{appointment.phone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="text-sm text-gray-900">{appointment.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Appointment Date</label>
                  <p className="text-sm text-gray-900">{formatDate(appointment.date)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Appointment Time</label>
                  <p className="text-sm text-gray-900">{formatTime(appointment.time)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Reason for Visit</label>
                  <p className="text-sm text-gray-900">{appointment.reason}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 mt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Doctor Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Doctor Name</label>
                  <p className="text-sm text-gray-900">{appointment.doctorName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Prescription Completed</label>
                  <p className="text-sm text-gray-900">
                    {new Date(appointment.prescriptionCompletedAt).toLocaleDateString('en-IN')}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Completed By</label>
                  <p className="text-sm text-gray-900">{appointment.completedBy}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Prescription ID</label>
                  <p className="text-sm text-gray-900 font-mono">{appointment.prescriptionId}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Prescription PDF */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Prescription Document</h2>
                <p className="text-sm text-gray-600">View the complete prescription details</p>
              </div>
              
              <div className="p-6">
                {isLoadingPdf ? (
                  <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="mt-2 text-gray-600">Loading prescription PDF...</p>
                    </div>
                  </div>
                ) : pdfUrl ? (
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <iframe
                      src={pdfUrl}
                      className="w-full h-96"
                      title="Prescription PDF"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">Prescription not available</h3>
                      <p className="mt-1 text-sm text-gray-500">The prescription PDF could not be loaded.</p>
                      <button
                        onClick={loadPrescriptionPdf}
                        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Retry Loading
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewPrescription;
