import { useState, useEffect, useCallback, useRef } from 'react';
import { Wrench, Upload } from 'lucide-react';
import {
  listEquipmentBySection,
  addEquipment,
  updateEquipment,
  deleteEquipment,
  resolveFileUrl,
} from '../../services/labStaffService';
import { LAB_SECTIONS } from '../../constants/labConstants';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Toast from '../../components/common/Toast';

const emptyForm = { name: '', section: LAB_SECTIONS[0], totalUnits: 1, description: '', imageFile: null };

export default function LabStaffInventory() {
  const [activeSection, setActiveSection] = useState(LAB_SECTIONS[0]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const [failedImages, setFailedImages] = useState({});

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [imagePreview, setImagePreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const fileInputRef = useRef(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchEquipment = useCallback(async (section) => {
    setLoading(true);
    try {
      const { equipment } = await listEquipmentBySection(section);
      setEquipmentList(equipment || []);
    } catch (err) {
      setToast({ type: 'error', message: err?.response?.data?.message || 'Failed to load equipment.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEquipment(activeSection);
  }, [activeSection, fetchEquipment]);

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const openAdd = () => {
    setEditingItem(null);
    setForm({ ...emptyForm, section: activeSection });
    setImagePreview('');
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      section: item.section,
      totalUnits: item.totalUnits,
      availableUnits: item.availableUnits,
      description: item.description || '',
      imageFile: null,
    });
    setImagePreview(resolveFileUrl(item.imageUrl));
    setFormError('');
    setModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setFormError('Please select a valid image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFormError('Image must be less than 5MB.');
      return;
    }
    setForm((f) => ({ ...f, imageFile: file }));
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.section || !form.totalUnits) {
      setFormError('Name, section and total units are required.');
      return;
    }
    setSubmitting(true);
    setFormError('');
    try {
      if (editingItem) {
        await updateEquipment(editingItem._id, {
          name: form.name.trim(),
          section: form.section,
          totalUnits: Number(form.totalUnits),
          availableUnits: Number(form.availableUnits),
          description: form.description.trim(),
          imageFile: form.imageFile,
        });
        setToast({ type: 'success', message: 'Equipment updated successfully.' });
      } else {
        await addEquipment({
          name: form.name.trim(),
          section: form.section,
          totalUnits: Number(form.totalUnits),
          description: form.description.trim(),
          imageFile: form.imageFile,
        });
        setToast({ type: 'success', message: 'Equipment added successfully.' });
      }
      setModalOpen(false);
      if (form.section === activeSection) fetchEquipment(activeSection);
      else setActiveSection(form.section);
    } catch (err) {
      setFormError(err?.response?.data?.message || 'Failed to save equipment.');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteEquipment(deleteTarget._id);
      setToast({ type: 'success', message: 'Equipment removed.' });
      setDeleteTarget(null);
      fetchEquipment(activeSection);
    } catch (err) {
      setToast({ type: 'error', message: err?.response?.data?.message || 'Failed to remove equipment.' });
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
        <h1 className="text-2xl font-bold tracking-tight">Equipment Inventory</h1>
        <button
          onClick={openAdd}
          className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-brand text-white hover:opacity-90 transition-opacity"
        >
          + Add Equipment
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {LAB_SECTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setActiveSection(s)}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors ${
              activeSection === s
                ? 'bg-brand text-white'
                : 'border border-border-subtle hover:bg-neutral-200/40 dark:hover:bg-neutral-800/40'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
          ))}
        </div>
      ) : equipmentList.length === 0 ? (
        <p className="text-sm text-neutral-500 dark:text-neutral-400 border border-dashed border-border-subtle rounded-xl p-6 text-center">
          No equipment in {activeSection} yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {equipmentList.map((eq) => {
            const hasValidImage = eq.imageUrl && !failedImages[eq._id];
            return (
              <div key={eq._id} className="border border-border-subtle rounded-xl p-4 bg-surface flex items-start gap-4">
                <div className="shrink-0 w-20 h-20 rounded-lg bg-neutral-200 dark:bg-neutral-800 overflow-hidden flex items-center justify-center border border-border-subtle">
                  {hasValidImage ? (
                    <img 
                      src={resolveFileUrl(eq.imageUrl)} 
                      alt={eq.name} 
                      className="w-full h-full object-cover" 
                      onError={() => {
                        setFailedImages((prev) => ({ ...prev, [eq._id]: true }));
                      }} 
                    />
                  ) : (
                    <Wrench className="w-7 h-7 text-neutral-500 dark:text-neutral-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{eq.name}</p>
                  {eq.description && (
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 line-clamp-2">{eq.description}</p>
                  )}
                  <p className="text-[11px] font-semibold mt-2">
                    {eq.availableUnits} / {eq.totalUnits} units available
                  </p>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <button
                    onClick={() => openEdit(eq)}
                    className="px-4 py-1.5 rounded-lg text-xs font-semibold border border-border-subtle hover:bg-neutral-200/40 dark:hover:bg-neutral-800/40 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteTarget(eq)}
                    className="px-4 py-1.5 rounded-lg text-xs font-semibold border border-red-500/40 text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    Delete
                  </button>
                </div>
            </div>
            );
          })}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingItem ? 'Edit Equipment' : 'Add Equipment'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-lg text-xs font-semibold bg-red-500/10 text-red-600 border border-red-500/20">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-[11px] uppercase tracking-wider font-semibold text-neutral-600 dark:text-neutral-300 mb-1.5">
              Instrument Photo
            </label>
            <div className="flex items-center gap-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-16 h-16 rounded-xl border border-dashed border-border-subtle bg-neutral-100 dark:bg-neutral-800/60 overflow-hidden flex items-center justify-center cursor-pointer hover:opacity-80"
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Upload className="w-5 h-5 text-neutral-400" />
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-semibold text-brand hover:underline"
              >
                {imagePreview ? 'Change Photo' : 'Upload Photo'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider font-semibold text-neutral-600 dark:text-neutral-300 mb-1.5">
              Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full px-4 py-2.5 text-sm rounded-xl bg-canvas border border-border-subtle focus:outline-none focus:ring-2 focus:ring-brand"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-neutral-600 dark:text-neutral-300 mb-1.5">
                Section
              </label>
              <select
                value={form.section}
                onChange={(e) => setForm((f) => ({ ...f, section: e.target.value }))}
                className="w-full px-4 py-2.5 text-sm rounded-xl bg-canvas border border-border-subtle focus:outline-none focus:ring-2 focus:ring-brand"
              >
                {LAB_SECTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-neutral-600 dark:text-neutral-300 mb-1.5">
                Total Units
              </label>
              <input
                type="number"
                min={editingItem ? Number(form.availableUnits) || 0 : 1}
                value={form.totalUnits}
                onChange={(e) => setForm((f) => ({ ...f, totalUnits: e.target.value }))}
                className="w-full px-4 py-2.5 text-sm rounded-xl bg-canvas border border-border-subtle focus:outline-none focus:ring-2 focus:ring-brand"
                required
              />
            </div>
          </div>

          {editingItem && (
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-neutral-600 dark:text-neutral-300 mb-1.5">
                Available Units
              </label>
              <input
                type="number"
                min={0}
                max={form.totalUnits}
                value={form.availableUnits}
                onChange={(e) => setForm((f) => ({ ...f, availableUnits: e.target.value }))}
                className="w-full px-4 py-2.5 text-sm rounded-xl bg-canvas border border-border-subtle focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
          )}

          <div>
            <label className="block text-[11px] uppercase tracking-wider font-semibold text-neutral-600 dark:text-neutral-300 mb-1.5">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              className="w-full px-4 py-2.5 text-sm rounded-xl bg-canvas border border-border-subtle focus:outline-none focus:ring-2 focus:ring-brand resize-none"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 text-xs font-semibold rounded-xl bg-brand text-white hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {submitting ? 'Saving…' : editingItem ? 'Save Changes' : 'Add Equipment'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Remove this equipment?"
        message={deleteTarget ? `"${deleteTarget.name}" will be permanently removed from inventory.` : ''}
        confirmLabel="Delete"
        danger
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}