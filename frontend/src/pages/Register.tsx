import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff, User, Mail, Lock, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export const Register: React.FC = () => {
  const { register: registerUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    try {
      await registerUser(data.name, data.email, data.password);
      toast('Account created successfully! Welcome to NutriFit.', 'success');
      navigate('/home');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
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
            Create an Account
          </h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-1.5">
            Begin your mindful nutrition journey today.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="Ankitha"
            leftIcon={<User className="w-4 h-4" />}
            error={errors.name?.message}
            {...register('name')}
          />

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

          <Input
            label="Confirm Password"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="••••••••"
            leftIcon={<Lock className="w-4 h-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowConfirmPassword(p => !p)}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          <div className="pt-2">
            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isSubmitting}
            >
              Sign Up
            </Button>
          </div>
        </form>

        <div className="mt-6 text-center text-xs text-[var(--color-text-muted)]">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-[var(--color-accent-dark)] hover:underline"
          >
            Log in here
          </Link>
        </div>
      </Card>
    </div>
  );
};
