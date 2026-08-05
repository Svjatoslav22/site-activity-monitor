import { useState } from 'react';

export default function Login({ onLogin }: { onLogin?: (token: string) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const doLogin = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.access_token) {
        localStorage.setItem('token', data.access_token);
        onLogin?.(data.access_token);
        alert('Успішний вхід');
      } else {
        alert(data.message || 'Помилка входу');
      }
    } catch (e) {
      alert('Помилка мережі');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={doLogin} className="flex items-center gap-2">
      <input
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="rounded-md border px-2 py-1"
      />
      <input
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Пароль"
        type="password"
        className="rounded-md border px-2 py-1"
      />
      <button disabled={loading} className="rounded-md bg-gray-900 px-3 py-1 text-white">
        {loading ? '...' : 'Вхід'}
      </button>
    </form>
  );
}
