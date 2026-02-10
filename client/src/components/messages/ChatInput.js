import React, { useState, useRef, memo, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  FiSend, 
  FiImage, 
  FiSmile, 
  FiX, 
  FiPlus
} from 'react-icons/fi';

const ChatInput = memo(({ 
  onSendMessage, 
  onImageSelect, 
  selectedImage, 
  imagePreview, 
  onRemoveImage,
  disabled 
}) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const commonEmojis = [
    '😀', '😂', '❤️', '😍', '🥰', '😊', '🎉', '👍', 
    '🔥', '✨', '💯', '🙌', '👏', '💪', '🌟', '😎',
    '🤔', '😢', '😭', '😡', '🤣', '😜', '😇', '🥳',
    '🫡', '🫶', '💀', '😤', '🙏', '🤝', '❤️‍🔥', '🤩'
  ];

  // Close emoji picker on click outside
  useEffect(() => {
    if (!showEmojiPicker) return;
    const handleClick = (e) => {
      if (!e.target.closest('.emoji-picker-container')) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [showEmojiPicker]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() || selectedImage) {
      onSendMessage(message.trim());
      setMessage('');
      setShowEmojiPicker(false);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleEmojiClick = (emoji) => {
    setMessage(prev => prev + emoji);
    textareaRef.current?.focus();
  };

  const handleTextareaChange = (e) => {
    setMessage(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageSelect(file);
      // Reset input so user can re-select same file
      e.target.value = '';
    }
  };

  const hasContent = message.trim() || selectedImage;

  return (
    <div className="flex-shrink-0 border-t border-[var(--surface-border)]" style={{ background: 'var(--bg-elevated)' }}>
      {/* Image Preview */}
      <AnimatePresence>
        {imagePreview && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 pt-3 overflow-hidden"
          >
            <div className="relative inline-block">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-20 h-20 object-cover rounded-xl border border-[var(--surface-border)]"
              />
              <button
                onClick={onRemoveImage}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-sm"
              >
                <FiX size={11} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Emoji Picker */}
      <AnimatePresence>
        {showEmojiPicker && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 pt-3 overflow-hidden emoji-picker-container"
          >
            <div className="p-3 bg-white/[0.03] rounded-xl border border-[var(--surface-border)]">
              <div className="flex flex-wrap gap-1">
                {commonEmojis.map((emoji, index) => (
                  <button
                    key={index}
                    onClick={() => handleEmojiClick(emoji)}
                    className="text-xl w-9 h-9 flex items-center justify-center hover:bg-white/5 rounded-lg transition-colors active:scale-90"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-3 sm:p-4">
        <div className="flex items-end gap-2">
          {/* Attachment */}
          <div className="flex items-center gap-1 pb-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            
            <button
              type="button"
              onClick={handleImageClick}
              disabled={disabled}
              className="w-9 h-9 flex items-center justify-center rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-all disabled:opacity-40"
              title="Attach image"
            >
              <FiImage size={18} />
            </button>

            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setShowEmojiPicker(!showEmojiPicker); }}
              disabled={disabled}
              className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all disabled:opacity-40 ${
                showEmojiPicker
                  ? 'text-[var(--accent)] bg-[var(--accent)]/10'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5'
              }`}
              title="Emoji"
            >
              <FiSmile size={18} />
            </button>
          </div>

          {/* Text Input */}
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              disabled={disabled}
              rows={1}
              className="input-glass w-full text-[14px] resize-none disabled:opacity-40"
              style={{ maxHeight: '120px' }}
            />
          </div>

          {/* Send Button */}
          <div className="pb-1">
            <button
              type="submit"
              disabled={disabled || !hasContent}
              className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all active:scale-90 ${
                hasContent
                  ? 'bg-[var(--accent)] text-white shadow-sm shadow-[var(--accent)]/25 hover:brightness-110 hover:shadow-md'
                  : 'bg-white/5 text-[var(--text-muted)] cursor-not-allowed'
              }`}
            >
              <FiSend size={16} className={hasContent ? '' : ''} />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
});

export default ChatInput;
