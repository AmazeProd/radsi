import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../services/userService';
import { FiSave, FiX, FiAlertCircle } from 'react-icons/fi';

const EditProfile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    location: '',
    website: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        bio: user.bio || '',
        location: user.location || '',
        website: user.website || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (formData.website && formData.website.trim()) {
      let websiteUrl = formData.website.trim();
      if (!websiteUrl.startsWith('http://') && !websiteUrl.startsWith('https://')) {
        websiteUrl = 'https://' + websiteUrl;
      }
      try {
        new URL(websiteUrl);
      } catch {
        newErrors.website = 'Please enter a valid website URL';
      }
    }

    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = 'Bio cannot exceed 500 characters';
    }
    if (formData.firstName && formData.firstName.length > 50) {
      newErrors.firstName = 'First name cannot exceed 50 characters';
    }
    if (formData.lastName && formData.lastName.length > 50) {
      newErrors.lastName = 'Last name cannot exceed 50 characters';
    }
    if (formData.location && formData.location.length > 100) {
      newErrors.location = 'Location cannot exceed 100 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      const dataToSend = {};
      Object.keys(formData).forEach(key => {
        if (formData[key] && formData[key].trim() !== '') {
          dataToSend[key] = formData[key].trim();
        }
      });

      if (dataToSend.website && !dataToSend.website.startsWith('http://') && !dataToSend.website.startsWith('https://')) {
        dataToSend.website = 'https://' + dataToSend.website;
      }

      const response = await updateProfile(dataToSend);
      updateUser(response.data);
      navigate(`/profile/${user.id || user._id}`);
    } catch (error) {
      console.error('Update profile error:', error);
      const message = error.response?.data?.message || 'Failed to update profile. Please check your input.';
      setErrors({ general: message });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(`/profile/${user.id || user._id}`);
  };

  const inputClass = (field) => `input-glass w-full ${
    errors[field] ? 'border-red-500/50 focus:ring-red-500/30' : ''
  }`;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="card-glass-static p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Edit Profile</h2>
          <button
            onClick={handleCancel}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1.5 hover:bg-white/5 rounded-lg transition"
          >
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {errors.general && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
              <FiAlertCircle className="flex-shrink-0" size={16} />
              <p className="text-sm">{errors.general}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-[var(--text-muted)] mb-1.5">
                First Name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleChange}
                className={inputClass('firstName')}
                placeholder="First name"
              />
              {errors.firstName && (
                <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                  <FiAlertCircle size={12} />
                  {errors.firstName}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-[var(--text-muted)] mb-1.5">
                Last Name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                className={inputClass('lastName')}
                placeholder="Last name"
              />
              {errors.lastName && (
                <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                  <FiAlertCircle size={12} />
                  {errors.lastName}
                </p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-[var(--text-muted)] mb-1.5">
              Bio {formData.bio && <span className="text-[var(--text-muted)] opacity-60 text-xs font-normal">({formData.bio.length}/500)</span>}
            </label>
            <textarea
              id="bio"
              name="bio"
              rows="3"
              value={formData.bio}
              onChange={handleChange}
              className={`${inputClass('bio')} resize-none`}
              placeholder="Tell us about yourself..."
            />
            {errors.bio && (
              <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                <FiAlertCircle size={12} />
                {errors.bio}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-[var(--text-muted)] mb-1.5">
              Location
            </label>
            <input
              id="location"
              name="location"
              type="text"
              value={formData.location}
              onChange={handleChange}
              className={inputClass('location')}
              placeholder="City, Country"
            />
            {errors.location && (
              <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                <FiAlertCircle size={12} />
                {errors.location}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="website" className="block text-sm font-medium text-[var(--text-muted)] mb-1.5">
              Website
            </label>
            <input
              id="website"
              name="website"
              type="url"
              value={formData.website}
              onChange={handleChange}
              className={inputClass('website')}
              placeholder="https://example.com"
            />
            {errors.website && (
              <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                <FiAlertCircle size={12} />
                {errors.website}
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-3">
            <button
              type="submit"
              disabled={loading}
              className="btn-accent flex-1 flex justify-center items-center gap-2 py-2.5 text-sm font-medium"
            >
              <FiSave size={16} />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="btn-ghost px-6 py-2.5 text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
