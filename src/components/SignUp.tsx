import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { User, Lock, Mail, Phone, Eye, EyeOff } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import exampleImage from 'figma:asset/7d9d49904681f7d282ad5bc046bc45f27657e42d.png';

type SignUpProps = {
  onSignUp: (name: string, email: string, password: string, mobile: string) => Promise<void>;
  onSwitchToSignIn: () => void;
};

export function SignUp({ onSignUp, onSwitchToSignIn }: SignUpProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email && password && mobile) {
      setLoading(true);
      try {
        await onSignUp(name, email, password, mobile);
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
              <h1 className="text-white">Kharch</h1>
            </div>
            <div className="flex justify-center">
              <ImageWithFallback
                src={exampleImage}
                alt="Kharch Illustration"
                className="w-64 h-48 object-contain"
              />
            </div>
          </div>

          {/* Form Section */}
          <div className="p-8">
            <h2 className="text-center text-gray-800 mb-6">Sign up</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 h-12 rounded-xl border-gray-200"
                  required
                />
              </div>

              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 rounded-xl border-gray-200 pr-20"
                  required
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                  <Lock className="text-gray-400 w-5 h-5" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
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
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="tel"
                  placeholder="Mobile"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="pl-10 h-12 rounded-xl border-gray-200"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700"
                disabled={loading}
              >
                {loading ? 'Signing up...' : 'Sign up'}
              </Button>
            </form>

            <p className="text-center text-gray-500 mt-6">
              Already have an account.{' '}
              <button
                onClick={onSwitchToSignIn}
                className="text-indigo-600 hover:text-indigo-700"
              >
                SIGN IN
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
