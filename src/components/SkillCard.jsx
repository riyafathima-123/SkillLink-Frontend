import React from 'react';
import { Zap, MessageCircle } from 'lucide-react';

export default function SkillCard({ skill, owner, isOwner, onConnect }) {
  // Handle different field names from backend (Supabase uses skill_name, category, credits_per_hour)
  const title = skill.skill_name || skill.title || skill.name || 'Untitled Skill';
  const description = skill.description || skill.desc || 'No description provided';
  const price = skill.credits_per_hour ?? skill.price ?? skill.credits ?? skill.cost ?? 0;
  const level = skill.level || null;
  const tags = skill.tags || (skill.category ? [skill.category] : []);

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all border-l-4 border-blue-500 overflow-hidden group">
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition flex-1">
            {title}
          </h3>
          <span className="text-2xl flex-shrink-0">{owner?.avatar || '👤'}</span>
        </div>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {description}
        </p>

        {tags && tags.length > 0 && (
          <div className="flex gap-2 mb-4 flex-wrap">
            {tags.map((tag) => (
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
            <p className="text-xs text-gray-500">By {owner?.full_name || owner?.name || owner?.username || 'Unknown'}</p>
            <p className="text-xl font-bold text-blue-600 flex items-center gap-1 mt-1">
              <Zap className="w-4 h-4" /> {price}
            </p>
          </div>

          {isOwner ? (
            <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-2 rounded-lg">
              Your Skill
            </span>
          ) : (
            <button
              onClick={() => onConnect(skill)}
              disabled={skill.type === 'teach' && !skill.is_approved}
              className={`px-4 py-2 rounded-lg font-semibold transition transform flex items-center gap-2 ${skill.type === 'teach' && !skill.is_approved
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 hover:scale-105 text-white"
                }`}
            >
              <MessageCircle className="w-4 h-4" />
              {skill.type === 'teach' && !skill.is_approved ? 'Pending Approval' : 'Connect'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}