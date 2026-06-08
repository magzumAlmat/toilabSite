'use client';

// Регистрация (POST /api/register). Форма вынесена в переиспользуемый RegisterForm.
import RegisterForm from '../_lib/RegisterForm';

export default function RegisterPage() {
  return (
    <div style={{ maxWidth: 460, margin: '32px auto' }}>
      <RegisterForm />
    </div>
  );
}
