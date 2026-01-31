'use client';

import type { HerbRole } from '@/types/drupal';

interface HerbRoleBadgeProps {
  role: HerbRole;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const roleConfig: Record<HerbRole, { icon: string; label: string; color: string; bgColor: string }> = {
  chief: {
    icon: '👑',
    label: 'Chief',
    color: 'text-amber-800',
    bgColor: 'bg-amber-100 border-amber-300',
  },
  deputy: {
    icon: '🎖️',
    label: 'Deputy',
    color: 'text-blue-800',
    bgColor: 'bg-blue-100 border-blue-300',
  },
  assistant: {
    icon: '🛡️',
    label: 'Assistant',
    color: 'text-green-800',
    bgColor: 'bg-green-100 border-green-300',
  },
  envoy: {
    icon: '📮',
    label: 'Envoy',
    color: 'text-purple-800',
    bgColor: 'bg-purple-100 border-purple-300',
  },
};

const sizeClasses = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-3 py-1',
  lg: 'text-base px-4 py-1.5',
};

export function HerbRoleBadge({ role, size = 'md', showLabel = true }: HerbRoleBadgeProps) {
  const config = roleConfig[role];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${config.bgColor} ${config.color} ${sizeClasses[size]}`}
    >
      <span>{config.icon}</span>
      {showLabel && <span>{config.label}</span>}
    </span>
  );
}

export function HerbRoleLabel({ role }: { role: HerbRole }) {
  const config = roleConfig[role];
  return (
    <span className={`font-semibold ${config.color}`}>
      {config.icon} {config.label.toUpperCase()}
    </span>
  );
}
