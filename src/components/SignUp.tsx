import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { User, Lock, Mail, Phone, Eye, EyeOff } from 'lucide-react';
import Logo from './ui/Logo';
import { ImageWithFallback } from './figma/ImageWithFallback';
const illustrationUrl = 'https://cdn.builder.io/api/v1/image/assets%2Fdf17999a9acc4e429d59cd3cf95d57a5%2F981d3dd38fea43479784e29426ad6bf7?format=webp&width=800';

type SignUpProps = {
  onSignUp: (name: string, email: string, password: string, mobile: string) => Promise<void>;
  onSwitchToSignIn: () => void;
};

export function SignUp({ onSignUp, onSwitchToSignIn, inline }: SignUpProps & { inline?: boolean }) {
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

  const card = (
    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden flex" style={{minHeight: '380px'}}>
      <div className="p-8 flex flex-col justify-between text-white" style={{borderTopLeftRadius: '1.5rem', borderBottomLeftRadius: '1.5rem', flexBasis: '60%', background: 'linear-gradient(135deg, #16a34a 0%, #34d399 45%, #bbf7d0 100%)'}}>{/* left panel */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="text-white">
              <Logo width={200} height={56} />
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

      <div className="p-8 bg-white flex flex-col justify-center" style={{borderTopRightRadius: '1.5rem', borderBottomRightRadius: '1.5rem', flexBasis: '40%'}}>{/* right panel */}
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
            className="w-full h-12 rounded-xl"
            disabled={loading}
          >
            {loading ? 'Signing up...' : 'Sign up'}
          </Button>
        </form>

        <p className="text-center text-gray-500 mt-6">
          Already have an account.{' '}
          <button
            onClick={onSwitchToSignIn}
            className="text-primary hover:opacity-90"
          >
            SIGN IN
          </button>
        </p>
      </div>
    </div>
  );

  if (inline) return card;

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #064e3b 0%, #013826 100%)' }}>
      <div style={{ width: '55%', margin: '0 auto' }}>
        {card}
      </div>
    </div>
  );
}
