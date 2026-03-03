import React, { useState, useRef, memo, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  FiSend, 
  FiImage, 
  FiSmile, 
  FiX, 
  FiPlus,
  FiCheck,
  FiRefreshCw
} from 'react-icons/fi';
import { generateAIMessage } from '../../services/aiService';

const ChatInput = memo(({ 
  onSendMessage, 
  onImageSelect, 
  selectedImage, 
  imagePreview, 
  onRemoveImage,
  disabled,
  recentMessages 
}) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiTone, setAiTone] = useState('friendly');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [aiError, setAiError] = useState('');
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const aiPromptRef = useRef(null);

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

  // Focus AI prompt input when panel opens
  useEffect(() => {
    if (showAIPanel && aiPromptRef.current) {
      aiPromptRef.current.focus();
    }
  }, [showAIPanel]);

  const tones = [
    { value: 'friendly', emoji: '😊', label: 'Friendly', color: 'from-amber-400 to-orange-400' },
    { value: 'professional', emoji: '💼', label: 'Professional', color: 'from-blue-400 to-indigo-500' },
    { value: 'funny', emoji: '😄', label: 'Funny', color: 'from-yellow-400 to-amber-400' },
    { value: 'romantic', emoji: '💕', label: 'Romantic', color: 'from-pink-400 to-rose-500' },
    { value: 'apologetic', emoji: '🙏', label: 'Sorry', color: 'from-teal-400 to-cyan-500' },
    { value: 'encouraging', emoji: '💪', label: 'Motivate', color: 'from-green-400 to-emerald-500' },
  ];

  const handleGenerateAI = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setAiError('');
    setAiSuggestion('');

    // Build context from recent messages
    let context = '';
    if (recentMessages && recentMessages.length > 0) {
      const last5 = recentMessages.slice(-5);
      context = last5.map(m => {
        const sender = m.isSent ? 'You' : 'Them';
        return `${sender}: ${m.content || '[image]'}`;
      }).join('\n');
    }

    try {
      const response = await generateAIMessage({
        prompt: aiPrompt.trim(),
        tone: aiTone,
        context,
      });
      setAiSuggestion(response.data.message);
    } catch (err) {
      setAiError(err.response?.data?.message || 'Failed to generate. Try again.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleAcceptAI = () => {
    setMessage(aiSuggestion);
    setShowAIPanel(false);
    setAiPrompt('');
    setAiSuggestion('');
    setAiError('');
    textareaRef.current?.focus();
    // Auto-resize textarea for the injected text
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
      }
    }, 0);
  };

  const handleCloseAI = () => {
    setShowAIPanel(false);
    setAiPrompt('');
    setAiSuggestion('');
    setAiError('');
  };

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
    <div className="flex-shrink-0 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800/80">
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
                className="w-20 h-20 object-cover rounded-xl border border-gray-200 dark:border-gray-800"
              />
              <button
                onClick={onRemoveImage}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-full flex items-center justify-center hover:bg-red-600 dark:hover:bg-red-500 dark:hover:text-white transition-colors shadow-sm"
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
            <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
              <div className="flex flex-wrap gap-1">
                {commonEmojis.map((emoji, index) => (
                  <button
                    key={index}
                    onClick={() => handleEmojiClick(emoji)}
                    className="text-xl w-9 h-9 flex items-center justify-center hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-colors active:scale-90"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Panel */}
      <AnimatePresence>
        {showAIPanel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 pt-3 overflow-hidden"
          >
            <div className="p-4 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/40 dark:via-purple-950/30 dark:to-pink-950/20 rounded-2xl border border-indigo-100/80 dark:border-indigo-800/40 shadow-sm">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/25">
                    <span className="text-sm">🤖</span>
                  </div>
                  <div>
                    <span className="text-[13px] font-bold text-gray-800 dark:text-gray-100 block leading-tight">AI Assistant</span>
                    <span className="text-[10px] text-indigo-500 dark:text-indigo-400 font-medium">Powered by Gemini ✨</span>
                  </div>
                </div>
                <button
                  onClick={handleCloseAI}
                  className="w-7 h-7 flex items-center justify-center rounded-xl hover:bg-white/60 dark:hover:bg-gray-800/60 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-all"
                >
                  <FiX size={15} />
                </button>
              </div>

              {/* Tone Selector */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                {tones.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setAiTone(t.value)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] font-semibold transition-all duration-200 ${
                      aiTone === t.value
                        ? `bg-gradient-to-r ${t.color} text-white shadow-md scale-[1.02]`
                        : 'bg-white/70 dark:bg-gray-800/70 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm border border-gray-100 dark:border-gray-700/50'
                    }`}
                  >
                    <span className="text-base">{t.emoji}</span>
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>

              {/* Prompt Input */}
              <div className="flex gap-2 mb-2">
                <input
                  ref={aiPromptRef}
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleGenerateAI(); } }}
                  placeholder="✍️ Describe what you want to say..."
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-white dark:bg-gray-900 border border-indigo-200/80 dark:border-indigo-800/40 text-[13px] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all shadow-sm"
                />
                <button
                  type="button"
                  onClick={handleGenerateAI}
                  disabled={aiLoading || !aiPrompt.trim()}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-[12px] font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md shadow-indigo-500/25 hover:shadow-lg hover:shadow-indigo-500/30"
                >
                  {aiLoading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <span>🚀</span>
                      <span>Generate</span>
                    </>
                  )}
                </button>
              </div>

              {/* Error */}
              {aiError && (
                <div className="text-[12px] text-red-600 dark:text-red-400 mb-2 px-1">
                  {aiError}
                </div>
              )}

              {/* AI Suggestion */}
              {aiSuggestion && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  className="mt-2"
                >
                  <div className="p-3.5 bg-white dark:bg-gray-900 rounded-xl border border-indigo-100 dark:border-indigo-800/40 shadow-sm">
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="text-xs">💬</span>
                      <span className="text-[10px] font-semibold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider">Suggested Message</span>
                    </div>
                    <p className="text-[13px] text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                      {aiSuggestion}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-2.5">
                    <button
                      type="button"
                      onClick={handleAcceptAI}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white text-[12px] font-bold transition-all shadow-md shadow-emerald-500/25 hover:shadow-lg active:scale-95"
                    >
                      <span>✅</span>
                      Use this
                    </button>
                    <button
                      type="button"
                      onClick={handleGenerateAI}
                      disabled={aiLoading}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 text-[12px] font-semibold transition-all border border-gray-200 dark:border-gray-700 hover:shadow-sm active:scale-95"
                    >
                      <FiRefreshCw size={13} className={aiLoading ? 'animate-spin' : ''} />
                      🔄 Try Again
                    </button>
                  </div>
                </motion.div>
              )}
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
              className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 transition-all disabled:opacity-40"
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
                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30'
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900'
              }`}
              title="Emoji"
            >
              <FiSmile size={18} />
            </button>

            <button
              type="button"
              onClick={() => { setShowAIPanel(!showAIPanel); setShowEmojiPicker(false); }}
              disabled={disabled}
              className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all disabled:opacity-40 ${
                showAIPanel
                  ? 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/30'
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900'
              }`}
              title="AI assist"
            >
              <span className="text-[16px] leading-none">✨</span>
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
              className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-[14px] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/30 resize-none transition-all disabled:opacity-40"
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
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/25 hover:bg-indigo-700 hover:shadow-md hover:shadow-indigo-500/30'
                  : 'bg-gray-100 dark:bg-gray-900 text-gray-300 dark:text-gray-700 cursor-not-allowed'
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
