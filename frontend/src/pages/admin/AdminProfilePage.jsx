// frontend/src/pages/admin/AdminProfilePage.jsx
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminProfilePage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [photo, setPhoto] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhoto(user.photo || '');
    }
  }, [user]);

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMsg({ text: 'Please select a valid image file', type: 'error' });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setMsg({ text: 'Image size must be less than 2MB', type: 'error' });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhoto(reader.result);
      setMsg({ text: 'Photo attached. Click Save Changes to apply.', type: 'info' });
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhoto('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    setMsg({ text: 'Photo removed. Click Save Changes to apply.', type: 'info' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setMsg({ text: 'Name cannot be empty', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const updatedUser = {
        ...user,
        name: name.trim(),
        photo: photo || '',
      };
      updateUser(updatedUser);
      setMsg({ text: 'Profile updated successfully!', type: 'success' });
    } catch {
      setMsg({ text: 'Failed to update profile', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const initials = name
    ? name.trim().split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
    : 'A';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
        <div>
          <span className="text-[11px] uppercase tracking-[0.25em] font-semibold text-neutral-500 dark:text-neutral-400 block mb-1">
            Admin Settings
          </span>
          <h1 className="text-2xl font-bold tracking-tight">Admin Profile</h1>
        </div>
        <button
          onClick={() => navigate('/admin')}
          className="px-4 py-2 text-xs font-semibold rounded-xl border border-border-subtle hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          &larr; Back to Dashboard
        </button>
      </div>

      {msg.text && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold ${
            msg.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
              : msg.type === 'info'
              ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
              : 'bg-red-500/10 text-red-600 border border-red-500/20'
          }`}
        >
          {msg.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-surface border border-border-subtle rounded-2xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-border-subtle">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="relative w-24 h-24 rounded-full border-2 border-brand overflow-hidden cursor-pointer flex items-center justify-center bg-neutral-200 dark:bg-neutral-800 shadow-md group"
          >
            {photo ? (
              <img src={photo} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-bold text-brand">{initials}</span>
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] text-white font-semibold uppercase tracking-wider">
              Change
            </div>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
          />

          <div className="space-y-1.5 text-center sm:text-left">
            <h3 className="text-sm font-semibold">Profile Photo</h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Upload a clear JPG, PNG or WEBP image under 2MB.
            </p>
            <div className="flex items-center justify-center sm:justify-start gap-3 pt-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-semibold text-brand hover:underline"
              >
                Upload Photo
              </button>
              {photo && (
                <>
                  <span className="text-neutral-400">&bull;</span>
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="text-xs font-semibold text-red-500 hover:underline"
                  >
                    Remove Photo
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] uppercase tracking-wider font-semibold text-neutral-500 dark:text-neutral-400 mb-1.5">
              Email Address
            </label>
            <input
              type="text"
              value={user?.email || ''}
              disabled
              className="w-full px-4 py-2.5 text-xs rounded-xl bg-neutral-100 dark:bg-neutral-800/60 border border-border-subtle text-neutral-500 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-wider font-semibold text-neutral-500 dark:text-neutral-400 mb-1.5">
              Role
            </label>
            <input
              type="text"
              value={user?.role || 'admin'}
              disabled
              className="w-full px-4 py-2.5 text-xs rounded-xl bg-neutral-100 dark:bg-neutral-800/60 border border-border-subtle text-neutral-500 cursor-not-allowed capitalize font-medium"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] uppercase tracking-wider font-semibold text-neutral-600 dark:text-neutral-300 mb-1.5">
            Full Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2.5 text-sm rounded-xl bg-canvas border border-border-subtle focus:outline-none focus:ring-2 focus:ring-brand font-medium"
            required
          />
        </div>

        <div className="flex justify-end pt-4 border-t border-border-subtle">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 text-xs font-semibold rounded-xl bg-brand text-white hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}