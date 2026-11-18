import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff, Mail, Lock, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    try {
      await login(data.email, data.password);
      toast('Welcome back!', 'success');
      navigate('/home');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid email or password';
      toast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Decorative background blur */}
      <div className="absolute top-1/4 -right-20 w-80 h-80 rounded-full bg-emerald-100/50 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -left-20 w-80 h-80 rounded-full bg-lime-100/40 blur-3xl pointer-events-none" />

      {/* Brand */}
      <div className="mb-6 flex flex-col items-center gap-2">
        <div className="w-11 h-11 rounded-[var(--radius-md)] bg-[var(--color-accent-light)] flex items-center justify-center text-[var(--color-accent)] shadow-sm">
          <Activity className="w-6 h-6 stroke-[2.2]" />
        </div>
        <h2 className="text-xl font-bold tracking-tight text-[var(--color-text)]">
          Nutri<span className="text-[var(--color-accent)]">Fit</span>
        </h2>
      </div>

      <Card className="w-full max-w-md p-6 sm:p-8 relative z-10 shadow-lg">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-[var(--color-text)] tracking-tight">
            Welcome Back
          </h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-1.5">
            Log in to continue tracking your meals and habits.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            leftIcon={<Mail className="w-4 h-4" />}
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            leftIcon={<Lock className="w-4 h-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
            error={errors.password?.message}
            {...register('password')}
          />

          <div className="pt-2">
            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isSubmitting}
            >
              Sign In
            </Button>
          </div>
        </form>

        <div className="mt-6 text-center text-xs text-[var(--color-text-muted)]">
          Don&apos;t have an account yet?{' '}
          <Link
            to="/register"
            className="font-semibold text-[var(--color-accent-dark)] hover:underline"
          >
            Create an account
          </Link>
        </div>
      </Card>
    </div>
  );
};
