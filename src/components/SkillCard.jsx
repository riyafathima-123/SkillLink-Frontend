import React from 'react';
import { Zap, MessageCircle } from 'lucide-react';

// Category → pill colour mapping
const CATEGORY_PILLS = {
  technology: { bg: '#dbeafe', color: '#1d4ed8', label: 'Technology' },
  technical: { bg: '#dbeafe', color: '#1d4ed8', label: 'Technology' },
  languages: { bg: '#ede9fe', color: '#6d28d9', label: 'Languages' },
  language: { bg: '#ede9fe', color: '#6d28d9', label: 'Languages' },
  arts: { bg: '#fee2e2', color: '#be123c', label: 'Arts' },
  creative: { bg: '#fee2e2', color: '#be123c', label: 'Creative' },
  business: { bg: '#dcfce7', color: '#15803d', label: 'Business' },
  science: { bg: '#fef3c7', color: '#b45309', label: 'Science' },
  other: { bg: '#f1f5f9', color: '#475569', label: 'Other' },
};

function getCategoryPill(tags, category) {
  const raw = (category || tags?.[0] || 'other').toLowerCase().trim();
  const key = Object.keys(CATEGORY_PILLS).find(k => raw.includes(k)) || 'other';
  return CATEGORY_PILLS[key];
}

function AvatarInitials({ name }) {
  const parts = (name || 'U').trim().split(' ');
  const text = (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
  return (
    <div style={{
      width: '36px', height: '36px', borderRadius: '50%',
      background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontWeight: 700, fontSize: '0.75rem',
      flexShrink: 0,
      border: '2px solid #fff',
      boxShadow: '0 2px 8px rgba(99,102,241,0.25)',
      overflow: 'hidden',
    }}>
      {text}
    </div>
  );
}

export default function SkillCard({ skill, owner, isOwner, onConnect }) {
  const title = skill.skill_name || skill.title || skill.name || 'Untitled Skill';
  const description = skill.description || skill.desc || 'No description provided';
  const price = skill.credits_per_hour ?? skill.price ?? skill.credits ?? skill.cost ?? 0;
  const tags = skill.tags || (skill.category ? [skill.category] : []);
  const ownerName = owner?.full_name || owner?.name || owner?.username || 'Unknown';
  const pill = getCategoryPill(tags, skill.category);
  const isDisabled = skill.type === 'teach' && !skill.is_approved;

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: '16px',
        boxShadow: '0px 4px 12px rgba(0,0,0,0.05), 0px 1px 3px rgba(0,0,0,0.04)',
        overflow: 'hidden',
        transition: 'box-shadow 0.2s ease, transform 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid #f1f5f9',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = '0px 8px 24px rgba(99,102,241,0.12), 0px 2px 6px rgba(0,0,0,0.04)';
        e.currentTarget.style.transform = 'translateY(-3px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = '0px 4px 12px rgba(0,0,0,0.05), 0px 1px 3px rgba(0,0,0,0.04)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>

        {/* Top: Title + Avatar */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.625rem' }}>
          <h3 style={{
            fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
            fontWeight: 700, fontSize: '1rem',
            color: '#0f172a', lineHeight: 1.35, flex: 1,
            letterSpacing: '-0.15px',
          }}>
            {title}
          </h3>
          {owner?.avatar_url
            ? <img src={owner.avatar_url} alt="" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }} />
            : <AvatarInitials name={ownerName} />
          }
        </div>

        {/* Middle: Description */}
        <p style={{
          fontSize: '0.8125rem', color: '#64748b', lineHeight: 1.55,
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
          margin: 0,
        }}>
          {description}
        </p>

        {/* Category pill */}
        <div>
          <span style={{
            display: 'inline-flex', alignItems: 'center',
            background: pill.bg, color: pill.color,
            padding: '0.2rem 0.625rem', borderRadius: '9999px',
            fontSize: '0.7rem', fontWeight: 600,
          }}>
            {pill.label}
          </span>
        </div>

        {/* Bottom: Owner + Price + Button */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          paddingTop: '0.75rem',
          borderTop: '1px solid #f1f5f9',
          marginTop: 'auto',
          gap: '0.5rem',
        }}>
          <div>
            <p style={{ fontSize: '0.6875rem', color: '#94a3b8', marginBottom: '0.2rem' }}>By {ownerName}</p>
            {skill.type !== 'learn' && price > 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Zap size={13} color="#6366f1" fill="#6366f1" />
                <span style={{ fontWeight: 700, color: '#6366f1', fontSize: '1rem' }}>{price}</span>
                <span style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>cr/hr</span>
              </div>
            ) : skill.type === 'learn' ? (
              <span style={{
                display: 'inline-flex', alignItems: 'center',
                background: '#dbeafe', color: '#1d4ed8',
                padding: '0.15rem 0.5rem', borderRadius: '9999px',
                fontSize: '0.65rem', fontWeight: 600, gap: '0.2rem',
              }}>
                📖 Wants to Learn
              </span>
            ) : null}
          </div>

          {isOwner ? (
            <span style={{
              background: '#f1f5f9', color: '#64748b',
              padding: '0.375rem 0.875rem', borderRadius: '9999px',
              fontSize: '0.75rem', fontWeight: 600,
            }}>
              Your Skill
            </span>
          ) : (
            <button
              onClick={() => onConnect(skill)}
              disabled={isDisabled}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.375rem',
                padding: '0.5rem 1rem',
                borderRadius: '10px',
                border: 'none',
                fontWeight: 700, fontSize: '0.8125rem',
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s',
                background: isDisabled
                  ? '#f1f5f9'
                  : 'linear-gradient(135deg, #6366f1, #818cf8)',
                color: isDisabled ? '#94a3b8' : '#fff',
                boxShadow: isDisabled ? 'none' : '0 4px 12px rgba(99,102,241,0.30)',
                fontFamily: 'inherit',
              }}
              onMouseEnter={e => { if (!isDisabled) { e.currentTarget.style.background = 'linear-gradient(135deg, #4f46e5, #6366f1)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(99,102,241,0.38)'; } }}
              onMouseLeave={e => { if (!isDisabled) { e.currentTarget.style.background = 'linear-gradient(135deg, #6366f1, #818cf8)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(99,102,241,0.30)'; } }}
            >
              <MessageCircle size={13} />
              {isDisabled ? 'Pending' : 'Connect'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}