import { useState, useEffect, useCallback } from 'react';

import { api } from '../api';
import { SavedSearch, SearchFilters, SortOptions } from '../types';
import { formatDate } from '../utils';

interface SavedSearchesProps {
  userId: string;
  onLoadSearch: (filters: SearchFilters, sort?: SortOptions) => void;
  currentFilters: SearchFilters;
  currentSort?: SortOptions;
}

export default function SavedSearches({
  userId,
  onLoadSearch,
  currentFilters,
  currentSort,
}: SavedSearchesProps) {
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [notifyOnMatch, setNotifyOnMatch] = useState(true);

  const loadSearches = useCallback(async () => {
    try {
      const data = await api.getSavedSearches(userId);
      setSearches(data);
    } catch (error) {
      console.error('Failed to load saved searches:', error);
    }
  }, [userId]);

  useEffect(() => {
    loadSearches();
  }, [loadSearches]);

  const handleSaveSearch = async () => {
    if (!searchName.trim()) return;

    try {
      await api.saveSearch({
        userId,
        name: searchName,
        filters: currentFilters,
        sort: currentSort,
        notifyOnNewMatches: notifyOnMatch,
      });
      setSearchName('');
      setShowSaveDialog(false);
      await loadSearches();
    } catch (error) {
      console.error('Failed to save search:', error);
    }
  };

  const handleDeleteSearch = async (searchId: string) => {
    try {
      await api.deleteSavedSearch(userId, searchId);
      await loadSearches();
    } catch (error) {
      console.error('Failed to delete search:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Saved Searches</h3>
        <button className="btn btn-sm btn-primary" onClick={() => setShowSaveDialog(true)}>
          Save Current
        </button>
      </div>

      {searches.length === 0 ? (
        <p className="text-sm opacity-70">No saved searches yet</p>
      ) : (
        <div className="space-y-2">
          {searches.map((search) => (
            <div key={search.id} className="card bg-base-200 shadow-sm">
              <div className="card-body p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{search.name}</h4>
                    <p className="text-xs opacity-70">Saved {formatDate(search.createdAt)}</p>
                    {search.notifyOnNewMatches && (
                      <span className="badge badge-xs badge-info mt-1">Auto-notify</span>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      className="btn btn-xs btn-ghost"
                      onClick={() => onLoadSearch(search.filters, search.sort)}
                    >
                      Load
                    </button>
                    <button
                      className="btn btn-xs btn-ghost text-error"
                      onClick={() => handleDeleteSearch(search.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showSaveDialog && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Save Search</h3>
            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text">Search Name</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Weekend Pizza Deals"
                className="input input-bordered"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
              />
            </div>
            <div className="form-control mt-4">
              <label className="label cursor-pointer">
                <span className="label-text">Notify me of new matches</span>
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={notifyOnMatch}
                  onChange={(e) => setNotifyOnMatch(e.target.checked)}
                />
              </label>
            </div>
            <div className="modal-action">
              <button className="btn" onClick={() => setShowSaveDialog(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSaveSearch}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
