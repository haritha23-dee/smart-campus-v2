import { useState, useRef, useEffect } from 'react';
import Modal from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';

export default function AdminProfileModal({ open, onClose }) {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState('');
  const [photo, setPhoto] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });
  const fileInputRef = useRef(null);
  const dismissTimerRef = useRef(null);

  useEffect(() => {
    if (user && open) {
      setName(user.name || '');
      setPhoto(user.photo || '');
      setMsg({ text: '', type: '' });
    }
  }, [user, open]);

  useEffect(() => {
    return () => {
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
      }
    };
  }, []);

  if (!open) return null;

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setMsg({
        text: 'Please upload a valid image file (.png, .jpg, .jpeg, .webp)',
        type: 'error',
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setMsg({
        text: 'Image size must be less than 2MB',
        type: 'error',
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadstart = () => {
      setMsg({ text: '', type: '' });
    };
    reader.onloadend = () => {
      setPhoto(reader.result);
      setMsg({ text: 'Photo attached! Click Save to apply.', type: 'info' });
    };
    reader.onerror = () => {
      setMsg({ text: 'Failed to read image file', type: 'error' });
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhoto('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setMsg({ text: 'Photo removed. Click Save to apply.', type: 'info' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setMsg({ text: 'Full Name cannot be empty', type: 'error' });
      return;
    }

    setLoading(true);
    setMsg({ text: '', type: '' });

    try {
      const updatedData = {
        ...user,
        name: name.trim(),
        photo: photo || '',
      };

      updateUser(updatedData);

      setMsg({ text: 'Profile updated successfully!', type: 'success' });

      dismissTimerRef.current = setTimeout(() => {
        onClose();
      }, 600);
    } catch (err) {
      setMsg({
        text: err.message || 'Failed to update profile. Please try again.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const initials = name
    ? name
        .trim()
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'A';

  return (
    <Modal open={open} onClose={onClose} title="Admin Profile Setup">
      {msg.text && (
        <div
          role="alert"
          className={`mb-4 px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
            msg.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
              : msg.type === 'info'
              ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
              : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
          }`}
        >
          <span>{msg.text}</span>
          <button
            type="button"
            onClick={() => setMsg({ text: '', type: '' })}
            className="text-xs hover:opacity-75 ml-2"
          >
            &times;
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col items-center justify-center gap-2 pb-4 border-b border-border-subtle">
          <div
            className="relative w-24 h-24 rounded-full border-2 border-brand overflow-hidden cursor-pointer flex items-center justify-center bg-neutral-200 dark:bg-neutral-800 shadow-md group transition-transform active:scale-95"
            onClick={() => fileInputRef.current?.click()}
            title="Click to choose a photo"
          >
            {photo ? (
              <img
                src={photo}
                alt="Admin Avatar Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-3xl font-bold text-brand">{initials}</span>
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-[10px] text-white font-semibold uppercase tracking-wider">
              <span>Change</span>
              <span>Photo</span>
            </div>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            accept="image/png, image/jpeg, image/jpg, image/webp"
            onChange={handlePhotoUpload}
            className="hidden"
          />

          <div className="flex items-center gap-3 mt-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-semibold text-brand hover:opacity-80 transition-opacity"
            >
              Upload Photo
            </button>
            {photo && (
              <>
                <span className="text-neutral-300 dark:text-neutral-700">&bull;</span>
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="text-xs font-semibold text-red-500 hover:opacity-80 transition-opacity"
                >
                  Remove
                </button>
              </>
            )}
          </div>
          <p className="text-[10px] text-neutral-400 dark:text-neutral-500">
            JPG, PNG or WEBP (Max 2MB)
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] uppercase tracking-wider font-semibold text-neutral-500 dark:text-neutral-400 mb-1">
              Email
            </label>
            <input
              type="text"
              value={user?.email || ''}
              disabled
              className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-100 dark:bg-neutral-800/60 border border-border-subtle text-neutral-500 cursor-not-allowed select-all focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-wider font-semibold text-neutral-500 dark:text-neutral-400 mb-1">
              Role
            </label>
            <input
              type="text"
              value={user?.role || 'admin'}
              disabled
              className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-100 dark:bg-neutral-800/60 border border-border-subtle text-neutral-500 cursor-not-allowed capitalize font-medium focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] uppercase tracking-wider font-semibold text-neutral-600 dark:text-neutral-300 mb-1">
            Full Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2.5 text-xs rounded-xl bg-canvas border border-border-subtle focus:outline-none focus:ring-1 focus:ring-brand font-medium text-neutral-900 dark:text-neutral-100"
            required
            placeholder="Enter full name"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-subtle">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-xs font-semibold rounded-xl border border-border-subtle hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 text-xs font-semibold rounded-xl bg-brand text-white hover:opacity-90 transition-opacity disabled:opacity-50 shadow-sm"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
}