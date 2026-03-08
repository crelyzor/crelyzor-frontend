import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useChangeLanguage } from '@/hooks/queries/useSMAQueries';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'en-US', label: 'English (US)' },
  { code: 'en-GB', label: 'English (UK)' },
  { code: 'es', label: 'Spanish' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
  { code: 'it', label: 'Italian' },
  { code: 'pt', label: 'Portuguese' },
  { code: 'pt-BR', label: 'Portuguese (Brazil)' },
  { code: 'ja', label: 'Japanese' },
  { code: 'zh', label: 'Chinese (Simplified)' },
  { code: 'ko', label: 'Korean' },
  { code: 'ru', label: 'Russian' },
  { code: 'nl', label: 'Dutch' },
  { code: 'hi', label: 'Hindi' },
];

export function ChangeLanguageDialog({
  meetingId,
  open,
  onOpenChange,
}: {
  meetingId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [language, setLanguage] = useState('en');
  const { mutate: changeLanguage, isPending } = useChangeLanguage(meetingId);

  const handleConfirm = () => {
    changeLanguage(language, {
      onSuccess: () => onOpenChange(false),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold">
            Change Transcript Language
          </DialogTitle>
        </DialogHeader>

        <p className="text-xs text-neutral-500 dark:text-neutral-400 -mt-1">
          The recording will be re-transcribed using the selected language.
          Existing transcript, speakers, and AI content will be replaced.
        </p>

        <div className="mt-1">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full h-10 rounded-lg border border-neutral-200 dark:border-neutral-700
                       bg-white dark:bg-neutral-800 text-sm text-neutral-900 dark:text-neutral-100
                       px-3 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 dark:focus:ring-neutral-100/10"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        <DialogFooter className="mt-2 gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            className="text-xs"
            onClick={handleConfirm}
            disabled={isPending}
          >
            {isPending ? 'Starting…' : 'Re-transcribe'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
