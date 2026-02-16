import { useState } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/apiClient';
import { useOrganizationStore } from '@/stores';

type CreateOrganizationModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateOrganizationModal({
  open,
  onOpenChange,
}: CreateOrganizationModalProps) {
  const setOrganizations = useOrganizationStore((s) => s.setOrganizations);
  const setCurrentOrg = useOrganizationStore((s) => s.setCurrentOrg);
  const organizations = useOrganizationStore((s) => s.organizations);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Organization name is required');
      return;
    }

    setLoading(true);

    try {
      const response = await apiClient.post<{
        organization: { id: string; name: string; description?: string };
        member: { id: string; accessLevel: string };
      }>('/organizations', {
        name: name.trim(),
        description: description.trim() || undefined,
        organizationDetails: {},
      });

      toast.success('Organization created successfully!');

      // Add the new org to the store
      const newOrg = {
        id: response.organization.id,
        name: response.organization.name,
        orgMemberId: response.member.id,
        role: 'OWNER' as const,
        isPersonal: false,
      };

      setOrganizations([...organizations, newOrg]);
      setCurrentOrg(newOrg);

      // Close modal and reset form
      onOpenChange(false);
      setName('');
      setDescription('');
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to create organization';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-neutral-900">
        <DialogHeader>
          <DialogTitle>Create Organization</DialogTitle>
          <DialogDescription>
            Set up a new workspace for your team
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="org-name" className="text-sm font-medium">
              Organization Name *
            </Label>
            <Input
              id="org-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Acme Inc."
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="org-desc" className="text-sm font-medium">
              Description (Optional)
            </Label>
            <Input
              id="org-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A brief description"
              disabled={loading}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-neutral-900"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
