import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GitBranch,
  Search,
  Plus,
  CopyPlus,
  Edit,
  Trash2,
  Loader,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import adminCareerPathService from '../../../services/adminServices/adminCareerPathService';

const INITIAL_FORM = {
  careerPathName: '',
  careerPathDescription: '',
};

const ROWS_PER_PAGE_OPTIONS = [5, 10, 25];

const CRUD_CareerPath = () => {
  const navigate = useNavigate();

  const [careerPaths, setCareerPaths] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState('add'); // 'add' | 'edit'
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [selectedCareerPath, setSelectedCareerPath] = useState(null);

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [careerPathToDelete, setCareerPathToDelete] = useState(null);

  const [isBulkFormOpen, setIsBulkFormOpen] = useState(false);
  const [bulkEntries, setBulkEntries] = useState([
    { careerPathName: '', careerPathDescription: '' },
    { careerPathName: '', careerPathDescription: '' },
  ]);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchCareerPaths();
  }, []);

  useEffect(() => {
    if (!success) return;
    const timer = setTimeout(() => setSuccess(null), 4000);
    return () => clearTimeout(timer);
  }, [success]);

  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(null), 4000);
    return () => clearTimeout(timer);
  }, [error]);

  const fetchCareerPaths = async () => {
    setLoading(true);
    try {
      const data = await adminCareerPathService.getAllCareerPaths();
      setCareerPaths(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error('Error fetching career paths:', err);
      setError('Failed to fetch career pathways. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const filteredCareerPaths = useMemo(() => {
    if (!searchQuery.trim()) {
      return careerPaths;
    }
    const keyword = searchQuery.toLowerCase();
    return careerPaths.filter((item) =>
      (item.careerPathName || '').toLowerCase().includes(keyword) ||
      (item.careerPathDescription || '').toLowerCase().includes(keyword)
    );
  }, [careerPaths, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredCareerPaths.length / rowsPerPage));
  const paginatedCareerPaths = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredCareerPaths.slice(start, start + rowsPerPage);
  }, [filteredCareerPaths, page, rowsPerPage]);

  const openAddForm = () => {
    setFormMode('add');
    setFormData(INITIAL_FORM);
    setSelectedCareerPath(null);
    setIsFormOpen(true);
  };

  const openEditForm = (careerPath) => {
    setFormMode('edit');
    setSelectedCareerPath(careerPath);
    setFormData({
      careerPathName: careerPath.careerPathName || '',
      careerPathDescription: careerPath.careerPathDescription || '',
    });
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setFormData(INITIAL_FORM);
    setSelectedCareerPath(null);
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.careerPathName.trim() || !formData.careerPathDescription.trim()) {
      setError('Both career pathway name and description are required.');
      return;
    }

    setLoading(true);
    try {
      if (formMode === 'edit' && selectedCareerPath) {
        await adminCareerPathService.updateCareerPath(selectedCareerPath.careerPathId, formData);
        setSuccess('Career pathway updated successfully.');
      } else {
        await adminCareerPathService.createCareerPath(formData);
        setSuccess('Career pathway created successfully.');
      }
      closeForm();
      fetchCareerPaths();
    } catch (err) {
      console.error('Error saving career path:', err);
      setError(`Failed to ${formMode === 'edit' ? 'update' : 'create'} career pathway. Please try again later.`);
    } finally {
      setLoading(false);
    }
  };

  const openDeleteConfirm = (careerPath) => {
    setCareerPathToDelete(careerPath);
    setIsDeleteConfirmOpen(true);
  };

  const closeDeleteConfirm = () => {
    setCareerPathToDelete(null);
    setIsDeleteConfirmOpen(false);
  };

  const confirmDelete = async () => {
    if (!careerPathToDelete) return;

    setLoading(true);
    try {
      await adminCareerPathService.deleteCareerPath(careerPathToDelete.careerPathId);
      setSuccess('Career pathway deleted successfully.');
      closeDeleteConfirm();
      fetchCareerPaths();
    } catch (err) {
      console.error('Error deleting career path:', err);
      setError('Failed to delete career pathway. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const openBulkForm = () => {
    setBulkEntries([
      { careerPathName: '', careerPathDescription: '' },
      { careerPathName: '', careerPathDescription: '' },
    ]);
    setIsBulkFormOpen(true);
  };

  const closeBulkForm = () => {
    setIsBulkFormOpen(false);
    setBulkEntries([
      { careerPathName: '', careerPathDescription: '' },
      { careerPathName: '', careerPathDescription: '' },
    ]);
  };

  const handleBulkEntryChange = (index, field, value) => {
    setBulkEntries((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        [field]: value,
      };
      return next;
    });
  };

  const addBulkEntry = () => {
    setBulkEntries((prev) => [...prev, { careerPathName: '', careerPathDescription: '' }]);
  };

  const removeBulkEntry = (index) => {
    setBulkEntries((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleBulkSubmit = async (event) => {
    event.preventDefault();
    const entries = bulkEntries
      .map((entry) => ({
        careerPathName: entry.careerPathName.trim(),
        careerPathDescription: entry.careerPathDescription.trim(),
      }))
      .filter((entry) => entry.careerPathName && entry.careerPathDescription);

    if (entries.length === 0) {
      setError('Provide at least one complete career pathway (name and description).');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await adminCareerPathService.createCareerPathsBulk(entries);
      setSuccess(`${entries.length} career pathway${entries.length > 1 ? 's' : ''} added successfully.`);
      closeBulkForm();
      fetchCareerPaths();
    } catch (err) {
      console.error('Error creating career pathways:', err);
      setError('Failed to create career pathways. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    const clampedPage = Math.max(0, Math.min(newPage, totalPages - 1));
    setPage(clampedPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(Number(event.target.value));
    setPage(0);
  };

  const getPaginationRange = () => {
    const MAX_VISIBLE_PAGES = 5;
    const pages = [];
    let start = Math.max(0, page - Math.floor(MAX_VISIBLE_PAGES / 2));
    let end = Math.min(totalPages - 1, start + MAX_VISIBLE_PAGES - 1);

    if (end - start + 1 < MAX_VISIBLE_PAGES) {
      start = Math.max(0, end - MAX_VISIBLE_PAGES + 1);
    }

    for (let i = start; i <= end; i += 1) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <div className="container mx-auto px-6 py-8 max-w-[1200px]">
      <div className="mb-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-[#FFB71B]/20 mr-3">
              <GitBranch className="h-6 w-6 text-[#FFB71B]" />
            </div>
            <h1 className="text-3xl font-bold text-[#2B3E4E]">Career Pathway Management</h1>
          </div>

          <button
            onClick={() => navigate('/admin/dashboard')}
            className="inline-flex items-center px-6 py-3 mt-4 md:mt-0 bg-gradient-to-r from-white to-white text-[#2B3E4E] font-bold rounded-xl shadow-md hover:from-[#2B3E4E] hover:to-[#2B3E4E] hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-[#FFB71B] animate-bounce-short"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>
        </div>
        <p className="text-gray-600 max-w-3xl">
          Add new career pathways, edit existing records, or remove outdated information. These entries power the deterministic recommendation engine.
        </p>
        <div className="w-24 h-1 bg-[#FFB71B] mt-4" />
      </div>

      {(success || error) && (
        <div className="mb-6">
          {success && (
            <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl shadow-sm">
              <Check className="h-5 w-5" />
              <span>{success}</span>
            </div>
          )}
          {error && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl shadow-sm">
              <X className="h-5 w-5" />
              <span>{error}</span>
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="w-full md:w-2/3 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FFB71B] focus:border-[#FFB71B] transition-colors shadow-md"
              placeholder="Search pathways by name or description..."
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setPage(0);
              }}
            />
          </div>

          <button
            onClick={openAddForm}
            className="w-full md:w-auto flex items-center justify-center px-6 py-3 bg-gradient-to-r from-[#FFB71B] to-[#FFB71B]/90 text-[#2B3E4E] font-medium rounded-xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Career Pathway
          </button>

          <button
            onClick={openBulkForm}
            className="w-full md:w-auto flex items-center justify-center px-6 py-3 bg-white text-[#2B3E4E] font-medium rounded-xl border border-[#2B3E4E]/20 hover:border-[#2B3E4E]/60 hover:shadow-lg transition-all duration-300"
          >
            <CopyPlus className="h-5 w-5 mr-2" />
            Add Multiple Pathways
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8 border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gradient-to-r from-[#2B3E4E] to-[#2B3E4E]/90 text-white text-left">
                <th className="px-6 py-4 font-semibold text-sm uppercase tracking-wider text-left">ID</th>
                <th className="px-6 py-4 font-semibold text-sm uppercase tracking-wider text-left">Career Pathway</th>
                <th className="px-6 py-4 font-semibold text-sm uppercase tracking-wider text-left">Description</th>
                <th className="px-6 py-4 font-semibold text-sm uppercase tracking-wider text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading && !careerPaths.length ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3 text-gray-500">
                      <Loader className="h-6 w-6 animate-spin" />
                      <span>Loading career pathways...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedCareerPaths.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    No career pathways found. Add your first one to get started!
                  </td>
                </tr>
              ) : (
                paginatedCareerPaths.map((careerPath) => (
                  <tr key={careerPath.careerPathId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-500 font-mono text-left">{careerPath.careerPathId}</td>
                    <td className="px-6 py-4 font-medium text-[#2B3E4E] text-left">{careerPath.careerPathName}</td>
                    <td className="px-6 py-4 text-gray-600 text-left align-top">
                      <p className="max-w-xl whitespace-pre-wrap leading-relaxed text-sm">
                        {careerPath.careerPathDescription}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-3">
                        <button
                          onClick={() => openEditForm(careerPath)}
                          className="p-2 text-[#2B3E4E] hover:bg-[#2B3E4E]/10 rounded-lg transition-colors"
                          title="Edit career pathway"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openDeleteConfirm(careerPath)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete career pathway"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="text-sm text-gray-600">
          Showing {filteredCareerPaths.length ? page * rowsPerPage + 1 : 0} to{' '}
          {Math.min((page + 1) * rowsPerPage, filteredCareerPaths.length)} of {filteredCareerPaths.length} pathways
        </div>

        <div className="flex items-center gap-3">
          <select
            value={rowsPerPage}
            onChange={handleRowsPerPageChange}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFB71B]"
          >
            {ROWS_PER_PAGE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option} / page
              </option>
            ))}
          </select>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => handlePageChange(0)}
              disabled={page === 0}
              className={`p-2 rounded-lg ${page === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'} transition-colors`}
            >
              <ChevronsLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 0}
              className={`p-2 rounded-lg ${page === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'} transition-colors`}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            {getPaginationRange().map((pageNumber) => (
              <button
                key={pageNumber}
                onClick={() => handlePageChange(pageNumber)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  pageNumber === page
                    ? 'bg-[#2B3E4E] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {pageNumber + 1}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages - 1}
              className={`p-2 rounded-lg ${page >= totalPages - 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'} transition-colors`}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <button
              onClick={() => handlePageChange(totalPages - 1)}
              disabled={page >= totalPages - 1}
              className={`p-2 rounded-lg ${page >= totalPages - 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'} transition-colors`}
            >
              <ChevronsRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl p-8 relative">
            <button
              onClick={closeForm}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-[#FFB71B]/20">
                <GitBranch className="h-5 w-5 text-[#FFB71B]" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[#2B3E4E]">
                  {formMode === 'edit' ? 'Edit Career Pathway' : 'Add Career Pathway'}
                </h2>
                <p className="text-sm text-gray-500">
                  {formMode === 'edit'
                    ? 'Update the name or description of this pathway.'
                    : 'Define the pathway name and provide a motivating description.'}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Career Pathway Name
                </label>
                <input
                  type="text"
                  name="careerPathName"
                  value={formData.careerPathName}
                  onChange={handleFormChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFB71B] focus:border-[#FFB71B] transition"
                  placeholder="e.g., STEM Innovators"
                  maxLength={150}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="careerPathDescription"
                  value={formData.careerPathDescription}
                  onChange={handleFormChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFB71B] focus:border-[#FFB71B] transition min-h-[160px] resize-y"
                  placeholder="Describe the focus, signature experiences, and opportunities students can expect in this pathway."
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-[#2B3E4E] rounded-xl hover:bg-[#1D63A1] transition"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : formMode === 'edit' ? 'Save Changes' : 'Create Pathway'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isBulkFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl p-8 relative">
            <button
              onClick={closeBulkForm}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-[#FFB71B]/20">
                <CopyPlus className="h-5 w-5 text-[#FFB71B]" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[#2B3E4E]">Add Multiple Career Pathways</h2>
                <p className="text-sm text-gray-500">
                  Quickly seed several pathways at once. Fill in at least one name and description per row.
                </p>
              </div>
            </div>

            <form onSubmit={handleBulkSubmit} className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
              {bulkEntries.map((entry, index) => (
                <div key={`bulk-entry-${index}`} className="border border-gray-200 rounded-xl p-5 shadow-sm bg-gray-50/60">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-[#2B3E4E]">Pathway #{index + 1}</h3>
                    {bulkEntries.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeBulkEntry(index)}
                        className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1"
                      >
                        <Trash2 className="h-4 w-4" /> Remove
                      </button>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Career Pathway Name
                      </label>
                      <input
                        type="text"
                        value={entry.careerPathName}
                        onChange={(event) => handleBulkEntryChange(index, 'careerPathName', event.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFB71B] focus:border-[#FFB71B] transition"
                        placeholder="e.g., Digital Media Creators"
                        maxLength={150}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={entry.careerPathDescription}
                        onChange={(event) => handleBulkEntryChange(index, 'careerPathDescription', event.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFB71B] focus:border-[#FFB71B] transition min-h-[140px] resize-y"
                        placeholder="Describe the pathway's focus, signature experiences, and future opportunities."
                      />
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={addBulkEntry}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#2B3E4E] border border-[#2B3E4E]/30 rounded-xl hover:border-[#2B3E4E]/60"
                >
                  <Plus className="h-4 w-4" />
                  Add another pathway
                </button>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={closeBulkForm}
                    className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-sm font-semibold text-white bg-[#2B3E4E] rounded-xl hover:bg-[#1D63A1] transition"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Create Pathways'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
            <div className="flex items-center gap-3 mb-4 text-red-600">
              <Trash2 className="h-6 w-6" />
              <h3 className="text-lg font-semibold">Delete Career Pathway</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete{' '}
              <span className="font-semibold text-[#2B3E4E]">
                {careerPathToDelete?.careerPathName}
              </span>
              ? This will remove the pathway from future recommendation calculations.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={closeDeleteConfirm}
                className="px-5 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-5 py-2 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 transition"
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CRUD_CareerPath;
