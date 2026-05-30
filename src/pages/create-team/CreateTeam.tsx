/**
 * Phase 6 P10 — /teams/new route.
 *
 * Modal-as-page: opens CreateTeamModal on mount; navigating away (via
 * Cancel or Esc) returns to the home page. The Layout's cross-fade
 * wrapper handles the page transition.
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageMotion } from '@/components/PageMotion';
import { CreateTeamModal } from '@/components/teams/CreateTeamModal';

export default function CreateTeam() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (!open) navigate('/', { replace: true });
  }, [open, navigate]);

  return (
    <PageMotion>
      <div className="min-h-[60vh]" />
      <CreateTeamModal open={open} onOpenChange={setOpen} />
    </PageMotion>
  );
}
