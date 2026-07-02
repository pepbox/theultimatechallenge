import React from 'react';
import { ClipboardCheck, CheckCircle, XCircle, Inbox } from 'lucide-react';

function ManualVerificationSection({
  requests = [],
  onVerify,
  onReject,
  processingIds = new Set(),
}) {
  return (
    <div className="w-full border-2 border-[#11111133]/40 rounded-2xl bg-white font-sans flex flex-col">
      <div className="flex items-center gap-2 p-3 border-b border-gray-200">
        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
          <ClipboardCheck size={16} className="text-[#FCA61E]" />
        </div>
        <div>
          <h2 className="text-gray-900 font-bold text-sm">Manual Verification</h2>
          <p className="text-gray-500 text-xs">
            {requests.length} pending request{requests.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="overflow-y-auto max-h-[380px]">
        {requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 gap-2">
            <Inbox size={24} className="text-gray-300" />
            <p className="text-gray-400 text-xs font-medium">No pending requests</p>
          </div>
        ) : (
          <div className="p-3 flex flex-col gap-3">
            {requests.map((req) => {
              const key = `${req.teamId}_${req.questionId}`;
              const isProcessing = processingIds.has(key);

              return (
                <div
                  key={key}
                  className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex flex-col gap-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-orange-100 text-orange-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-orange-200">
                          {req.teamName}
                        </span>
                        <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200">
                          {req.points} pts
                        </span>
                      </div>
                      <p className="text-gray-700 text-xs leading-snug line-clamp-2">
                        {req.questionText}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-1">
                    <button
                      onClick={() => !isProcessing && onVerify(req.teamId, req.questionId)}
                      disabled={isProcessing}
                      className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1 text-xs font-bold transition-all ${
                        isProcessing
                          ? 'bg-green-100 border border-green-200 text-green-400 cursor-not-allowed opacity-50'
                          : 'bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 active:scale-95'
                      }`}
                    >
                      {isProcessing ? (
                        <div className="w-3 h-3 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <CheckCircle size={14} />
                      )}
                      <span>Verify</span>
                    </button>

                    <button
                      onClick={() => !isProcessing && onReject(req.teamId, req.questionId)}
                      disabled={isProcessing}
                      className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1 text-xs font-bold transition-all ${
                        isProcessing
                          ? 'bg-red-100 border border-red-200 text-red-400 cursor-not-allowed opacity-50'
                          : 'bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 active:scale-95'
                      }`}
                    >
                      {isProcessing ? (
                        <div className="w-3 h-3 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <XCircle size={14} />
                      )}
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default ManualVerificationSection;
