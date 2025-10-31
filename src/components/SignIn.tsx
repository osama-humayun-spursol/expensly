import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { User, Lock } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import exampleImage from 'figma:asset/7d9d49904681f7d282ad5bc046bc45f27657e42d.png';

type SignInProps = {
  onSignIn: (email: string, password: string) => Promise<void>;
  onSwitchToSignUp: () => void;
};

export function SignIn({ onSignIn, onSwitchToSignUp }: SignInProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Illustration Section */}
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-8 text-white">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-xl">📊</span>
              </div>
              <h1 className="text-white">ExpenseLy</h1>
            </div>
            <div className="flex justify-center">
              <ImageWithFallback 
                src={exampleImage}
                alt="ExpenseLy Illustration"
                className="w-64 h-48 object-contain"
              />
            </div>
          </div>

          {/* Form Section */}
          <div className="p-8">
            <h2 className="text-center text-gray-800 mb-6">Sign in</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
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
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-12 rounded-xl border-gray-200"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>

            <p className="text-center text-gray-500 mt-6">
              I'm new user.{' '}
              <button
                onClick={onSwitchToSignUp}
                className="text-indigo-600 hover:text-indigo-700"
              >
                SIGN UP
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
