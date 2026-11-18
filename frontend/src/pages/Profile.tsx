import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { User as UserIcon, Mail, Target, Award, Download, LogOut, Trash2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { PageShell } from '../components/layout/PageShell';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  calorie_goal: z
    .number({ invalid_type_error: 'Calorie goal must be a number' })
    .min(1200, 'Minimum calorie goal is 1200 kcal')
    .max(4000, 'Maximum calorie goal is 4000 kcal'),
  protein_goal: z
    .number({ invalid_type_error: 'Protein goal must be a number' })
    .min(30, 'Minimum protein goal is 30g')
    .max(300, 'Maximum protein goal is 300g')
    .optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export const Profile: React.FC = () => {
  const { user, updateProfile, loadSampleWeek, deleteAccount, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingSample, setIsLoadingSample] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      calorie_goal: user?.calorie_goal || 2000,
      protein_goal: user?.protein_goal || 75,
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setIsSaving(true);
    try {
      await updateProfile(data);
      toast('Profile updated successfully!', 'success');
    } catch {
      toast('Failed to update profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadSample = async () => {
    setIsLoadingSample(true);
    try {
      await loadSampleWeek();
      toast('Sample week data loaded into your dashboard!', 'success');
      navigate('/home');
    } catch {
      toast('Failed to load sample data', 'error');
    } finally {
      setIsLoadingSample(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount();
      toast('Your account and meal data have been deleted.', 'info');
      navigate('/login');
    } catch {
      toast('Failed to delete account', 'error');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <PageShell maxWidth="md">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text)]">
            Account & Nutrition Goals
          </h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            Personalize your daily energy targets and manage your NutriFit profile.
          </p>
        </div>

        {/* Profile Card */}
        <Card className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b border-[var(--color-border)]">
              <div className="w-14 h-14 rounded-full bg-[var(--color-accent-light)] text-[var(--color-accent-dark)] font-black text-xl flex items-center justify-center uppercase">
                {user?.name ? user.name[0] : <UserIcon className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="font-bold text-base text-[var(--color-text)]">
                  {user?.name || 'User'}
                </h3>
                <p className="text-xs text-[var(--color-text-muted)] flex items-center gap-1.5 mt-0.5">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{user?.email || 'user@nutrifit.app'}</span>
                </p>
              </div>
            </div>

            <Input
              label="Full Name"
              leftIcon={<UserIcon className="w-4 h-4" />}
              error={errors.name?.message}
              {...register('name')}
            />

            <Input
              label="Email Address"
              value={user?.email || ''}
              readOnly
              disabled
              leftIcon={<Mail className="w-4 h-4" />}
              helperText="Email cannot be changed."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <Input
                label="Daily Calorie Goal (kcal)"
                type="number"
                min={1200}
                max={4000}
                leftIcon={<Target className="w-4 h-4" />}
                error={errors.calorie_goal?.message}
                helperText="Allowed range: 1,200 - 4,000 kcal"
                {...register('calorie_goal', { valueAsNumber: true })}
              />

              <Input
                label="Daily Protein Goal (grams, optional)"
                type="number"
                min={30}
                max={300}
                leftIcon={<Award className="w-4 h-4" />}
                error={errors.protein_goal?.message}
                helperText="Allowed range: 30 - 300 g"
                {...register('protein_goal', { valueAsNumber: true })}
              />
            </div>

            <div className="pt-3 flex justify-end">
              <Button
                type="submit"
                isLoading={isSaving}
                disabled={!isDirty || isSaving}
              >
                Save Changes
              </Button>
            </div>
          </form>
        </Card>

        {/* Demo Data & Actions */}
        <Card className="p-6 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
            Explore & Demo
          </h3>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-[var(--color-text)]">
                Load Sample Week Data
              </h4>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                Populate your dashboard with 7 days of realistic Indian meals to preview analytics.
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              isLoading={isLoadingSample}
              onClick={handleLoadSample}
              leftIcon={<Download className="w-4 h-4 stroke-2" />}
              className="w-full sm:w-auto shrink-0"
            >
              Load Sample Week
            </Button>
          </div>
        </Card>

        {/* Account Controls */}
        <Card className="p-6 space-y-4 border-red-200/50">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-danger)]">
            Danger Zone
          </h3>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div>
              <p className="text-sm font-semibold text-[var(--color-text)]">
                Sign Out
              </p>
              <p className="text-xs text-[var(--color-text-muted)]">
                End your current session on this device.
              </p>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                logout();
                navigate('/login');
              }}
              leftIcon={<LogOut className="w-4 h-4 stroke-2" />}
              className="w-full sm:w-auto"
            >
              Log Out
            </Button>
          </div>

          <div className="pt-3 border-t border-[var(--color-border)]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[var(--color-danger)]">
                Delete Account
              </p>
              <p className="text-xs text-[var(--color-text-muted)]">
                Permanently erase your account, logged meals, and streaks.
              </p>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setShowDeleteModal(true)}
              leftIcon={<Trash2 className="w-4 h-4 stroke-2" />}
              className="w-full sm:w-auto bg-red-50 hover:bg-red-100"
            >
              Delete Account
            </Button>
          </div>
        </Card>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-6 max-w-sm w-full space-y-4 shadow-xl fade-in">
            <div className="flex items-center gap-3 text-[var(--color-danger)]">
              <div className="p-2 rounded-full bg-red-100">
                <AlertTriangle className="w-6 h-6 stroke-2" />
              </div>
              <h3 className="text-lg font-bold text-[var(--color-text)]">
                Delete Account?
              </h3>
            </div>

            <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
              This action cannot be undone. All your meal history, nutrition trends, and streak records will be permanently removed.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                isLoading={isDeleting}
                onClick={handleDeleteAccount}
                className="bg-[var(--color-danger)] text-white hover:bg-red-600"
              >
                Yes, Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
};
