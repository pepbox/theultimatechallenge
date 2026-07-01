import React from 'react';

const DIFFICULTY_COLORS = {
  easy: { bg: '#dcfce7', text: '#15803d' },
  medium: { bg: '#fef9c3', text: '#a16207' },
  hard: { bg: '#fee2e2', text: '#b91c1c' },
};

const LEVEL_COLORS = {
  1: { bg: '#e0f2fe', text: '#0369a1' },
  2: { bg: '#ede9fe', text: '#6d28d9' },
  3: { bg: '#fce7f3', text: '#be185d' },
};

const ANSWER_TYPE_LABELS = {
  text: 'Text',
  image: 'Image',
  video: 'Video',
  fileUpload: 'File Upload',
};

function QuestionCard({ question, selected, onToggle, onEdit, onDelete, onCopy, onMove, showCheckbox = true, isSuperAdmin = true }) {
  const diffColor = DIFFICULTY_COLORS[question.difficulty] || { bg: '#f3f4f6', text: '#374151' };
  const levelColor = LEVEL_COLORS[question.level] || { bg: '#f3f4f6', text: '#374151' };

  const canModify = question.canModify !== undefined ? question.canModify : isSuperAdmin;

  return (
    <div
      style={{
        border: (selected && showCheckbox) ? '2px solid #f97316' : '1px solid #e5e7eb',
        borderRadius: 12,
        padding: '14px 16px',
        background: (selected && showCheckbox) ? '#fff7ed' : '#ffffff',
        display: 'flex',
        gap: 12,
        alignItems: 'flex-start',
        transition: 'all 0.15s ease',
        cursor: showCheckbox ? 'pointer' : 'default',
      }}
      onClick={() => { if (showCheckbox) onToggle(question._id); }}
    >
      {/* Checkbox */}
      {showCheckbox && (
        <div
          style={{
            width: 20,
            height: 20,
            minWidth: 20,
            borderRadius: 4,
            border: selected ? '2px solid #f97316' : '2px solid #d1d5db',
            background: selected ? '#f97316' : '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 2,
            transition: 'all 0.15s ease',
          }}
        >
          {selected && (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
      )}

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
          {/* Level badge */}
          <span style={{ fontSize: 11, fontWeight: 600, borderRadius: 999, padding: '2px 8px', background: levelColor.bg, color: levelColor.text }}>
            Level {question.level}
          </span>
          {/* Difficulty */}
          <span style={{ fontSize: 11, fontWeight: 600, borderRadius: 999, padding: '2px 8px', background: diffColor.bg, color: diffColor.text }}>
            {question.difficulty}
          </span>
          {/* Answer type */}
          <span style={{ fontSize: 11, fontWeight: 500, borderRadius: 999, padding: '2px 8px', background: '#f3f4f6', color: '#6b7280' }}>
            {ANSWER_TYPE_LABELS[question.answerType] || question.answerType}
          </span>
          {/* Points */}
          <span style={{ fontSize: 11, fontWeight: 600, borderRadius: 999, padding: '2px 8px', background: '#f0fdf4', color: '#15803d' }}>
            {question.points} pts
          </span>
        </div>

        <p style={{ margin: 0, fontWeight: 500, fontSize: 14, color: '#111827', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {question.text}
        </p>

        {question.category && (
          <p style={{ margin: '4px 0 0', fontSize: 12, color: '#9ca3af' }}>
            {question.category}
          </p>
        )}

        {question.questionImageUrl && (
          <img
            src={question.questionImageUrl}
            alt="Question"
            style={{ marginTop: 8, maxHeight: 80, maxWidth: '100%', borderRadius: 6, objectFit: 'cover' }}
          />
        )}
      </div>

      {/* Actions */}
      <div
        style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 64 }}
        onClick={(e) => e.stopPropagation()}
      >
        {canModify && (
          <button
            onClick={() => onEdit(question)}
            style={{
              fontSize: 12, fontWeight: 500, padding: '4px 10px',
              border: '1px solid #d1d5db', borderRadius: 6,
              background: '#fff', color: '#374151', cursor: 'pointer',
            }}
          >
            Edit
          </button>
        )}
        {canModify && (
          <button
            onClick={() => onDelete(question)}
            style={{
              fontSize: 12, fontWeight: 500, padding: '4px 10px',
              border: '1px solid #fca5a5', borderRadius: 6,
              background: '#fff', color: '#ef4444', cursor: 'pointer',
            }}
          >
            Delete
          </button>
        )}
        <button
          onClick={() => onCopy(question)}
          style={{
            fontSize: 12, fontWeight: 500, padding: '4px 10px',
            border: '1px solid #d1d5db', borderRadius: 6,
            background: '#fff', color: '#10b981', cursor: 'pointer',
          }}
        >
          Copy
        </button>
        {canModify && (
          <button
            onClick={() => onMove(question)}
            style={{
              fontSize: 12, fontWeight: 500, padding: '4px 10px',
              border: '1px solid #d1d5db', borderRadius: 6,
              background: '#fff', color: '#3b82f6', cursor: 'pointer',
            }}
          >
            Move
          </button>
        )}
      </div>
    </div>
  );
}

export default QuestionCard;
