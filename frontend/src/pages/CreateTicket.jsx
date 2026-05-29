import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import TicketForm from '../components/TicketForm';

export default function CreateTicket() {
  const navigate = useNavigate();
  return (
    <Layout>
      <TicketForm onSuccess={() => navigate('/')} onCancel={() => navigate('/')} />
    </Layout>
  );
}