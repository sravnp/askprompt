import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; general?: string }>({});
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const validateEmail = () => {
    if (!email.trim()) {
      setErrors({ email: 'Email is required' });
      return false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors({ email: 'Please enter a valid email address' });
      return false;
    }
    setErrors({});
    return true;
  };

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // For demo purposes, we'll use signInWithPassword with a placeholder password
      // In a real implementation, this might be a magic link or different flow
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: 'placeholder123', // This would typically be handled differently
      });

      if (error) {
        setErrors({ general: error.message });
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: error.message,
        });
      } else {
        toast({
          title: "Welcome back!",
          description: "You have been successfully logged in.",
        });
        navigate('/dashboard');
      }
    } catch (error) {
      const errorMessage = 'An unexpected error occurred. Please try again.';
      setErrors({ general: errorMessage });
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: error.message,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#121212' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-white mb-2">Welcome back</h1>
        </div>

        <form onSubmit={handleContinue} className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                errors.email 
                  ? 'border-red-500 bg-red-50/5' 
                  : 'border-gray-600 bg-gray-800/50 focus:border-[#A259FF] focus:ring-[#A259FF]/20'
              }`}
              disabled={isLoading}
              autoComplete="email"
              aria-label="Email address"
            />
            {errors.email && (
              <p className="text-sm text-red-400 mt-2" role="alert">
                {errors.email}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading || !email.trim()}
            className="w-full py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ 
              backgroundColor: isLoading || !email.trim() ? '#6B46C1' : '#A259FF',
              color: 'white'
            }}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Continue</span>
              </div>
            ) : (
              'Continue'
            )}
          </Button>

          {errors.general && (
            <div className="text-center">
              <p className="text-sm text-red-400" role="alert">
                {errors.general}
              </p>
            </div>
          )}

          <div className="text-center">
            <button
              type="button"
              className="text-sm transition-colors"
              style={{ color: '#A259FF' }}
              onClick={() => {
                toast({
                  title: "Feature coming soon",
                  description: "Sign up functionality will be available soon.",
                });
              }}
            >
              Don't have an account? Sign up
            </button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 text-gray-400" style={{ backgroundColor: '#121212' }}>OR</span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => handleSocialLogin('google')}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-600 rounded-full bg-transparent text-white hover:bg-gray-800/50 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <button
              type="button"
              onClick={() => handleSocialLogin('apple')}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-600 rounded-full bg-transparent text-white hover:bg-gray-800/50 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              Continue with Apple
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;