import { useState, useEffect, useCallback } from 'react';

import { api } from '../api';
import { UserPreferences } from '../types';

interface PreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  availableCuisines: string[];
}

export default function PreferencesModal({
  isOpen,
  onClose,
  userId,
  availableCuisines,
}: PreferencesModalProps) {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(false);

  const loadPreferences = useCallback(async () => {
    setLoading(true);
    try {
      const prefs = await api.getPreferences(userId);
      setPreferences(prefs);
    } catch (error) {
      console.error('Failed to load preferences:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (isOpen) {
      loadPreferences();
    }
  }, [isOpen, loadPreferences]);

  const handleSave = async () => {
    if (!preferences) return;

    setLoading(true);
    try {
      await api.savePreferences(preferences);
      onClose();
    } catch (error) {
      console.error('Failed to save preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCuisine = (cuisine: string) => {
    if (!preferences) return;
    const newCuisines = preferences.preferredCuisines.includes(cuisine)
      ? preferences.preferredCuisines.filter((c) => c !== cuisine)
      : [...preferences.preferredCuisines, cuisine];
    setPreferences({ ...preferences, preferredCuisines: newCuisines });
  };

  if (!isOpen || !preferences) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <h3 className="font-bold text-lg mb-4">User Preferences</h3>

        <div className="space-y-4">
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">Enable notifications</span>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={preferences.notificationsEnabled}
                onChange={(e) =>
                  setPreferences({ ...preferences, notificationsEnabled: e.target.checked })
                }
              />
            </label>
          </div>

          <div>
            <label className="label">
              <span className="label-text font-medium">Preferred Cuisines</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {availableCuisines.map((cuisine) => (
                <label key={cuisine} className="cursor-pointer flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-sm"
                    checked={preferences.preferredCuisines.includes(cuisine)}
                    onChange={() => toggleCuisine(cuisine)}
                  />
                  <span className="text-sm">{cuisine}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="label">
              <span className="label-text font-medium">Minimum Discount Threshold</span>
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="range"
                min="0"
                max="100"
                value={preferences.minDiscountThreshold}
                onChange={(e) =>
                  setPreferences({ ...preferences, minDiscountThreshold: Number(e.target.value) })
                }
                className="range range-primary"
              />
              <span className="badge badge-lg">{preferences.minDiscountThreshold}%</span>
            </div>
          </div>

          <div>
            <label className="label">
              <span className="label-text font-medium">Alert Channels</span>
            </label>
            <div className="space-y-2">
              <label className="cursor-pointer flex items-center gap-2">
                <input
                  type="checkbox"
                  className="checkbox"
                  checked={preferences.alertChannels.inApp}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      alertChannels: { ...preferences.alertChannels, inApp: e.target.checked },
                    })
                  }
                />
                <span className="label-text">In-app notifications</span>
              </label>
              <label className="cursor-pointer flex items-center gap-2">
                <input
                  type="checkbox"
                  className="checkbox"
                  checked={preferences.alertChannels.email}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      alertChannels: { ...preferences.alertChannels, email: e.target.checked },
                    })
                  }
                />
                <span className="label-text">Email notifications</span>
              </label>
              <label className="cursor-pointer flex items-center gap-2">
                <input
                  type="checkbox"
                  className="checkbox"
                  checked={preferences.alertChannels.push}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      alertChannels: { ...preferences.alertChannels, push: e.target.checked },
                    })
                  }
                />
                <span className="label-text">Push notifications</span>
              </label>
            </div>
          </div>
        </div>

        <div className="modal-action">
          <button className="btn" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
