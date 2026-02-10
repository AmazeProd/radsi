import React, { useState, memo } from 'react';
import { motion } from 'framer-motion';
import { FiCheck, FiCheckCircle, FiTrash2, FiCopy, FiDownload, FiCornerUpRight } from 'react-icons/fi';

const MessageBubble = memo(({ message, isSent, isRead, onDelete, onCopy, currentUser, skipAnimation }) => {
  const [showActions, setShowActions] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    setShowActions(prev => !prev);
    if (!showActions) {
      setTimeout(() => setShowActions(false), 4000);
    }
  };

  const handleCopyText = () => {
    if (message.content) {
      navigator.clipboard.writeText(message.content);
      setShowActions(false);
      onCopy?.();
    }
  };

  const handleDownloadImage = () => {
    if (message.image?.url) {
      window.open(message.image.url, '_blank');
    }
  };

  return (
    <motion.div
      initial={skipAnimation ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={skipAnimation ? { duration: 0 } : { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`flex items-end gap-1.5 group py-0.5 ${isSent ? 'justify-end' : 'justify-start'}`}
      onContextMenu={handleContextMenu}
    >
      {/* Actions - left side for sent */}
      {isSent && (
        <div className={`flex items-center gap-1 transition-all duration-200 ${showActions ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
          {message.content && (
            <button
              onClick={handleCopyText}
              className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
              title="Copy"
            >
              <FiCopy size={12} className="text-[var(--text-muted)]" />
            </button>
          )}
          <button
            onClick={() => { onDelete?.(message._id); setShowActions(false); }}
            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-red-500/20 flex items-center justify-center transition-colors"
            title="Delete"
          >
            <FiTrash2 size={12} className="text-[var(--text-muted)] hover:text-red-400" />
          </button>
        </div>
      )}

      <div className={`relative max-w-[80%] sm:max-w-[70%] md:max-w-[60%]`}>
        {/* Message Bubble */}
        <div
          className={`
            relative overflow-hidden transition-shadow duration-200 max-w-full
            ${isSent 
              ? 'bg-[var(--accent)] text-white rounded-2xl rounded-br-md shadow-sm shadow-[var(--accent)]/10' 
              : 'bg-[var(--bg-elevated)] text-[var(--text-primary)] rounded-2xl rounded-bl-md border border-[var(--surface-border)] shadow-sm'
            }
          `}
        >
          {/* Image Message */}
          {message.image && (
            <div className="relative overflow-hidden group/img">
              <img
                src={message.image.url}
                alt="Attachment"
                onLoad={() => setImageLoaded(true)}
                className={`w-full h-auto max-h-80 object-cover cursor-pointer transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                onClick={() => window.open(message.image.url, '_blank')}
              />
              {/* Download overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/10 transition-all duration-200 flex items-center justify-center">
                <button
                  onClick={handleDownloadImage}
                  className="opacity-0 group-hover/img:opacity-100 bg-black/50 backdrop-blur-sm p-2.5 rounded-xl shadow-lg transition-all duration-200 hover:scale-105"
                >
                  <FiDownload className="text-white" size={16} />
                </button>
              </div>
              {!imageLoaded && (
                <div className="w-full h-48 flex items-center justify-center" style={{ background: 'var(--bg-canvas)' }}>
                  <div className="mini-spinner" />
                </div>
              )}
            </div>
          )}

          {/* Text Content */}
          {message.content && (
            <div className={`${message.image ? 'px-3.5 pt-2.5 pb-1' : 'px-3.5 py-2.5'}`}>
              <p className={`text-[14px] leading-[1.5] break-words select-text ${
                isSent ? 'text-white' : 'text-[var(--text-primary)]'
              }`} style={{ overflowWrap: 'anywhere' }}>
                {message.content}
              </p>
            </div>
          )}

          {/* Timestamp & Status */}
          <div className={`flex items-center gap-1 px-3.5 pb-2 ${
            !message.content && message.image ? 'pt-1' : ''
          } ${
            isSent ? 'justify-end' : 'justify-end'
          }`}>
            <span className={`text-[10px] font-medium tabular-nums ${
              isSent ? 'text-white/60' : 'text-[var(--text-muted)]'
            }`}>
              {formatTime(message.createdAt)}
            </span>
            {isSent && (
              <span className="flex items-center">
                {isRead ? (
                  <FiCheckCircle size={12} className="text-white/60" />
                ) : (
                  <FiCheck size={12} className="text-white/70" />
                )}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Actions - right side for received */}
      {!isSent && (
        <div className={`flex items-center gap-1 transition-all duration-200 ${showActions ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
          {message.content && (
            <button
              onClick={handleCopyText}
              className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
              title="Copy"
            >
              <FiCopy size={12} className="text-[var(--text-muted)]" />
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
});

export default MessageBubble;
