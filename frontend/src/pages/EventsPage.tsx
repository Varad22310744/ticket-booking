import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { api } from '../services/api';
import { motion } from 'framer-motion';

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  venue: {
    name: string;
    location: string;
  };
  status: string;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get('/events');
        setEvents(res.data);
      } catch (err) {
        console.error('Failed to fetch events:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
          Upcoming Events
        </h1>
        <p className="mt-2 text-slate-400 text-lg">Book your premium seats before they sell out.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event, i) => (
          <motion.div
            key={event._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card overflow-hidden group hover:border-brand-500/50 transition-all duration-300"
          >
            <div className="h-48 bg-dark-700 relative overflow-hidden">
              {/* Placeholder image, in a real app this would be event.imageUrl */}
              <img 
                src={`https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop&sig=${event._id}`} 
                alt={event.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-900 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4">
                <h2 className="text-2xl font-bold text-white truncate">{event.title}</h2>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-slate-300 line-clamp-2 text-sm">{event.description}</p>
              
              <div className="space-y-2 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-brand-400" />
                  <span>{new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-brand-400" />
                  <span>{new Date(event.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-brand-400" />
                  <span className="truncate">{event.venue?.name || 'TBA'} - {event.venue?.location || 'TBA'}</span>
                </div>
              </div>

              <Link 
                to={`/events/${event._id}`}
                className="block w-full py-3 px-4 bg-brand-600 hover:bg-brand-500 text-white text-center rounded-xl font-medium transition-colors mt-4"
              >
                Find Seats
              </Link>
            </div>
          </motion.div>
        ))}
        {events.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-400">
            No events available at the moment.
          </div>
        )}
      </div>
    </div>
  );
}
