import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Building, Calendar, DollarSign, Users } from 'lucide-react';

interface Event {
  _id: string;
  title: string;
  date: string;
  organiser: string;
}

interface Venue {
  _id: string;
  name: string;
  location: string;
}

interface RevenueStats {
  event: string;
  totalBookings: number;
  totalSeatsBooked: number;
  totalRevenue: number;
}

export default function OrganiserDashboard() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Forms state
  const [venueName, setVenueName] = useState('');
  const [venueLocation, setVenueLocation] = useState('');
  const [eventTitle, setEventTitle] = useState('');
  const [eventType, setEventType] = useState<'movie' | 'concert'>('movie');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [selectedVenue, setSelectedVenue] = useState('');
  
  const [stats, setStats] = useState<Record<string, RevenueStats>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsRes, venuesRes] = await Promise.all([
          api.get('/events'),
          api.get('/venues')
        ]);
        
        // Filter events for this organiser
        const myEvents = eventsRes.data.filter((e: Event) => e.organiser === user?.id);
        setEvents(myEvents);
        setVenues(venuesRes.data);

        // Fetch revenue for each event
        myEvents.forEach(async (ev: Event) => {
          try {
            const revRes = await api.get(`/organiser/events/${ev._id}/revenue`);
            setStats(prev => ({ ...prev, [ev._id]: revRes.data }));
          } catch (e) {
            console.error('Failed to fetch revenue for', ev._id);
          }
        });

      } catch (err) {
        console.error('Dashboard fetch failed', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (user) fetchData();
  }, [user]);

  const handleCreateVenue = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { 
        name: venueName, 
        address: venueLocation,
        categories: [{ name: "VIP" }, { name: "General" }],
        seatLayout: [
          { row: "A", number: 1, category: "VIP" },
          { row: "A", number: 2, category: "VIP" },
          { row: "B", number: 1, category: "General" },
          { row: "B", number: 2, category: "General" },
          { row: "B", number: 3, category: "General" }
        ]
      };
      const res = await api.post('/venues', payload);
      setVenues([...venues, res.data]);
      setVenueName('');
      setVenueLocation('');
      alert('Venue created successfully with a default 5-seat layout!');
    } catch (err: any) {
      console.error(err.response || err);
      alert(err.response?.data?.message || 'Failed to create venue');
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title: eventTitle,
        type: eventType,
        date: new Date(eventDate).toISOString(),
        time: eventTime,
        venue: selectedVenue,
        pricing: [
          { category: 'VIP', price: 100 },
          { category: 'General', price: 50 }
        ]
      };
      const res = await api.post('/events', payload);
      setEvents([...events, res.data]);
      alert('Event created successfully! Seats were generated automatically.');
    } catch (err: any) {
      console.error(err.response || err);
      alert(err.response?.data?.message || err.response?.data?.error || 'Failed to create event');
    }
  };

  if (loading) return <div className="p-8 text-white">Loading dashboard...</div>;

  return (
    <div className="space-y-8 max-w-6xl mx-auto text-white">
      <div>
        <h1 className="text-3xl font-bold">Organiser Dashboard</h1>
        <p className="text-slate-400">Manage your venues, events, and track revenue.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Creation Forms */}
        <div className="space-y-6">
          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Building className="w-5 h-5 text-brand-400" />
              Create Venue
            </h2>
            <form onSubmit={handleCreateVenue} className="space-y-4">
              <input
                type="text"
                placeholder="Venue Name"
                required
                value={venueName}
                onChange={e => setVenueName(e.target.value)}
                className="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg focus:outline-none focus:border-brand-500"
              />
              <input
                type="text"
                placeholder="Location / Address"
                required
                value={venueLocation}
                onChange={e => setVenueLocation(e.target.value)}
                className="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg focus:outline-none focus:border-brand-500"
              />
              <button type="submit" className="px-4 py-2 bg-brand-600 hover:bg-brand-500 rounded-lg font-medium transition-colors">
                Save Venue
              </button>
            </form>
          </div>

          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-brand-400" />
              Create Event
            </h2>
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <input
                type="text"
                placeholder="Event Title"
                required
                value={eventTitle}
                onChange={e => setEventTitle(e.target.value)}
                className="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg focus:outline-none focus:border-brand-500"
              />
              <select
                required
                value={eventType}
                onChange={e => setEventType(e.target.value as 'movie' | 'concert')}
                className="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg focus:outline-none focus:border-brand-500"
              >
                <option value="movie">Movie</option>
                <option value="concert">Concert</option>
              </select>
              <input
                type="date"
                required
                value={eventDate}
                onChange={e => setEventDate(e.target.value)}
                className="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg focus:outline-none focus:border-brand-500"
              />
              <input
                type="time"
                required
                value={eventTime}
                onChange={e => setEventTime(e.target.value)}
                className="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg focus:outline-none focus:border-brand-500"
              />
              <select
                required
                value={selectedVenue}
                onChange={e => setSelectedVenue(e.target.value)}
                className="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg focus:outline-none focus:border-brand-500"
              >
                <option value="">Select a Venue</option>
                {venues.map(v => (
                  <option key={v._id} value={v._id}>{v.name} ({v.location || (v as any).address})</option>
                ))}
              </select>
              <button type="submit" className="px-4 py-2 bg-brand-600 hover:bg-brand-500 rounded-lg font-medium transition-colors">
                Publish Event
              </button>
            </form>
          </div>
        </div>

        {/* Revenue & Stats */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold mb-4 border-b border-white/10 pb-2">Your Events & Revenue</h2>
          
          {events.length === 0 ? (
            <p className="text-slate-400">You haven't created any events yet.</p>
          ) : (
            events.map(event => (
              <div key={event._id} className="glass-card p-5 border-l-4 border-l-brand-500">
                <h3 className="text-lg font-bold mb-3">{event.title}</h3>
                
                {stats[event._id] ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-dark-900/50 p-3 rounded-lg border border-white/5">
                      <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                        <DollarSign className="w-4 h-4 text-emerald-400" /> Total Revenue
                      </div>
                      <p className="text-2xl font-bold text-emerald-400">${stats[event._id].totalRevenue}</p>
                    </div>
                    
                    <div className="bg-dark-900/50 p-3 rounded-lg border border-white/5">
                      <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                        <Users className="w-4 h-4 text-blue-400" /> Seats Booked
                      </div>
                      <p className="text-2xl font-bold text-blue-400">{stats[event._id].totalSeatsBooked}</p>
                    </div>
                    
                    <div className="col-span-2 bg-dark-900/50 p-3 rounded-lg border border-white/5 flex items-center justify-between">
                      <span className="text-slate-400 text-sm">Total Individual Bookings</span>
                      <span className="font-bold">{stats[event._id].totalBookings}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm animate-pulse">Loading stats...</p>
                )}
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
