import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTickets } from '../api';

export default function TicketList() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [statuses, setStatuses] = useState([]);
  const navigate = useNavigate();

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await getTickets(params);
      setTickets(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
    // fetch statuses
    import('../api').then(({ getStatuses }) => {
      getStatuses().then(res => setStatuses(res.data));
    });
  }, [search, statusFilter]);

  const formatDate = (date) => new Date(date).toLocaleString();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-2 flex-1">
          <input
            type="text"
            placeholder="Search by name, email, subject, ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-3 py-2 border rounded-lg"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg bg-white"
          >
            <option value="">All Status</option>
            {statuses.map(s => (
              <option key={s.id} value={s.name}>{s.name}</option>
            ))}
          </select>
        </div>
        <button
          onClick={() => navigate('/tickets/new')}
          className="bg-[rgb(0,94,106)] text-white px-4 py-2 rounded-lg"
        >
          + New Ticket
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">Loading...</div>
        ) : tickets.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No tickets found</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[rgb(0,94,106)] text-white">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">ID</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Customer</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Subject</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tickets.map(ticket => (
                <tr key={ticket.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/tickets/${ticket.id}`)}>
                  <td className="px-4 py-3 text-sm text-gray-900">{ticket.ticket_id}</td>
                  <td className="px-4 py-3 text-sm">{ticket.customer_name}<br/><span className="text-xs text-gray-500">{ticket.customer_email}</span></td>
                  <td className="px-4 py-3 text-sm">{ticket.subject}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      ticket.status_name === 'Open' ? 'bg-red-100 text-red-800' :
                      ticket.status_name === 'In Progress' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {ticket.status_name}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">{formatDate(ticket.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}