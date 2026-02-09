import React, { useState, memo } from 'react';
import { motion } from 'framer-motion';
import { FiCheck, FiCheckCircle, FiTrash2, FiCopy, FiDownload } from 'react-icons/fi';

const MessageBubble = memo(({ message, isSent, isRead, onDelete, onCopy, currentUser }) => {
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
    setShowActions(true);
    setTimeout(() => setShowActions(false), 3000);
  };

  const handleCopyText = () => {
    if (message.content) {
      navigator.clipboard.writeText(message.content);
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
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className={`flex items-end gap-2 group ${isSent ? 'justify-end' : 'justify-start'}`}
      onContextMenu={handleContextMenu}
    >
      <div className={`relative max-w-[85%] sm:max-w-[75%] md:max-w-[65%] ${isSent ? 'order-2' : 'order-1'}`}>
        {/* Message Bubble */}
        <div
          className={`
            relative overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 max-w-full break-words
            ${isSent 
              ? 'bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 text-white rounded-[20px] rounded-br-md' 
              : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-[20px] rounded-bl-md border border-gray-200 dark:border-gray-700'
            }
          `}
        >
          {/* Image Message */}
          {message.image && (
            <div className="relative overflow-hidden group/img">
              <motion.img
                initial={{ opacity: 0 }}
                animate={{ opacity: imageLoaded ? 1 : 0 }}
                src={message.image.url}
                alt="Message attachment"
                onLoad={() => setImageLoaded(true)}
                className="w-full h-auto max-h-96 object-cover cursor-pointer"
                onClick={() => window.open(message.image.url, '_blank')}
              />
              {/* Image Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/20 transition-all duration-300 flex items-center justify-center">
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ opacity: 1, scale: 1.1 }}
                  onClick={handleDownloadImage}
                  className="opacity-0 group-hover/img:opacity-100 bg-white/90 dark:bg-gray-800/90 p-3 rounded-full shadow-lg"
                >
                  <FiDownload className="text-gray-900 dark:text-white" size={20} />
                </motion.button>
              </div>
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
          )}

          {/* Text Content */}
          {message.content && (
            <div className={message.image ? 'px-4 pt-3 pb-2' : 'px-4 py-3'}>
              <p className={`text-[15px] leading-relaxed break-words select-text overflow-wrap-anywhere ${
                isSent ? 'text-white' : 'text-gray-800 dark:text-gray-100'
              }`} style={{ overflowWrap: 'anywhere' }}>
                {message.content}
              </p>
            </div>
          )}

          {/* Timestamp & Status */}
          <div className={`flex items-center gap-1.5 px-4 pb-2 text-[11px] ${
            isSent ? 'justify-end text-blue-50' : 'justify-end text-gray-500 dark:text-gray-400'
          }`}>
            <span className="font-medium">{formatTime(message.createdAt)}</span>
            {isSent && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                {isRead ? (
                  <FiCheckCircle size={14} className="text-blue-100" />
                ) : (
                  <FiCheck size={14} className="text-blue-200" />
                )}
              </motion.div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: showActions || undefined ? 1 : 0, scale: showActions || undefined ? 1 : 0.8 }}
          className={`
            absolute ${isSent ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'} 
            top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity
          `}
        >
          {message.content && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleCopyText}
              className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center justify-center shadow-md"
              title="Copy text"
            >
              <FiCopy size={14} className="text-gray-700 dark:text-gray-300" />
            </motion.button>
          )}
          {isSent && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onDelete?.(message._id)}
              className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 flex items-center justify-center shadow-md"
              title="Delete message"
            >
              <FiTrash2 size={14} className="text-red-600 dark:text-red-400" />
            </motion.button>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
});

export default MessageBubble;
