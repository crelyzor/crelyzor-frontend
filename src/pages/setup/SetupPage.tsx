import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authApi } from '@/services/authService';
import { queryKeys } from '@/lib/queryKeys';
import { CARDS_PUBLIC_URL } from '@/lib/publicUrl';

const usernameRegex = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;
const consecutiveHyphens = /--/;

function getValidationError(value: string): string | null {
  if (value.length === 0) return null;
  if (value.length < 3) return 'Must be at least 3 characters';
  if (value.length > 30) return 'Must be at most 30 characters';
  if (consecutiveHyphens.test(value)) return 'No consecutive hyphens allowed';
  if (!usernameRegex.test(value))
    return 'Lowercase letters, numbers, and hyphens only. Cannot start or end with a hyphen.';
  return null;
}

export default function SetupPage() {
  const [username, setUsername] = useState('');
  const [debouncedUsername, setDebouncedUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const qc = useQueryClient();

  // Debounce username → debouncedUsername
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedUsername(username), 300);
    return () => clearTimeout(timer);
  }, [username]);

  const validationError = getValidationError(username);
  const canCheck =
    debouncedUsername.length >= 3 && !getValidationError(debouncedUsername);

  const { data: availabilityData, isFetching: isChecking } = useQuery({
    queryKey: ['username-check', debouncedUsername],
    queryFn: () => authApi.checkUsername(debouncedUsername),
    enabled: canCheck,
    staleTime: 30_000,
  });

  const isAvailable = canCheck ? (availabilityData?.available ?? null) : null;

  const submitMutation = useMutation({
    mutationFn: () => authApi.setUsername(username),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: queryKeys.auth.me() });
      navigate('/', { replace: true });
    },
    onError: (err: unknown) => {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to set username. Please try again.';
      setError(message);
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setUsername(value);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validErr = getValidationError(username);
    if (validErr) {
      setError(validErr);
      return;
    }

    if (!isAvailable) {
      setError('Username is not available');
      return;
    }

    setError(null);
    submitMutation.mutate();
  };

  const canSubmit =
    username.length >= 3 &&
    !validationError &&
    isAvailable === true &&
    !isChecking;

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-950 p-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-12">
          <img
            src="/assets/logo-light.svg"
            alt="Crelyzor"
            className="h-6 block dark:hidden"
          />
          <img
            src="/assets/logo-dark.svg"
            alt="Crelyzor"
            className="h-6 hidden dark:block"
          />
        </div>

        {/* Heading */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-neutral-950 dark:text-neutral-50 tracking-tight mb-2">
            Choose your username
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400">
            Your public card will live at{' '}
            <span className="font-medium text-neutral-700 dark:text-neutral-300">
              {CARDS_PUBLIC_URL.replace(/^https?:\/\//, '')}/[username]
            </span>{' '}
            — pick something you'd share on a business card.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-2 mb-6">
            <Label
              htmlFor="username"
              className="text-neutral-700 dark:text-neutral-300"
            >
              Username
            </Label>
            <Input
              id="username"
              type="text"
              placeholder="e.g. harsh-keshari"
              value={username}
              onChange={handleInputChange}
              maxLength={30}
              autoFocus
              className="h-12 text-base"
            />

            {/* Status indicator */}
            <div className="h-5 text-sm">
              {username.length > 0 && validationError && (
                <p className="text-red-500">{validationError}</p>
              )}
              {username.length >= 3 && !validationError && isChecking && (
                <p className="text-neutral-400">Checking availability...</p>
              )}
              {username.length >= 3 &&
                !validationError &&
                !isChecking &&
                isAvailable === true && (
                  <p className="text-green-600 dark:text-green-400">
                    Username is available
                  </p>
                )}
              {username.length >= 3 &&
                !validationError &&
                !isChecking &&
                isAvailable === false && (
                  <p className="text-red-500">Username is taken</p>
                )}
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full h-12"
            disabled={!canSubmit || submitMutation.isPending}
          >
            {submitMutation.isPending ? 'Setting up...' : 'Continue'}
          </Button>
        </form>

        <p className="text-xs text-neutral-400 text-center mt-6">
          Lowercase letters, numbers, and hyphens. 3-30 characters.
        </p>
      </div>
    </div>
  );
}
