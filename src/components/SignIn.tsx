import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import Logo from './ui/Logo';
import { ImageWithFallback } from './figma/ImageWithFallback';
const illustrationUrl = 'https://cdn.builder.io/api/v1/image/assets%2Fdf17999a9acc4e429d59cd3cf95d57a5%2F981d3dd38fea43479784e29426ad6bf7?format=webp&width=800';

type SignInProps = {
  onSignIn: (email: string, password: string) => Promise<void>;
  onSwitchToSignUp: () => void;
};

export function SignIn({ onSignIn, onSwitchToSignUp, inline }: SignInProps & { inline?: boolean }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      setLoading(true);
      try {
        await onSignIn(email, password);
      } finally {
        setLoading(false);
      }
    }
  };

  const card = (
    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col sm:flex-row" style={{minHeight: '380px'}}>
      {/* Left panel - Hidden on mobile, visible on large screens */}
      <div className="hidden lg:block p-8 lg:flex lg:flex-col lg:justify-between text-white lg:w-[60%]" style={{background: 'linear-gradient(135deg, #16a34a 0%, #34d399 45%, #bbf7d0 100%)'}}>
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center">
              <div className="text-white">
                <Logo width={200} height={56} />
              </div>
            </div>
          </div>
          <div className="flex justify-center">
            <ImageWithFallback
              src={illustrationUrl}
              alt="Kharch Illustration"
              className="w-80 h-64 md:w-96 md:h-72 object-contain"
            />
          </div>
        </div>
        <div className="mt-6 text-white">
          <h3 className="text-2xl font-semibold leading-tight max-w-xs">Manage your money effortlessly — track expenses, save smarter, and reach your goals with Kharch.</h3>
        </div>
      </div>

      {/* Right panel - Form */}
      <div className="p-6 sm:p-8 bg-white flex flex-col justify-center w-full lg:w-[40%]">
        <h2 className="text-center text-gray-800 mb-6">Sign in</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 z-10 pointer-events-none" />
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 h-12 rounded-xl border-gray-200"
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 z-10 pointer-events-none" />
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 rounded-xl border-gray-200 pl-10 pr-12"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer z-10"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>

          <Button
            type="submit"
            className="w-full h-12 rounded-xl bg-primary text-primary-foreground"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        <p className="text-center text-gray-500 mt-6">
          I'm new user.{' '}
          <button
            onClick={onSwitchToSignUp}
            className="text-primary hover:opacity-90"
          >
            SIGN UP
          </button>
        </p>
      </div>
    </div>
  );

  if (inline) return card;

  return (
    <div className="min-h-screen flex items-center justify-center p-0 sm:p-4" style={{ background: 'linear-gradient(135deg, #064e3b 0%, #013826 100%)' }}>
      <div className="max-w-[990px] mx-auto">
        {card}
      </div>
    </div>
  );
}
