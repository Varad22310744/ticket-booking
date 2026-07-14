import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Ticket, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function WaitlistOfferPage() {
  const { waitlistId } = useParams<{ waitlistId: string }>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleAccept = async () => {
    setLoading(true);
    setError('');
    try {
      await api.post(`/waitlist/${waitlistId}/accept`);
      setSuccess(true);
      setTimeout(() => navigate('/my-bookings'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to accept offer. It may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-8 max-w-md w-full text-center"
      >
        {!success ? (
          <>
            <div className="w-16 h-16 bg-brand-500/20 border border-brand-500/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Ticket className="w-8 h-8 text-brand-500" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Waitlist Offer Available!</h1>
            <p className="text-slate-400 mb-8">
              A seat has opened up for your waitlisted event. Accept it now to confirm your booking.
            </p>

            {error && (
              <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-200 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleAccept}
              disabled={loading}
              className="w-full py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              {loading ? 'Confirming...' : 'Accept & Book Seat'}
            </button>
          </>
        ) : (
          <div className="py-8">
            <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Booking Confirmed!</h2>
            <p className="text-slate-400">Redirecting to your tickets...</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
