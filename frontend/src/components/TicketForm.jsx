import { useState } from 'react';

export default function TicketForm({ onSuccess, onCancel }) {
  const [form, setForm] = useState({
    customer_name: '',
    customer_email: '',
    subject: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { createTicket } = await import('../api');
      await createTicket(form);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-[rgb(0,94,106)] mb-2">Raise a Ticket</h2>
      {error && <div className="bg-red-50 text-red-800 p-3 rounded mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name *</label>
          <input
            type="text"
            name="customer_name"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[rgb(0,94,106)] focus:ring-1 focus:ring-[rgb(0,94,106)]"
            value={form.customer_name}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email *</label>
          <input
            type="email"
            name="customer_email"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            value={form.customer_email}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Subject *</label>
          <input
            type="text"
            name="subject"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            value={form.subject}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description *</label>
          <textarea
            name="description"
            rows={4}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            value={form.description}
            onChange={handleChange}
          />
        </div>
        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="bg-[rgb(0,94,106)] text-white px-4 py-2 rounded-lg hover:bg-[rgb(0,120,136)] disabled:opacity-50">
            {loading ? 'Submitting...' : 'Submit Ticket'}
          </button>
          {onCancel && (
            <button type="button" onClick={onCancel} className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50">
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}