import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../context/AuthContext';
import { PlaneTakeoff, Plus, Users, PlusCircle, ArrowRight, Clipboard, Check } from 'lucide-react';

const Trips = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  // Forms
  const [tripName, setTripName] = useState('');
  const [tripDesc, setTripDesc] = useState('');
  
  const [joinTripId, setJoinTripId] = useState('');

  const [copiedId, setCopiedId] = useState('');

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/trips');
      setTrips(res.data);
    } catch (err) {
      console.error('Failed to fetch trips', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleCreateTrip = async (e) => {
    e.preventDefault();
    if (!tripName) {
      alert('Trip name is required.');
      return;
    }

    try {
      await api.post('/api/trips', { name: tripName, description: tripDesc });
      setTripName('');
      setTripDesc('');
      fetchTrips();
      alert('Trip created successfully!');
    } catch (err) {
      alert('Failed to create trip.');
    }
  };

  const handleJoinTrip = async (e) => {
    e.preventDefault();
    if (!joinTripId) {
      alert('Trip ID code is required.');
      return;
    }

    try {
      await api.post('/api/trips/join', { tripId: joinTripId });
      setJoinTripId('');
      fetchTrips();
      alert('Joined trip successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to join trip. Please verify the code.');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(''), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Group Trips & Splitter</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Create or join trip groups, log shared expenses, and resolve debts instantly.
        </p>
      </div>

      {/* Grid: Create Trip & Join Trip Widget */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Create Trip Form */}
        <div className="p-6 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-blue-500" />
            <span>Create New Trip Group</span>
          </h3>
          <form onSubmit={handleCreateTrip} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Trip Name *
              </label>
              <input
                type="text"
                value={tripName}
                onChange={(e) => setTripName(e.target.value)}
                placeholder="e.g. Summer Goa Trip"
                className="w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Description (Optional)
              </label>
              <input
                type="text"
                value={tripDesc}
                onChange={(e) => setTripDesc(e.target.value)}
                placeholder="e.g. Shared expenses with college mates"
                className="w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 text-sm font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md transition"
            >
              Generate Trip
            </button>
          </form>
        </div>

        {/* Join Trip Form */}
        <div className="p-6 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm space-y-4 h-fit">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-500" />
            <span>Join Existing Trip Group</span>
          </h3>
          <form onSubmit={handleJoinTrip} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Trip ID Code
              </label>
              <input
                type="text"
                value={joinTripId}
                onChange={(e) => setJoinTripId(e.target.value)}
                placeholder="e.g. MM87G2A1"
                className="w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition font-mono uppercase"
                required
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 text-sm font-semibold rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-md transition"
            >
              Join Group
            </button>
          </form>
        </div>
      </div>

      {/* Trips List Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold">Your Active Trips</h3>

        {trips.length === 0 ? (
          <div className="py-12 border border-dashed rounded-2xl text-center space-y-3">
            <PlaneTakeoff className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600" />
            <h4 className="font-semibold text-slate-400">No active trips found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Create a new trip or ask your friends for their unique Trip ID to join an existing group.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip) => (
              <div
                key={trip._id}
                className="p-5 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-500">
                      Code: {trip.tripId}
                    </span>
                    <button
                      onClick={() => copyToClipboard(trip.tripId)}
                      className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      title="Copy Trip ID"
                    >
                      {copiedId === trip.tripId ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Clipboard className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <h4 className="font-bold text-slate-800 dark:text-white truncate">{trip.name}</h4>
                  {trip.description && (
                    <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-2">
                      {trip.description}
                    </p>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span>{trip.members.length} members</span>
                  </div>
                  <Link
                    to={`/trips/${trip._id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-500 hover:text-blue-600 transition"
                  >
                    <span>View Group</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Trips;
