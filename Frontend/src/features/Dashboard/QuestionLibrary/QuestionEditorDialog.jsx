import React, { useEffect, useRef, useState } from 'react';

const DIFFICULTIES = ['easy', 'medium', 'hard'];
const ANSWER_TYPES = ['text', 'image', 'video', 'fileUpload'];
const LEVELS = [1, 2, 3];

const EMPTY_FORM = {
  text: '',
  level: 1,
  category: '',
  difficulty: 'medium',
  points: 10,
  answerType: 'text',
  correctAnswer: '',
  folder: 'General',
  questionImageUrl: '',
};

function FormRow({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{label}</label>
      {children}
    </div>
  );
}

function Input({ style, ...props }) {
  return (
    <input
      style={{
        border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 12px',
        fontSize: 14, color: '#111827', outline: 'none', width: '100%',
        boxSizing: 'border-box', ...style,
      }}
      {...props}
    />
  );
}

function Select({ children, style, ...props }) {
  return (
    <select
      style={{
        border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 12px',
        fontSize: 14, color: '#111827', outline: 'none', width: '100%',
        boxSizing: 'border-box', background: '#fff', ...style,
      }}
      {...props}
    >
      {children}
    </select>
  );
}

function QuestionEditorDialog({ open, mode, initialQuestion, folders, defaultFolder, onClose, onSaved, onUploadImage, existingLevels }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  // States for dynamic additions
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [newFolderValue, setNewFolderValue] = useState('');
  const [showNewLevelInput, setShowNewLevelInput] = useState(false);
  const [newLevelValue, setNewLevelValue] = useState('');

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    if (mode === 'edit' && initialQuestion) {
      setForm({
        text: initialQuestion.text || '',
        level: initialQuestion.level || 1,
        category: initialQuestion.category || '',
        difficulty: initialQuestion.difficulty || 'medium',
        points: initialQuestion.points || 10,
        answerType: initialQuestion.answerType || 'text',
        correctAnswer: initialQuestion.correctAnswer || '',
        folder: initialQuestion.folder || defaultFolder || 'General',
        questionImageUrl: initialQuestion.questionImageUrl || '',
      });
      setImagePreview(initialQuestion.questionImageUrl || '');
    } else {
      setForm({ ...EMPTY_FORM, folder: defaultFolder || 'General' });
      setImagePreview('');
    }
    setImageFile(null);
    setError('');
    setShowNewFolderInput(false);
    setNewFolderValue('');
    setShowNewLevelInput(false);
    setNewLevelValue('');
  }, [open, mode, initialQuestion, defaultFolder]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleLevelChange = (e) => {
    const val = e.target.value;
    if (val === '__NEW_LEVEL__') {
      setShowNewLevelInput(true);
      setForm(f => ({ ...f, level: '__NEW_LEVEL__' }));
    } else {
      setShowNewLevelInput(false);
      setForm(f => ({ ...f, level: Number(val) }));
    }
  };

  const handleFolderChange = (e) => {
    const val = e.target.value;
    if (val === '__NEW_FOLDER__') {
      setShowNewFolderInput(true);
      setForm(f => ({ ...f, folder: '__NEW_FOLDER__' }));
    } else {
      setShowNewFolderInput(false);
      setForm(f => ({ ...f, folder: val }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setError('');
    if (!form.text.trim()) return setError('Question text is required');
    if (!form.category.trim()) return setError('Category is required');

    let finalLevel = form.level;
    if (form.level === '__NEW_LEVEL__') {
      const lvlNum = Number(newLevelValue);
      if (!newLevelValue || isNaN(lvlNum) || lvlNum < 1) {
        return setError('Please enter a valid new level number (integer >= 1)');
      }
      finalLevel = lvlNum;
    }

    let finalFolder = form.folder;
    if (form.folder === '__NEW_FOLDER__') {
      const folderName = newFolderValue.trim();
      if (!folderName) {
        return setError('Please enter a valid new folder name');
      }
      if (folderName === 'General') {
        return setError('Folder name "General" always exists');
      }
      finalFolder = folderName;
    }

    setSaving(true);
    try {
      let imageUrl = form.questionImageUrl;
      if (imageFile) {
        setUploading(true);
        imageUrl = await onUploadImage(imageFile);
        setUploading(false);
      }
      await onSaved({
        ...form,
        level: finalLevel,
        folder: finalFolder,
        questionImageUrl: imageUrl || null
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save question');
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  if (!open) return null;

  const allFolders = folders.includes('General') ? folders : ['General', ...folders];

  const CATEGORIES = ["Collab", "Team work", "Discory", "Mind-Bender"];
  const activeCategories = [...CATEGORIES];
  if (form.category && !activeCategories.includes(form.category)) {
    activeCategories.push(form.category);
  }

  const dialogLevels = Array.from(new Set([1, 2, 3, ...(existingLevels || [])])).sort((a, b) => a - b);

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.45)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', padding: 16,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: '#fff', borderRadius: 16, width: '100%', maxWidth: 580,
          maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        }}
      >
        {/* Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#111827' }}>
            {mode === 'edit' ? 'Edit Question' : 'New Question'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#9ca3af', lineHeight: 1 }}>×</button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px', color: '#b91c1c', fontSize: 13 }}>
              {error}
            </div>
          )}

          <FormRow label="Question Text *">
            <textarea
              rows={3}
              value={form.text}
              onChange={set('text')}
              placeholder="Enter question text..."
              style={{
                border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 12px',
                fontSize: 14, color: '#111827', outline: 'none', width: '100%',
                boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit',
              }}
            />
          </FormRow>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <FormRow label="Level">
              <Select value={form.level} onChange={handleLevelChange}>
                {dialogLevels.map(l => <option key={l} value={l}>Level {l}</option>)}
                <option value="__NEW_LEVEL__">+ Add New Level...</option>
              </Select>
              {showNewLevelInput && (
                <Input
                  type="number"
                  min={1}
                  placeholder="Level number..."
                  value={newLevelValue}
                  onChange={(e) => setNewLevelValue(e.target.value)}
                  style={{ marginTop: 8 }}
                />
              )}
            </FormRow>
            <FormRow label="Difficulty">
              <Select value={form.difficulty} onChange={set('difficulty')}>
                {DIFFICULTIES.map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
              </Select>
            </FormRow>
            <FormRow label="Points">
              <Input type="number" min={0} value={form.points} onChange={set('points')} />
            </FormRow>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormRow label="Category *">
              <Select value={form.category} onChange={set('category')}>
                <option value="" disabled>Select Category</option>
                {activeCategories.map(c => <option key={c} value={c}>{c}</option>)}
              </Select>
            </FormRow>
            <FormRow label="Answer Type">
              <Select value={form.answerType} onChange={set('answerType')}>
                {ANSWER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </Select>
            </FormRow>
          </div>

          <FormRow label="Correct Answer (optional)">
            <Input value={form.correctAnswer} onChange={set('correctAnswer')} placeholder="Enter correct answer text" />
          </FormRow>

          <FormRow label="Folder">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <Select value={form.folder} onChange={handleFolderChange}>
                {allFolders.map(f => <option key={f} value={f}>{f}</option>)}
                <option value="__NEW_FOLDER__">+ Add New Folder...</option>
              </Select>
              {showNewFolderInput && (
                <Input
                  placeholder="Enter new folder name..."
                  value={newFolderValue}
                  onChange={(e) => setNewFolderValue(e.target.value)}
                  style={{ marginTop: 8 }}
                />
              )}
            </div>
          </FormRow>

          {/* Image Upload */}
          <FormRow label="Question Image (optional)">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  style={{
                    padding: '8px 16px', borderRadius: 8, border: '1px dashed #d1d5db',
                    background: '#f9fafb', color: '#6b7280', fontSize: 13, cursor: 'pointer',
                    fontWeight: 500,
                  }}
                >
                  {uploading ? 'Uploading…' : imagePreview ? 'Change Image' : 'Upload Image'}
                </button>
                {imagePreview && (
                  <button
                    type="button"
                    onClick={() => { setImageFile(null); setImagePreview(''); setForm(f => ({ ...f, questionImageUrl: '' })); }}
                    style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #fca5a5', background: '#fff', color: '#ef4444', fontSize: 13, cursor: 'pointer' }}
                  >
                    Remove
                  </button>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleImageChange} />
              </div>
              {imagePreview && (
                <img src={imagePreview} alt="Preview" style={{ maxHeight: 140, maxWidth: '100%', borderRadius: 8, objectFit: 'contain', border: '1px solid #e5e7eb' }} />
              )}
            </div>
          </FormRow>
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px 20px', borderTop: '1px solid #f3f4f6', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '9px 20px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer', color: '#374151' }}>
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || uploading}
            style={{
              padding: '9px 24px', borderRadius: 8, border: 'none',
              background: saving || uploading ? '#fed7aa' : '#f97316',
              color: '#fff', fontSize: 14, fontWeight: 600, cursor: saving || uploading ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s',
            }}
          >
            {saving ? 'Saving…' : mode === 'edit' ? 'Save Changes' : 'Create Question'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default QuestionEditorDialog;
