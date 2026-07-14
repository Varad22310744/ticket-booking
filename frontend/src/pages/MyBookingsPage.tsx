import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { motion } from 'framer-motion';
import { Ticket, Calendar, MapPin, QrCode } from 'lucide-react';

interface Booking {
  _id: string;
  bookingRef: string;
  totalAmount: number;
  status: string;
  event: {
    title: string;
    date: string;
    venue: {
      name: string;
      location: string;
    };
  };
  seats: Array<{ row: string; number: number; category: string }>;
}

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await api.get('/bookings/my');
        setBookings(res.data);
      } catch (err) {
        console.error('Failed to fetch bookings', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-extrabold text-white">My Tickets</h1>
        <p className="mt-2 text-slate-400">View and manage your upcoming events.</p>
      </div>

      <div className="space-y-6">
        {bookings.map((booking, i) => (
          <motion.div
            key={booking._id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card overflow-hidden flex flex-col md:flex-row"
          >
            {/* Left side - Event Info */}
            <div className="flex-1 p-6 md:p-8 border-b md:border-b-0 md:border-r border-white/10 relative">
              <div className="absolute top-0 right-0 p-4">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {booking.status.toUpperCase()}
                </span>
              </div>
              
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-brand-400 font-semibold uppercase tracking-wider mb-1">Booking Ref: {booking.bookingRef}</p>
                  <h2 className="text-2xl font-bold text-white">{booking.event?.title || 'Unknown Event'}</h2>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-slate-200">
                        {booking.event?.date ? new Date(booking.event.date).toLocaleDateString() : 'TBA'}
                      </p>
                      <p className="text-xs text-slate-400">
                        {booking.event?.date ? new Date(booking.event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBA'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-slate-200">{booking.event?.venue?.name || 'TBA'}</p>
                      <p className="text-xs text-slate-400">{booking.event?.venue?.location || 'TBA'}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <p className="text-sm text-slate-400 mb-2">Seats</p>
                  <div className="flex flex-wrap gap-2">
                    {booking.seats.map((seat, j) => (
                      <div key={j} className="px-3 py-1.5 bg-dark-700/50 rounded-lg border border-white/5 flex items-center gap-2">
                        <Ticket className="w-4 h-4 text-brand-400" />
                        <span className="text-sm font-medium text-slate-200">{seat.row}{seat.number}</span>
                        <span className="text-xs text-slate-500 hidden sm:inline">({seat.category})</span>
                      </div>
                    ))}
                  </div>
                </div>

                {booking.status === 'confirmed' && (
                  <div className="pt-4 mt-2 border-t border-white/5">
                    <button 
                      onClick={async () => {
                        if (!confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) return;
                        try {
                          await api.post(`/bookings/${booking._id}/cancel`);
                          // Refresh bookings
                          const res = await api.get('/bookings/my');
                          setBookings(res.data);
                        } catch (err) {
                          alert('Failed to cancel booking.');
                        }
                      }}
                      className="text-sm text-red-400 hover:text-red-300 font-medium transition-colors"
                    >
                      Cancel Booking
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right side - QR / Scan */}
            <div className="w-full md:w-64 bg-dark-900/50 p-6 flex flex-col items-center justify-center shrink-0">
              <div className="w-32 h-32 bg-white p-2 rounded-xl mb-4 relative group cursor-pointer">
                <QrCode className="w-full h-full text-slate-800" />
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl backdrop-blur-sm">
                  <span className="text-white text-sm font-medium">Scan Ticket</span>
                </div>
              </div>
              <p className="text-center text-sm text-slate-400">
                Show this code at the venue entrance
              </p>
            </div>
          </motion.div>
        ))}

        {bookings.length === 0 && !loading && (
          <div className="text-center py-16 glass-card">
            <Ticket className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-300">No bookings yet</h3>
            <p className="text-slate-500 mt-1 mb-6">You haven't bought any tickets.</p>
            <a href="/" className="inline-flex py-2 px-6 bg-brand-600 hover:bg-brand-500 text-white rounded-lg font-medium transition-colors">
              Browse Events
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
