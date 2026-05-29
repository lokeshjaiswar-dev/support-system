import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getTicket, updateTicket, getStatuses } from '../api';

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statuses, setStatuses] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [note, setNote] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchTicket = async () => {
    try {
      const res = await getTicket(id);
      setTicket(res.data);
      setSelectedStatus(res.data.status_name);
    } catch (err) {
      console.error(err);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
    getStatuses().then(res => setStatuses(res.data));
  }, [id]);

  const handleUpdate = async () => {
    if (!selectedStatus && !note) return;
    setUpdating(true);
    try {
      await updateTicket(id, { status: selectedStatus, notes: note });
      fetchTicket();
      setNote('');
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (!ticket) return <div className="text-center py-8">Ticket not found</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-xl font-bold text-[rgb(0,94,106)]">{ticket.subject}</h1>
            <p className="text-sm text-gray-500">Ticket #{ticket.ticket_id}</p>
          </div>
          <button onClick={() => navigate('/')} className="text-gray-500 hover:text-gray-700">Back</button>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div><span className="font-medium">Customer:</span> {ticket.customer_name}</div>
          <div><span className="font-medium">Email:</span> {ticket.customer_email}</div>
          <div><span className="font-medium">Status:</span> 
            <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
              ticket.status_name === 'Open' ? 'bg-red-100 text-red-800' :
              ticket.status_name === 'In Progress' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
            }`}>{ticket.status_name}</span>
          </div>
          <div><span className="font-medium">Created:</span> {new Date(ticket.created_at).toLocaleString()}</div>
        </div>
        <div className="border-t pt-4">
          <h3 className="font-medium mb-2">Description</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
        </div>
      </div>

      {/* Notes section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-medium mb-3">Conversation History</h3>
        {ticket.notes?.length === 0 ? (
          <p className="text-gray-500 text-sm">No notes yet</p>
        ) : (
          <div className="space-y-3">
            {ticket.notes.map(note => (
              <div key={note.id} className="border-l-2 border-[rgb(0,94,106)] pl-3 py-1">
                <div className="text-xs text-gray-500">{note.user_name} - {new Date(note.created_at).toLocaleString()}</div>
                <div className="text-sm mt-1">{note.note_text}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Update status & add note */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-medium mb-3">Update Ticket</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Change Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border rounded-lg px-3 py-2 w-full md:w-64"
            >
              {statuses.map(s => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Add Note / Reply</label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Type your message here..."
            />
          </div>
          <button
            onClick={handleUpdate}
            disabled={updating || (!selectedStatus && !note.trim())}
            className="bg-[rgb(0,94,106)] text-white px-4 py-2 rounded-lg disabled:opacity-50"
          >
            {updating ? 'Updating...' : 'Update Ticket'}
          </button>
        </div>
      </div>
    </div>
  );
}