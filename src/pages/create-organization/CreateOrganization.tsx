import { useNavigate } from 'react-router-dom';
import { CreateOrganizationModal } from '@/components/organization-selector/CreateOrganizationModal';

export default function CreateOrganization() {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate('/');
  };

  return <CreateOrganizationModal open={true} onOpenChange={handleClose} />;
}
