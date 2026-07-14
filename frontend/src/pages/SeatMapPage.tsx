import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { api } from '../services/api';
import { socket } from '../services/socket';
import clsx from 'clsx';

interface Seat {
  _id: string;
  row: string;
  number: number;
  category: string;
  status: 'available' | 'held' | 'booked';
}

export default function SeatMapPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch seats
  useEffect(() => {
    const fetchSeats = async () => {
      try {
        const res = await api.get(`/seats/event/${eventId}`);
        setSeats(res.data);
      } catch (err) {
        console.error('Failed to fetch seats:', err);
        setError('Failed to load seat map.');
      } finally {
        setLoading(false);
      }
    };
    fetchSeats();
  }, [eventId]);

  // Socket.io for real-time seat updates
  useEffect(() => {
    if (!eventId) return;
    
    socket.emit('joinEvent', eventId);
    
    socket.on('seatUpdate', ({ seatId, status }) => {
      setSeats(prev => prev.map(s => 
        s._id === seatId ? { ...s, status } : s
      ));
      
      // If the selected seat was booked/held by someone else, deselect it
      setSelectedSeat(prev => {
        if (prev?._id === seatId && status !== 'held') return null;
        return prev;
      });
    });

    return () => {
      socket.emit('leaveEvent', eventId);
      socket.off('seatUpdate');
    };
  }, [eventId]);

  // Group seats by row
  const seatsByRow = seats.reduce((acc, seat) => {
    if (!acc[seat.row]) acc[seat.row] = [];
    acc[seat.row].push(seat);
    return acc;
  }, {} as Record<string, Seat[]>);
  
  // Sort rows alphabetically, then sort seats within rows numerically
  const rows = Object.keys(seatsByRow).sort();
  rows.forEach(row => {
    seatsByRow[row].sort((a, b) => a.number - b.number);
  });

  const handleSeatClick = (seat: Seat) => {
    if (seat.status !== 'available' && seat.status !== 'held') return;
    setError('');
    setSelectedSeat(seat);
  };

  const handleHoldSeat = async () => {
    if (!selectedSeat) return;
    setActionLoading(true);
    setError('');
    try {
      await api.post(`/seats/${selectedSeat._id}/hold`);
      // Update local state preemptively (socket will also fire)
      setSeats(prev => prev.map(s => s._id === selectedSeat._id ? { ...s, status: 'held' } : s));
      setSelectedSeat({ ...selectedSeat, status: 'held' });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to hold seat. It might have been taken.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmBooking = async () => {
    if (!selectedSeat) return;
    setActionLoading(true);
    setError('');
    try {
      await api.post(`/bookings/confirm`, { seatIds: [selectedSeat._id] });
      navigate('/my-bookings');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to confirm booking.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleJoinWaitlist = async (category: string) => {
    setActionLoading(true);
    setError('');
    try {
      await api.post(`/waitlist/join`, { eventId, category });
      alert(`Successfully joined waitlist for ${category}! We will email you if a seat opens up.`);
      setSelectedSeat(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to join waitlist.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Seat Map */}
      <div className="flex-1 glass-card p-8 flex flex-col items-center overflow-x-auto">
        <div className="w-full max-w-3xl mb-12">
          {/* Stage */}
          <div className="w-full h-16 bg-gradient-to-b from-brand-600/40 to-transparent rounded-t-full border-t border-brand-500/50 flex items-center justify-center mb-16 shadow-[0_0_50px_rgba(161,128,114,0.15)]">
            <span className="text-brand-300 font-semibold tracking-[0.2em] text-sm uppercase">Stage</span>
          </div>

          {/* Seats */}
          <div className="flex flex-col gap-4">
            {rows.map(row => (
              <div key={row} className="flex items-center justify-center gap-4">
                <div className="w-8 text-center text-slate-500 font-bold">{row}</div>
                <div className="flex gap-2">
                  {seatsByRow[row].map(seat => (
                    <button
                      key={seat._id}
                      disabled={seat.status === 'booked'}
                      onClick={() => handleSeatClick(seat)}
                      className={clsx(
                        "w-10 h-10 rounded-t-lg rounded-b-sm border-b-4 transition-all duration-200 flex items-center justify-center text-xs font-medium",
                        seat.status === 'available' && "bg-slate-700/50 border-slate-600 hover:bg-emerald-500/20 hover:border-emerald-500 text-slate-300",
                        seat.status === 'held' && "bg-amber-500/20 border-amber-500 text-amber-200",
                        seat.status === 'booked' && "bg-dark-900 border-dark-950 text-dark-700 cursor-not-allowed opacity-50",
                        selectedSeat?._id === seat._id && "ring-2 ring-white ring-offset-2 ring-offset-dark-900 scale-110 z-10"
                      )}
                    >
                      {seat.number}
                    </button>
                  ))}
                </div>
                <div className="w-8 text-center text-slate-500 font-bold">{row}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex gap-6 text-sm text-slate-400 border-t border-white/5 pt-6 mt-auto">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-sm bg-slate-700/50 border-b-2 border-slate-600"></div>
            Available
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-sm bg-amber-500/20 border-b-2 border-amber-500"></div>
            Held (In Cart)
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-sm bg-dark-900 border-b-2 border-dark-950 opacity-50"></div>
            Booked
          </div>
        </div>
      </div>

      {/* Sidebar / Checkout */}
      <div className="w-full lg:w-96 shrink-0">
        <AnimatePresence mode="wait">
          {selectedSeat ? (
            <motion.div
              key="selected"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="glass-card p-6 sticky top-24"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white">Seat {selectedSeat.row}{selectedSeat.number}</h3>
                  <p className="text-brand-400 font-medium capitalize">{selectedSeat.category} Class</p>
                </div>
                <button 
                  onClick={() => setSelectedSeat(null)}
                  className="text-slate-500 hover:text-white"
                >
                  &times;
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg flex items-start gap-2 text-red-200 text-sm">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <div className="space-y-4">
                {selectedSeat.status === 'available' && (
                  <>
                    <div className="p-4 bg-dark-900/50 rounded-lg flex items-start gap-3 text-sm text-slate-300">
                      <Info className="w-5 h-5 text-brand-400 shrink-0" />
                      <p>Holding this seat will reserve it for you for 30 seconds to complete your booking.</p>
                    </div>
                    <button
                      onClick={handleHoldSeat}
                      disabled={actionLoading}
                      className="w-full py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
                    >
                      {actionLoading ? 'Holding...' : 'Hold Seat'}
                    </button>
                  </>
                )}

                {selectedSeat.status === 'held' && (
                  <>
                    <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-start gap-3 text-sm text-amber-200">
                      <Clock className="w-5 h-5 text-amber-400 shrink-0 animate-pulse" />
                      <p>Seat is held! Complete your booking before the timer expires.</p>
                    </div>
                    <button
                      onClick={handleConfirmBooking}
                      disabled={actionLoading}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      {actionLoading ? 'Confirming...' : 'Confirm Booking'}
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card p-8 text-center sticky top-24"
            >
              <div className="w-16 h-16 rounded-full bg-dark-700/50 flex items-center justify-center mx-auto mb-4 border border-white/5">
                <Info className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No Seat Selected</h3>
              <p className="text-slate-400 text-sm mb-6">Select an available seat from the map to begin your booking.</p>
              
              <div className="pt-6 border-t border-white/5">
                <h4 className="text-sm font-semibold text-slate-300 mb-3 text-left">Event Sold Out?</h4>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleJoinWaitlist('VIP')}
                    disabled={actionLoading}
                    className="flex-1 py-2 bg-dark-700 hover:bg-dark-600 border border-white/5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    Waitlist VIP
                  </button>
                  <button 
                    onClick={() => handleJoinWaitlist('General')}
                    disabled={actionLoading}
                    className="flex-1 py-2 bg-dark-700 hover:bg-dark-600 border border-white/5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    Waitlist Gen
                  </button>
                </div>
                {error && <p className="text-red-400 text-xs mt-3 text-left">{error}</p>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
