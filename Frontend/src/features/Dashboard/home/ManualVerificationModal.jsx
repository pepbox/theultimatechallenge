import React from 'react';
import { X, ClipboardCheck, CheckCircle, XCircle, Inbox } from 'lucide-react';

/**
 * ManualVerificationModal
 *
 * Props:
 *   isOpen            boolean
 *   onClose           () => void
 *   requests          Array<{ teamId, teamName, questionId, questionText, points }>
 *   onVerify          (teamId, questionId) => void
 *   onReject          (teamId, questionId) => void
 *   processingIds     Set<string>   — set of `${teamId}_${questionId}` strings currently in flight
 */
function ManualVerificationModal({
  isOpen,
  onClose,
  requests = [],
  onVerify,
  onReject,
  processingIds = new Set(),
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Panel */}
      <div className="relative z-10 w-full max-w-lg mx-4 sm:mx-auto bg-[#1a1a2e] border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-600/30 flex items-center justify-center border border-purple-500/30">
              <ClipboardCheck size={18} className="text-purple-300" />
            </div>
            <div>
              <h2 className="text-white font-semibold text-[15px]">Manual Verification</h2>
              <p className="text-white/40 text-xs">
                {requests.length} pending request{requests.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <X size={16} className="text-white/70" />
          </button>
        </div>

        {/* Request List */}
        <div className="max-h-[60vh] overflow-y-auto">
          {requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 gap-3">
              <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center">
                <Inbox size={28} className="text-white/20" />
              </div>
              <p className="text-white/30 text-sm font-medium">No pending verification requests</p>
            </div>
          ) : (
            <div className="p-4 flex flex-col gap-3">
              {requests.map((req) => {
                const key = `${req.teamId}_${req.questionId}`;
                const isProcessing = processingIds.has(key);

                return (
                  <div
                    key={key}
                    className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-3"
                  >
                    {/* Team & Question Info */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-purple-600/30 text-purple-200 text-[11px] font-semibold px-2 py-0.5 rounded-full border border-purple-500/30">
                            {req.teamName}
                          </span>
                          <span className="bg-amber-500/20 text-amber-300 text-[11px] font-semibold px-2 py-0.5 rounded-full border border-amber-500/20">
                            {req.points} pts
                          </span>
                        </div>
                        <p className="text-white/80 text-sm leading-snug line-clamp-2">
                          {req.questionText}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => !isProcessing && onVerify(req.teamId, req.questionId)}
                        disabled={isProcessing}
                        className={`flex-1 h-9 rounded-xl flex items-center justify-center gap-1.5 text-sm font-semibold transition-all ${
                          isProcessing
                            ? 'bg-green-700/20 border border-green-500/20 cursor-not-allowed opacity-50'
                            : 'bg-green-600/20 border border-green-500/30 hover:bg-green-600/35 active:scale-95'
                        }`}
                      >
                        {isProcessing ? (
                          <div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <CheckCircle size={16} className="text-green-400" />
                        )}
                        <span className="text-green-300">Verify</span>
                      </button>

                      <button
                        onClick={() => !isProcessing && onReject(req.teamId, req.questionId)}
                        disabled={isProcessing}
                        className={`flex-1 h-9 rounded-xl flex items-center justify-center gap-1.5 text-sm font-semibold transition-all ${
                          isProcessing
                            ? 'bg-red-700/20 border border-red-500/20 cursor-not-allowed opacity-50'
                            : 'bg-red-600/15 border border-red-500/20 hover:bg-red-600/30 active:scale-95'
                        }`}
                      >
                        {isProcessing ? (
                          <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <XCircle size={16} className="text-red-400" />
                        )}
                        <span className="text-red-300">Reject</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 pt-1 text-center">
          <p className="text-white/20 text-xs">
            Verifying awards points instantly to the team in real time
          </p>
        </div>
      </div>
    </div>
  );
}

export default ManualVerificationModal;
