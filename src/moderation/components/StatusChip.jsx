'use client';

import { Chip } from '@mui/material';

const MAP = {
  pending: { label: 'На модерации', color: 'warning' },
  approved: { label: 'Одобрено', color: 'success' },
  rejected: { label: 'Отклонено', color: 'error' },
};

export default function StatusChip({ status }) {
  const cfg = MAP[status] || { label: status, color: 'default' };
  return <Chip size="small" label={cfg.label} color={cfg.color} />;
}
