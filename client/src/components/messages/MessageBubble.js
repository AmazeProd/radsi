import React from 'react';
import { Eye } from 'lucide-react';

const MessageBubble = ({ message, showAvatar = true }) => {
  const hasImage = message.image || message.imageUrl;
  const hasText = message.text || message.content;
  
  // Format time
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Mock reactions - in real app, this would come from message data
  const reactions = message.reactions || [
    { emoji: '❤️', count: 40 },
    { emoji: '🔥', count: 6 }
  ];

  const viewCount = message.views || 1234;
  const time = formatTime(message.createdAt || message.timestamp);

  return (
    <div className="flex items-start gap-3 px-4 py-2 hover:bg-white/5 transition-colors group">
      {/* Avatar */}
      {showAvatar && (
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 mt-1">
          {message.sender?.firstName?.charAt(0) || 'U'}
        </div>
      )}

      {/* Message Content */}
      <div className="flex-1 min-w-0">
        {/* Sender Name (if channel) */}
        {showAvatar && (
          <div className="text-sm font-semibold text-blue-400 mb-1">
            {message.sender?.firstName || 'Unknown'} {message.sender?.lastName || ''}
          </div>
        )}

        {/* Message Bubble */}
        <div className="bg-[#212121] rounded-2xl overflow-hidden inline-block max-w-full relative">
          {/* Image (if present) */}
          {hasImage && (
            <div className="w-full">
              <img 
                src={message.image || message.imageUrl} 
                alt="Message attachment" 
                className="w-full h-auto max-w-md object-cover"
              />
            </div>
          )}

          {/* Text Content */}
          {hasText && (
            <div className={`text-gray-100 text-[15px] leading-relaxed ${hasImage ? 'p-3' : 'px-4 py-3'}`}>
              {message.text || message.content}
            </div>
          )}

          {/* Metadata (bottom-right inside bubble) */}
          <div className="px-4 pb-3 flex items-center justify-end gap-3 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <Eye size={14} />
              <span>{viewCount.toLocaleString()}</span>
            </div>
            <span>{time}</span>
          </div>

          {/* Reactions (attached to bottom of bubble) */}
          {reactions && reactions.length > 0 && (
            <div className="absolute -bottom-3 right-4 flex gap-1">
              {reactions.map((reaction, idx) => (
                <div 
                  key={idx}
                  className="bg-[#2a2a2a] border border-gray-700 rounded-full px-2 py-1 flex items-center gap-1 text-xs cursor-pointer hover:bg-[#333] transition-colors"
                >
                  <span>{reaction.emoji}</span>
                  <span className="text-gray-300">{reaction.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
