import React from 'react';
import { Zap, MessageCircle, User } from 'lucide-react';

// Pastel accent colours cycling per card based on skill id
const ACCENTS = [
  { bar: '#6366f1', badge: '#e0e7ff', badgeText: '#4338ca' },
  { bar: '#8b5cf6', badge: '#ede9fe', badgeText: '#6d28d9' },
  { bar: '#ec4899', badge: '#fce7f3', badgeText: '#9d174d' },
  { bar: '#14b8a6', badge: '#ccfbf1', badgeText: '#0f766e' },
  { bar: '#f59e0b', badge: '#fef3c7', badgeText: '#b45309' },
  { bar: '#3b82f6', badge: '#dbeafe', badgeText: '#1d4ed8' },
];

function getAccent(id) {
  const idx = typeof id === 'string'
    ? id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
    : (id || 0);
  return ACCENTS[idx % ACCENTS.length];
}

function Initials({ name, accent }) {
  const parts = (name || 'U').trim().split(' ');
  const text = (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
  return (
    <div style={{
      width: '38px', height: '38px', borderRadius: '50%',
      background: `linear-gradient(135deg, ${accent.bar}, ${accent.bar}99)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontWeight: 700, fontSize: '0.75rem',
      flexShrink: 0, boxShadow: `0 0 0 2.5px ${accent.badge}`,
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
  const accent = getAccent(skill.id);

  const isDisabled = skill.type === 'teach' && !skill.is_approved;

  return (
    <div style={{
      background: '#fff',
      borderRadius: '1.25rem',
      boxShadow: '0 2px 16px rgba(99,102,241,0.08)',
      overflow: 'hidden',
      transition: 'box-shadow 0.22s ease, transform 0.22s ease',
      display: 'flex',
      flexDirection: 'column',
      border: '1.5px solid rgba(99,102,241,0.07)',
    }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = '0 8px 40px rgba(99,102,241,0.16)';
        e.currentTarget.style.transform = 'translateY(-3px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = '0 2px 16px rgba(99,102,241,0.08)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Accent Strip */}
      <div style={{ height: '5px', background: accent.bar }} />

      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
        {/* Title Row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
          <h3 style={{
            fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
            fontWeight: 700, fontSize: '1rem',
            color: '#1e1b4b', lineHeight: 1.35, flex: 1,
          }}>
            {title}
          </h3>
          <Initials name={ownerName} accent={accent} />
        </div>

        {/* Description */}
        <p style={{
          fontSize: '0.8125rem', color: '#64748b', lineHeight: 1.55,
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {description}
        </p>

        {/* Tags */}
        {tags.length > 0 && (
          <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
            {tags.map(tag => (
              <span key={tag} style={{
                background: accent.badge, color: accent.badgeText,
                padding: '0.2rem 0.625rem', borderRadius: '9999px',
                fontSize: '0.7rem', fontWeight: 600,
              }}>
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0.75rem 0 0', borderTop: '1.5px solid #f1f5f9', marginTop: 'auto',
        }}>
          <div>
            <p style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '0.2rem' }}>By {ownerName}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Zap size={14} color="#6366f1" fill="#6366f1" />
              <span style={{ fontWeight: 700, color: '#6366f1', fontSize: '1.0625rem' }}>{price}</span>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>cr/hr</span>
            </div>
          </div>

          {isOwner ? (
            <span style={{
              background: '#f1f5f9', color: '#64748b',
              padding: '0.4rem 0.875rem', borderRadius: '9999px',
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
                borderRadius: '9999px',
                border: 'none',
                fontWeight: 700, fontSize: '0.8125rem', cursor: isDisabled ? 'not-allowed' : 'pointer',
                transition: 'transform 0.15s, box-shadow 0.15s',
                background: isDisabled
                  ? '#e2e8f0'
                  : `linear-gradient(135deg, ${accent.bar}, ${accent.bar}cc)`,
                color: isDisabled ? '#94a3b8' : '#fff',
                boxShadow: isDisabled ? 'none' : `0 4px 14px ${accent.bar}44`,
              }}
              onMouseEnter={e => { if (!isDisabled) e.currentTarget.style.transform = 'scale(1.04)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
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