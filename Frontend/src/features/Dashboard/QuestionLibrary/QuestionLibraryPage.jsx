import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useFolders } from './useFolders';
import { useQuestions } from './useQuestions';
import QuestionCard from './QuestionCard';
import QuestionEditorDialog from './QuestionEditorDialog';
import axios from 'axios';

// ─── tiny utility components ──────────────────────────────────────────────────
function Badge({ children, color = '#f3f4f6', textColor = '#374151', onClick, active }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 999,
        border: active ? '2px solid #f97316' : '1px solid #e5e7eb',
        background: active ? '#fff7ed' : color, color: active ? '#f97316' : textColor,
        cursor: onClick ? 'pointer' : 'default', transition: 'all 0.15s',
      }}
    >
      {children}
    </button>
  );
}

function SidebarButton({ children, selected, onClick, indent = 0 }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', textAlign: 'left', padding: `8px 12px 8px ${16 + indent * 16}px`,
        borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: selected ? 600 : 400,
        background: selected ? '#fff7ed' : 'transparent',
        color: selected ? '#f97316' : '#374151',
        transition: 'all 0.1s',
      }}
    >
      {children}
    </button>
  );
}

// ─── Delete confirmation dialog ───────────────────────────────────────────────
function ConfirmDialog({ open, title, message, onConfirm, onCancel, danger = false }) {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 14, width: '100%', maxWidth: 400, padding: 24, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <h3 style={{ margin: '0 0 8px', fontSize: 17, fontWeight: 700, color: '#111827' }}>{title}</h3>
        <p style={{ margin: '0 0 20px', fontSize: 14, color: '#6b7280' }}>{message}</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', fontSize: 14, cursor: 'pointer' }}>Cancel</button>
          <button onClick={onConfirm} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: danger ? '#ef4444' : '#f97316', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Confirm</button>
        </div>
      </div>
    </div>
  );
}

// ─── Rename folder dialog ─────────────────────────────────────────────────────
function RenameDialog({ open, current, onConfirm, onCancel }) {
  const [value, setValue] = useState('');
  useEffect(() => { if (open) setValue(current); }, [open, current]);
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 14, width: '100%', maxWidth: 380, padding: 24, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 17, fontWeight: 700 }}>Rename Folder</h3>
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') onConfirm(value); }}
          style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 12px', fontSize: 14, boxSizing: 'border-box', outline: 'none', marginBottom: 16 }}
        />
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', fontSize: 14, cursor: 'pointer' }}>Cancel</button>
          <button onClick={() => onConfirm(value)} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: '#f97316', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Rename</button>
        </div>
      </div>
    </div>
  );
}

// ─── Copy/Move Questions dialog ───────────────────────────────────────────────
function CopyMoveQuestionsDialog({ open, folders, targetCount, mode, onConfirm, onCancel }) {
  const [selectedFolder, setSelectedFolder] = useState('General');

  if (!open) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 14, width: '100%', maxWidth: 380, padding: 24, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 17, fontWeight: 700, textTransform: 'capitalize', color: '#111827' }}>
          {mode} {targetCount} Question{targetCount !== 1 ? 's' : ''}
        </h3>
        
        <p style={{ margin: '0 0 16px', fontSize: 13, color: '#6b7280' }}>
          Select the target folder where you want to {mode} the selected question(s):
        </p>

        <select
          value={selectedFolder}
          onChange={(e) => setSelectedFolder(e.target.value)}
          style={{
            width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 12px',
            fontSize: 14, outline: 'none', marginBottom: 20, boxSizing: 'border-box'
          }}
        >
          {folders.map(f => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', fontSize: 14, cursor: 'pointer' }}>Cancel</button>
          <button onClick={() => onConfirm(selectedFolder)} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: '#f97316', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize' }}>{mode}</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
function QuestionLibraryPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { folders, fetchFolders, createFolder, renameFolder, deleteFolder, error: foldersError } = useFolders();
  const {
    questions, pagination, loading: questionsLoading, error: questionsError,
    fetchQuestions, createQuestion, updateQuestion, deleteQuestion,
    uploadImage, fetchSelectedQuestions, saveSelectedQuestions,
    copyQuestions, moveQuestions
  } = useQuestions();

  // Copy/Move states
  const [copyMoveOpen, setCopyMoveOpen] = useState(false);
  const [copyMoveMode, setCopyMoveMode] = useState('copy'); // 'copy' or 'move'
  const [copyMoveTargetIds, setCopyMoveTargetIds] = useState([]);

  // Passcode verification states
  const [verifyingPasscode, setVerifyingPasscode] = useState(false);
  const [passcodeError, setPasscodeError] = useState(null);

  // Filters
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');
  const [sort, setSort] = useState('newest');

  // Selection (per-level maps)
  const [selectedIds, setSelectedIds] = useState({
    1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: []
  });
  const [sessionLevels, setSessionLevels] = useState(3);
  const [savingSelection, setSavingSelection] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  // Editor dialog
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState('create');
  const [editingQuestion, setEditingQuestion] = useState(null);

  // Folder management dialogs
  const [newFolderInput, setNewFolderInput] = useState('');
  const [creatingFolder, setCreatingFolder] = useState(false);

  // Level management
  const [newLevelInput, setNewLevelInput] = useState('');
  const [customLevels, setCustomLevels] = useState([]);
  const [allExistingLevels, setAllExistingLevels] = useState([1, 2, 3]);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [renameFolderTarget, setRenameFolderTarget] = useState('');
  const [deleteFolderTarget, setDeleteFolderTarget] = useState('');
  const [deleteQuestionTarget, setDeleteQuestionTarget] = useState(null);

  const [actionError, setActionError] = useState('');

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchText.trim()), 300);
    return () => clearTimeout(t);
  }, [searchText]);

  // Keep a persistent cache of all levels ever loaded to prevent them disappearing on filtering
  useEffect(() => {
    if (questions.length > 0) {
      setAllExistingLevels(prev => {
        const next = new Set(prev);
        questions.forEach(q => {
          if (q.level) next.add(Number(q.level));
        });
        return Array.from(next).sort((a, b) => a - b);
      });
    }
  }, [questions]);

  // Passcode authentication handshake
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const passcode = queryParams.get('passcode');
    if (passcode) {
      const authWithPasscode = async () => {
        setVerifyingPasscode(true);
        setPasscodeError(null);
        try {
          const res = await axios.post(
            `${import.meta.env.VITE_BACKEND_BASE_URL}/api/v1/admin/authenticate-library-passcode`,
            { passcode },
            { withCredentials: true }
          );
          if (res.data.success) {
            navigate('/admin/questions', { replace: true });
          } else {
            setPasscodeError(res.data.error || 'Authentication failed');
          }
        } catch (err) {
          setPasscodeError(err.response?.data?.error || 'Failed to authenticate passcode');
        } finally {
          setVerifyingPasscode(false);
        }
      };
      authWithPasscode();
    }
  }, [location.search, navigate]);

  // Fetch on filter change
  useEffect(() => {
    const hasPasscode = new URLSearchParams(location.search).has('passcode');
    if (!hasPasscode && !verifyingPasscode && !passcodeError && !foldersError) {
      fetchQuestions({ folder: selectedFolder, search: debouncedSearch, level: filterLevel, difficulty: filterDifficulty, sort });
    }
  }, [selectedFolder, debouncedSearch, filterLevel, filterDifficulty, sort, fetchQuestions, location.search, verifyingPasscode, passcodeError, foldersError]);

  // Load folders + current session selection on mount
  useEffect(() => {
    const hasPasscode = new URLSearchParams(location.search).has('passcode');
    if (!hasPasscode && !verifyingPasscode && !passcodeError && !foldersError) {
      fetchFolders();
      if (sessionId) {
        fetchSelectedQuestions(sessionId).then((data) => {
          if (data?.selectedQuestions) {
            const loaded = {};
            for (let i = 1; i <= 10; i++) {
              loaded[i] = data.selectedQuestions[i] || [];
            }
            setSelectedIds(loaded);
          }
          if (data?.numberOfLevels) {
            setSessionLevels(data.numberOfLevels);
          }
        }).catch(() => {});
      }
    }
  }, [sessionId, fetchFolders, fetchSelectedQuestions, location.search, verifyingPasscode, passcodeError, foldersError]);

  if (verifyingPasscode) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 40, height: 40, border: '4px solid #e2e8f0', borderTop: '4px solid #f97316', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <p style={{ margin: 0, fontSize: 16, color: '#475569', fontWeight: 500 }}>Authenticating Super Admin passcode...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (passcodeError) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif', padding: 20 }}>
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #fee2e2', padding: '32px 24px', maxWidth: 440, width: '100%', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
          <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 700, color: '#991b1b' }}>Access Denied</h2>
          <p style={{ margin: '0 0 24px', fontSize: 14, color: '#64748b', lineHeight: 1.5 }}>
            {passcodeError}
          </p>
          <button
            onClick={() => {
              setPasscodeError(null);
              navigate('/admin/questions', { replace: true });
            }}
            style={{ width: '100%', padding: '10px 16px', borderRadius: 8, border: 'none', background: '#f97316', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (foldersError) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif', padding: 20 }}>
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #fee2e2', padding: '32px 24px', maxWidth: 440, width: '100%', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🚫</div>
          <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 700, color: '#991b1b' }}>Unauthorized</h2>
          <p style={{ margin: '0 0 24px', fontSize: 14, color: '#64748b', lineHeight: 1.5 }}>
            You do not have permission to access the Question Library. Please authenticate via the Super Admin panel.
          </p>
        </div>
      </div>
    );
  }

  const handleToggleQuestion = useCallback((questionId, level) => {
    setSelectedIds((prev) => {
      const l = level || 1;
      const list = prev[l] || [];
      const next = list.includes(questionId) ? list.filter(id => id !== questionId) : [...list, questionId];
      return { ...prev, [l]: next };
    });
  }, []);

  // Check if a question is selected in any level
  const isSelected = useCallback((questionId) => {
    return Object.values(selectedIds).some(list => list.includes(questionId));
  }, [selectedIds]);

  const handleSaveToSession = async () => {
    setSavingSelection(true);
    setSaveMsg('');
    setActionError('');
    try {
      const payload = {};
      for (let i = 1; i <= 10; i++) {
        payload[`level${i}`] = selectedIds[i] || [];
      }
      await saveSelectedQuestions(sessionId, payload);
      setSaveMsg('Questions saved to session!');
      setTimeout(() => setSaveMsg(''), 3000);
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to save selection');
    } finally {
      setSavingSelection(false);
    }
  };

  const handleEditorSave = async (payload) => {
    if (editorMode === 'edit' && editingQuestion) {
      await updateQuestion(editingQuestion._id, payload);
    } else {
      await createQuestion(payload);
    }
    fetchQuestions({ folder: selectedFolder, search: debouncedSearch, level: filterLevel, difficulty: filterDifficulty, sort });
  };

  const handleDeleteQuestion = async () => {
    if (!deleteQuestionTarget) return;
    try {
      await deleteQuestion(deleteQuestionTarget._id);
      setDeleteQuestionTarget(null);
      fetchQuestions({ folder: selectedFolder, search: debouncedSearch, level: filterLevel, difficulty: filterDifficulty, sort });
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to delete question');
    }
  };

  const allSelectedIds = useMemo(() => {
    return Object.values(selectedIds).flat();
  }, [selectedIds]);

  const handleSingleCopyOpen = (question) => {
    setCopyMoveTargetIds([question._id]);
    setCopyMoveMode('copy');
    setCopyMoveOpen(true);
  };

  const handleSingleMoveOpen = (question) => {
    setCopyMoveTargetIds([question._id]);
    setCopyMoveMode('move');
    setCopyMoveOpen(true);
  };

  const handleBulkCopyOpen = () => {
    setCopyMoveTargetIds(allSelectedIds);
    setCopyMoveMode('copy');
    setCopyMoveOpen(true);
  };

  const handleBulkMoveOpen = () => {
    setCopyMoveTargetIds(allSelectedIds);
    setCopyMoveMode('move');
    setCopyMoveOpen(true);
  };

  const handleCopyMoveConfirm = async (targetFolder) => {
    setActionError('');
    try {
      if (copyMoveMode === 'copy') {
        await copyQuestions(copyMoveTargetIds, targetFolder);
      } else {
        await moveQuestions(copyMoveTargetIds, targetFolder);
      }
      setCopyMoveOpen(false);
      setCopyMoveTargetIds([]);
      // Clear selection
      setSelectedIds({ 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [] });
      await fetchFolders();
      await fetchQuestions({ folder: selectedFolder, search: debouncedSearch, level: filterLevel, difficulty: filterDifficulty, sort });
    } catch (err) {
      setActionError(err.response?.data?.message || `Failed to ${copyMoveMode} questions`);
    }
  };

  const handleCreateFolder = async () => {
    const name = newFolderInput.trim();
    if (!name) return;
    setCreatingFolder(true);
    setActionError('');
    try {
      await createFolder(name);
      setNewFolderInput('');
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to create folder');
    } finally {
      setCreatingFolder(false);
    }
  };

  const handleCreateLevel = () => {
    const lvlNum = Number(newLevelInput);
    setActionError('');
    if (!newLevelInput.trim() || isNaN(lvlNum) || lvlNum < 1) {
      setActionError('Please enter a valid level number (integer >= 1)');
      return;
    }
    if (filterLevels.includes(lvlNum)) {
      setActionError('Level already exists');
      return;
    }
    setCustomLevels(prev => [...prev, lvlNum]);
    setNewLevelInput('');
  };

  const handleRenameFolder = async (newName) => {
    setActionError('');
    try {
      if (selectedFolder === renameFolderTarget) setSelectedFolder(newName);
      await renameFolder(renameFolderTarget, newName);
      setRenameDialogOpen(false);
      setRenameFolderTarget('');
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to rename folder');
    }
  };

  const handleDeleteFolder = async () => {
    setActionError('');
    try {
      if (selectedFolder === deleteFolderTarget) setSelectedFolder('all');
      await deleteFolder(deleteFolderTarget);
      setDeleteFolderTarget('');
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to delete folder');
    }
  };

  const filterLevels = useMemo(() => {
    const levels = new Set(allExistingLevels);
    customLevels.forEach(lvl => levels.add(lvl));
    Object.keys(selectedIds).forEach(lvl => {
      if (selectedIds[lvl]?.length > 0) {
        levels.add(Number(lvl));
      }
    });
    return Array.from(levels).sort((a, b) => a - b);
  }, [allExistingLevels, selectedIds, customLevels]);

  const isAllSelected = useMemo(() => {
    if (questions.length === 0) return false;
    return questions.every(q => isSelected(q._id));
  }, [questions, isSelected]);

  const handleSelectAllToggle = () => {
    if (isAllSelected) {
      setSelectedIds((prev) => {
        const next = { ...prev };
        questions.forEach(q => {
          const l = q.level || 1;
          if (next[l]) {
            next[l] = next[l].filter(id => id !== q._id);
          }
        });
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = { ...prev };
        questions.forEach(q => {
          const l = q.level || 1;
          if (!next[l]) {
            next[l] = [];
          }
          if (!next[l].includes(q._id)) {
            next[l] = [...next[l], q._id];
          }
        });
        return next;
      });
    }
  };

  const totalSelected = Object.values(selectedIds).reduce((sum, list) => sum + list.length, 0);

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Top bar */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {sessionId ? (
            <>
              <button
                onClick={() => navigate(`/admin/${sessionId}`)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#6b7280', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}
              >
                ← Back to Dashboard
              </button>
              <span style={{ color: '#d1d5db' }}>|</span>
            </>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fff7ed', border: '1px solid #fed7aa', padding: '4px 10px', borderRadius: 6 }}>
                <span style={{ fontSize: 12, color: '#ea580c', fontWeight: 600 }}>Super Admin Mode</span>
              </div>
              <span style={{ color: '#d1d5db' }}>|</span>
            </>
          )}
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#111827' }}>Question Library</h1>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {saveMsg && <span style={{ fontSize: 13, color: '#15803d', fontWeight: 500 }}>{saveMsg}</span>}
          {sessionId && totalSelected > 0 && (
            <button
              onClick={handleSaveToSession}
              disabled={savingSelection}
              style={{
                padding: '8px 20px', borderRadius: 8, border: 'none',
                background: savingSelection ? '#fed7aa' : '#f97316',
                color: '#fff', fontWeight: 600, fontSize: 13, cursor: savingSelection ? 'not-allowed' : 'pointer',
              }}
            >
              {savingSelection ? 'Saving…' : `Save ${totalSelected} Question${totalSelected !== 1 ? 's' : ''} to Session`}
            </button>
          )}
          <button
            onClick={() => { setEditorMode('create'); setEditingQuestion(null); setEditorOpen(true); }}
            style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: '#111827', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
          >
            + New Question
          </button>
        </div>
      </div>

      {actionError && (
        <div style={{ background: '#fef2f2', borderBottom: '1px solid #fca5a5', padding: '10px 24px', color: '#b91c1c', fontSize: 13 }}>
          {actionError}
          <button onClick={() => setActionError('')} style={{ marginLeft: 12, background: 'none', border: 'none', cursor: 'pointer', color: '#b91c1c', fontWeight: 700 }}>×</button>
        </div>
      )}

      <div style={{ display: 'flex', minHeight: 'calc(100vh - 61px)' }}>
        {/* ── Sidebar ── */}
        <div style={{ width: 260, minWidth: 260, background: '#fff', borderRight: '1px solid #e5e7eb', padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <p style={{ margin: '0 0 8px 4px', fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Folders</p>

          <SidebarButton selected={selectedFolder === 'all'} onClick={() => setSelectedFolder('all')}>
            📁 All Questions
          </SidebarButton>

          {folders.map(folder => (
            <div key={folder} style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <SidebarButton
                selected={selectedFolder === folder}
                onClick={() => setSelectedFolder(folder)}
                indent={0}
              >
                📂 {folder}
              </SidebarButton>
              {folder !== 'General' && (
                <div style={{ display: 'flex', gap: 2 }}>
                  <button
                    title="Rename"
                    onClick={() => { setRenameFolderTarget(folder); setRenameDialogOpen(true); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#9ca3af', padding: '4px 2px' }}
                  >✏️</button>
                  <button
                    title="Delete"
                    onClick={() => setDeleteFolderTarget(folder)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#9ca3af', padding: '4px 2px' }}
                  >🗑️</button>
                </div>
              )}
            </div>
          ))}

          {/* Add folder */}
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <input
              placeholder="New folder name…"
              value={newFolderInput}
              onChange={(e) => setNewFolderInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleCreateFolder(); }}
              style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '7px 10px', fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box' }}
            />
            <button
              onClick={handleCreateFolder}
              disabled={creatingFolder || !newFolderInput.trim()}
              style={{
                padding: '7px', borderRadius: 8, border: 'none',
                background: !newFolderInput.trim() ? '#f3f4f6' : '#f97316',
                color: !newFolderInput.trim() ? '#9ca3af' : '#fff',
                fontSize: 12, fontWeight: 600, cursor: newFolderInput.trim() ? 'pointer' : 'not-allowed',
              }}
            >
              {creatingFolder ? 'Creating…' : '+ Create Folder'}
            </button>
          </div>

          {/* Levels Section */}
          <p style={{ margin: '16px 0 8px 4px', fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Levels</p>

          {filterLevels.map(level => (
            <div key={level} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <SidebarButton
                selected={selectedFolder === 'all' && filterLevel === String(level)}
                onClick={() => {
                  setSelectedFolder('all');
                  setFilterLevel(String(level));
                }}
              >
                ⭐ Level {level}
              </SidebarButton>
              {sessionId && (
                <span style={{ fontSize: 12, fontWeight: 700, paddingRight: 8, color: selectedIds[level]?.length > 0 ? '#f97316' : '#d1d5db', pointerEvents: 'none' }}>
                  {selectedIds[level]?.length || 0} Qs
                </span>
              )}
            </div>
          ))}

          {/* Add level */}
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <input
              type="number"
              min="1"
              placeholder="New level number…"
              value={newLevelInput}
              onChange={(e) => setNewLevelInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleCreateLevel(); }}
              style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '7px 10px', fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box' }}
            />
            <button
              onClick={handleCreateLevel}
              disabled={!newLevelInput.trim()}
              style={{
                padding: '7px', borderRadius: 8, border: 'none',
                background: !newLevelInput.trim() ? '#f3f4f6' : '#f97316',
                color: !newLevelInput.trim() ? '#9ca3af' : '#fff',
                fontSize: 12, fontWeight: 600, cursor: newLevelInput.trim() ? 'pointer' : 'not-allowed',
              }}
            >
              + Add Level
            </button>
          </div>
        </div>

        {/* ── Main content ── */}
        <div style={{ flex: 1, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
          {/* Filter bar */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
            <input
              placeholder="Search questions…"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 14px', fontSize: 13, outline: 'none', width: 260, boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>LEVEL</span>
              <Badge active={filterLevel === ''} onClick={() => setFilterLevel('')}>
                All
              </Badge>
              {filterLevels.map(l => (
                <Badge key={l} active={filterLevel === String(l)} onClick={() => setFilterLevel(String(l))}>
                  L{l}
                </Badge>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>DIFFICULTY</span>
              {['', 'easy', 'medium', 'hard'].map(d => (
                <Badge key={d} active={filterDifficulty === d} onClick={() => setFilterDifficulty(d)}>
                  {d === '' ? 'All' : d.charAt(0).toUpperCase() + d.slice(1)}
                </Badge>
              ))}
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>SORT</span>
              {['newest', 'oldest'].map(s => (
                <Badge key={s} active={sort === s} onClick={() => setSort(s)}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </Badge>
              ))}
            </div>
          </div>

          {/* Stats row & Select All */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <span style={{ fontSize: 13, color: '#6b7280' }}>
              {questionsLoading ? 'Loading…' : `${pagination.total} question${pagination.total !== 1 ? 's' : ''}`}
              {selectedFolder !== 'all' ? ` in "${selectedFolder}"` : ''}
            </span>
            {questions.length > 0 && (
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#374151', cursor: 'pointer', userSelect: 'none', fontWeight: 500 }}>
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleSelectAllToggle}
                  style={{
                    width: 16, height: 16, border: '1px solid #d1d5db', borderRadius: 4,
                    cursor: 'pointer', accentColor: '#f97316'
                  }}
                />
                Select All
              </label>
            )}
          </div>

          {allSelectedIds.length > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px',
              background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 10,
              fontSize: 13, color: '#ea580c', fontWeight: 500
            }}>
              <span>{allSelectedIds.length} question(s) selected:</span>
              <button
                onClick={handleBulkCopyOpen}
                style={{
                  padding: '6px 12px', borderRadius: 6, border: '1px solid #fed7aa',
                  background: '#fff', color: '#ea580c', fontWeight: 600, cursor: 'pointer', fontSize: 12
                }}
              >
                Copy Selected
              </button>
              <button
                onClick={handleBulkMoveOpen}
                style={{
                  padding: '6px 12px', borderRadius: 6, border: 'none',
                  background: '#f97316', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 12
                }}
              >
                Move Selected
              </button>
              <button
                onClick={() => {
                  setSelectedIds({ 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [] });
                }}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', marginLeft: 'auto', fontSize: 12
                }}
              >
                Clear Selection
              </button>
            </div>
          )}

          {questionsError && (
            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px', color: '#b91c1c', fontSize: 13 }}>
              {questionsError}
            </div>
          )}

          {/* Question list */}
          {questionsLoading ? (
            <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af', fontSize: 14 }}>Loading questions…</div>
          ) : questions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
              <p style={{ fontSize: 15, color: '#9ca3af', margin: 0 }}>No questions found.</p>
              <p style={{ fontSize: 13, color: '#d1d5db', margin: '4px 0 0' }}>Create a new question to get started.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {questions.map(q => (
                <QuestionCard
                  key={q._id}
                  question={q}
                  selected={isSelected(q._id)}
                  onToggle={(qId) => handleToggleQuestion(qId, q.level)}
                  onEdit={(question) => { setEditingQuestion(question); setEditorMode('edit'); setEditorOpen(true); }}
                  onDelete={(question) => setDeleteQuestionTarget(question)}
                  onCopy={handleSingleCopyOpen}
                  onMove={handleSingleMoveOpen}
                  showCheckbox={true}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Dialogs ── */}
      <QuestionEditorDialog
        open={editorOpen}
        mode={editorMode}
        initialQuestion={editingQuestion}
        folders={folders}
        defaultFolder={selectedFolder === 'all' ? 'General' : selectedFolder}
        onClose={() => setEditorOpen(false)}
        onSaved={handleEditorSave}
        onUploadImage={uploadImage}
        existingLevels={filterLevels}
      />

      <ConfirmDialog
        open={!!deleteQuestionTarget}
        title="Delete Question?"
        message={`Are you sure you want to delete "${deleteQuestionTarget?.text?.slice(0, 60)}…"? This cannot be undone.`}
        onConfirm={handleDeleteQuestion}
        onCancel={() => setDeleteQuestionTarget(null)}
        danger
      />

      <ConfirmDialog
        open={!!deleteFolderTarget}
        title={`Delete "${deleteFolderTarget}" Folder?`}
        message="All questions in this folder will be moved to General. This cannot be undone."
        onConfirm={handleDeleteFolder}
        onCancel={() => setDeleteFolderTarget('')}
        danger
      />

      <RenameDialog
        open={renameDialogOpen}
        current={renameFolderTarget}
        onConfirm={handleRenameFolder}
        onCancel={() => { setRenameDialogOpen(false); setRenameFolderTarget(''); }}
      />

      <CopyMoveQuestionsDialog
        open={copyMoveOpen}
        folders={folders}
        targetCount={copyMoveTargetIds.length}
        mode={copyMoveMode}
        onConfirm={handleCopyMoveConfirm}
        onCancel={() => { setCopyMoveOpen(false); setCopyMoveTargetIds([]); }}
      />
    </div>
  );
}

export default QuestionLibraryPage;
