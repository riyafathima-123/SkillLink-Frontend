import React from 'react';
import { Zap, MessageCircle } from 'lucide-react';

export default function SkillCard({ skill, owner, isOwner, onConnect }) {
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all border-l-4 border-blue-500 overflow-hidden group">
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition flex-1">
            {skill.title}
          </h3>
          <span className="text-2xl flex-shrink-0">{owner?.avatar || '👤'}</span>
        </div>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {skill.description || 'No description provided'}
        </p>

        {skill.tags && skill.tags.length > 0 && (
          <div className="flex gap-2 mb-4 flex-wrap">
            {skill.tags.map((tag) => (
              <span
                key={tag}
                className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t">
          <div>
            <p className="text-xs text-gray-500">By {owner?.full_name || 'Unknown'}</p>
            <p className="text-xl font-bold text-blue-600 flex items-center gap-1 mt-1">
              <Zap className="w-4 h-4" /> {skill.price}
            </p>
          </div>

          {isOwner ? (
            <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-2 rounded-lg">
              Your Skill
            </span>
          ) : (
            <button
              onClick={() => onConnect(skill)}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition transform hover:scale-105 flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Connect
            </button>
          )}
        </div>
      </div>
    </div>
  );
}