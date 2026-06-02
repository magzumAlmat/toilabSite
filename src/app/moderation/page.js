'use client';

import AuthGuard from '@/moderation/components/AuthGuard';
import ModerationShell from '@/moderation/components/ModerationShell';
import ModerationQueueView from '@/moderation/components/ModerationQueueView';

export default function ModerationPage() {
  return (
    <AuthGuard>
      <ModerationShell>
        <ModerationQueueView />
      </ModerationShell>
    </AuthGuard>
  );
}
