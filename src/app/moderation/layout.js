import ModerationProviders from '@/moderation/components/Providers';

// Раздел модерации использует собственную оболочку (MUI + сессия модератора)
// и не наследует маркетинговую шапку/футер лендинга.
export const metadata = {
  title: 'Toilab · Модерация',
};

export default function ModerationLayout({ children }) {
  return <ModerationProviders>{children}</ModerationProviders>;
}
