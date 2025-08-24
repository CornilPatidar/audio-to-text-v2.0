import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import authService from '../utils/authService';
import apiService from '../utils/apiService';

export default function Dashboard({ onBackToTranscription }) {
  const { user } = useAuth();
  const [transcriptions, setTranscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedTranscription, setSelectedTranscription] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchTranscriptions();
  }, []);

  const fetchTranscriptions = async () => {
    try {
      setLoading(true);
      const token = await authService.getToken();
      const data = await apiService.getTranscriptions(token);
      setTranscriptions(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteTranscription = async (id) => {
    try {
      setDeletingId(id);
      const token = await authService.getToken();
      await apiService.deleteTranscription(id, token);
      setTranscriptions(transcriptions.filter(t => t.id !== id));
      setShowDeleteModal(false);
      setSelectedTranscription(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDuration = (seconds) => {
    if (!seconds) return 'Unknown';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTranscriptionText = (transcription) => {
    if (!transcription.transcriptionOutput) return 'No transcription available';
    
    if (Array.isArray(transcription.transcriptionOutput)) {
      return transcription.transcriptionOutput.map(segment => segment.text).join(' ');
    }
    
    return typeof transcription.transcriptionOutput === 'string' 
      ? transcription.transcriptionOutput 
      : 'Transcription data unavailable';
  };

  const filteredTranscriptions = transcriptions.filter(transcription => {
    const matchesSearch = transcription.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         getTranscriptionText(transcription).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || transcription.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <i className="fa-solid fa-spinner animate-spin text-4xl text-red-400 mb-4"></i>
          <p className="text-gray-600">Loading your transcriptions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Transcription Dashboard</h1>
            <p className="mt-2 text-gray-600">
              Manage and view all your audio transcriptions
            </p>
          </div>
          {onBackToTranscription && (
            <button
              onClick={onBackToTranscription}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg duration-200 flex items-center gap-2"
            >
              <i className="fa-solid fa-plus"></i>
              New Transcription
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <i className="fa-solid fa-file-audio text-blue-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Files</p>
                <p className="text-2xl font-bold text-gray-900">{transcriptions.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <i className="fa-solid fa-check text-green-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {transcriptions.filter(t => t.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <i className="fa-solid fa-clock text-yellow-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Processing</p>
                <p className="text-2xl font-bold text-gray-900">
                  {transcriptions.filter(t => t.status === 'processing').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <i className="fa-solid fa-exclamation-triangle text-red-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {transcriptions.filter(t => t.status === 'failed').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <input
                type="text"
                id="search"
                placeholder="Search by filename or transcription text..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <div className="sm:w-48">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                id="status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="processing">Processing</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex">
              <i className="fa-solid fa-exclamation-circle text-red-400 mt-1"></i>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Transcriptions List */}
        {filteredTranscriptions.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <i className="fa-solid fa-file-audio text-gray-400 text-4xl mb-4"></i>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {transcriptions.length === 0 ? 'No transcriptions yet' : 'No transcriptions match your search'}
            </h3>
            <p className="text-gray-600">
              {transcriptions.length === 0 
                ? 'Start by uploading an audio file to create your first transcription.'
                : 'Try adjusting your search terms or filters.'
              }
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      File
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTranscriptions.map((transcription) => (
                    <tr key={transcription.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
                              <i className="fa-solid fa-file-audio text-red-600"></i>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {transcription.fileName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {transcription.fileType || 'Unknown type'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          transcription.status === 'completed' 
                            ? 'bg-green-100 text-green-800'
                            : transcription.status === 'processing'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {transcription.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatFileSize(transcription.fileSize)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDuration(transcription.durationSeconds)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(transcription.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => setSelectedTranscription(transcription)}
                            className="text-red-600 hover:text-red-900"
                            title="View transcription"
                          >
                            <i className="fa-solid fa-eye"></i>
                          </button>
                          <button
                            onClick={() => {
                              setSelectedTranscription(transcription);
                              setShowDeleteModal(true);
                            }}
                            className="text-red-600 hover:text-red-900"
                            title="Delete transcription"
                          >
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Transcription Detail Modal */}
      {selectedTranscription && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Transcription Details
                </h3>
                <button
                  onClick={() => setSelectedTranscription(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="fa-solid fa-times text-xl"></i>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">File Information</h4>
                  <div className="mt-2 text-sm text-gray-600">
                    <p><strong>Name:</strong> {selectedTranscription.fileName}</p>
                    <p><strong>Type:</strong> {selectedTranscription.fileType || 'Unknown'}</p>
                    <p><strong>Size:</strong> {formatFileSize(selectedTranscription.fileSize)}</p>
                    <p><strong>Duration:</strong> {formatDuration(selectedTranscription.durationSeconds)}</p>
                    <p><strong>Status:</strong> {selectedTranscription.status}</p>
                    <p><strong>Created:</strong> {formatDate(selectedTranscription.createdAt)}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900">Transcription Text</h4>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg max-h-64 overflow-y-auto">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {getTranscriptionText(selectedTranscription)}
                    </p>
                  </div>
                </div>
                
                {selectedTranscription.metadata && (
                  <div>
                    <h4 className="font-medium text-gray-900">Metadata</h4>
                    <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                      <pre className="text-sm text-gray-700 overflow-x-auto">
                        {JSON.stringify(selectedTranscription.metadata, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedTranscription && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <i className="fa-solid fa-exclamation-triangle text-red-600 text-xl"></i>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-4">Delete Transcription</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete "{selectedTranscription.fileName}"? This action cannot be undone.
                </p>
              </div>
              <div className="flex justify-center space-x-4 mt-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteTranscription(selectedTranscription.id)}
                  disabled={deletingId === selectedTranscription.id}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {deletingId === selectedTranscription.id ? (
                    <>
                      <i className="fa-solid fa-spinner animate-spin mr-2"></i>
                      Deleting...
                    </>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
