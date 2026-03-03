import { Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useDeleteMeeting } from '@/hooks/queries/useMeetingQueries';

type Props = {
  meetingId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
};

export function DeleteMeetingModal({
  meetingId,
  open,
  onOpenChange,
  onDeleted,
}: Props) {
  const { mutate: deleteMeeting, isPending } = useDeleteMeeting();

  const handleDelete = () => {
    deleteMeeting(meetingId, {
      onSuccess: () => {
        toast.success('Meeting deleted');
        onOpenChange(false);
        onDeleted();
      },
      onError: () => {
        toast.error('Failed to delete meeting');
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base">Delete meeting?</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-neutral-500 dark:text-neutral-400 -mt-1">
          This can't be undone. The meeting, recording, transcript, and all
          notes will be permanently removed.
        </p>

        <DialogFooter className="mt-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="text-xs gap-1.5"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Trash2 className="w-3 h-3" />
            )}
            {isPending ? 'Deleting…' : 'Delete Meeting'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
