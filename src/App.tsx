import React, { useState } from 'react';
import { Calendar, Users, Settings, Clock,  Shield, Menu, X, LogOut, User, MapPin, Mail, Phone, Edit3, Save, Plus, Trash2, UsersRound } from 'lucide-react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { mockTours, mockBesas, mockBookings } from '../data/mockData.ts';

type UserRole = 'public' | 'admin';
type Page = 'booking' | 'dashboard' | 'tours' | 'besas' | 'schedule' | 'settings' | 'office-hours' | 'admin';

function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('public');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedTour, setSelectedTour] = useState<number | null>(null);
  const [selectedBesa, setSelectedBesa] = useState<number | null>(null);
  const [editingOfficeHours, setEditingOfficeHours] = useState<number | null>(null);
  const [besas, setBesas] = useState(mockBesas);

  const navigate = useNavigate();

  const handleLogin = (role: UserRole) => {
    setCurrentRole(role);
    setIsMobileMenuOpen(false);
    if (role === 'admin') navigate('/admin/dashboard');
    else navigate('/');
  };

  const handleLogout = () => {
    setCurrentRole('public');
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  const updateBesaOfficeHours = (besaId: number, day: string, field: string, value: string | boolean) => {
    setBesas(prev => prev.map(besa => 
      besa.id === besaId 
        ? {
            ...besa,
            officeHours: {
              ...besa.officeHours,
              [day]: {
                ...besa.officeHours[day as keyof typeof besa.officeHours],
                [field]: value
              }
            }
          }
        : besa
    ));
  };

  const getCompiledSchedule = () => {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const schedule: { [key: string]: { start: string; end: string; besas: string[] } } = {};

    days.forEach(day => {
      const availableBesas = besas.filter(besa => 
        besa.officeHours[day as keyof typeof besa.officeHours].available
      );

      if (availableBesas.length > 0) {
        const times = availableBesas.map(besa => ({
          start: besa.officeHours[day as keyof typeof besa.officeHours].start,
          end: besa.officeHours[day as keyof typeof besa.officeHours].end,
          name: besa.name
        }));

        const earliestStart = times.reduce((earliest, current) => 
          current.start < earliest ? current.start : earliest, times[0].start
        );
        
        const latestEnd = times.reduce((latest, current) => 
          current.end > latest ? current.end : latest, times[0].end
        );

        schedule[day] = {
          start: earliestStart,
          end: latestEnd,
          besas: availableBesas.map(besa => besa.name)
        };
      }
    });

    return schedule;
  };

  const PublicBookingView = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    {/* Header */}
    <header className="bg-white shadow-sm border-b-4 border-orange-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            {/*When logo clicked, redriect to homepage*/}
            <a href="/">
              <img src="/BE_logo.png" alt="BESA logo" className="h-12 w-12 object-contain" />
            </a>
            <span className="text-2xl font-medium text-blue-900">BESA Tours</span>
          </div>
          <div className="flex items-center space-x-4">
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      {/* <div className="bg-gradient-to-b from-blue-900 via-blue-900 to-blue-700 text-white py-16 border-b-4 border-orange-300"> */}
      <div className="bg-blue-900 text-white py-16 border-b-4 border-orange-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Baskin Engineering Tours
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Book a personalized tour of the Baskin Engineering Building led by our BESA guides
          </p>
          <a href="#tour-options">
            <button className="bg-orange-400 text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-orange-500 transition-colors transform hover:scale-105">
              Book Your Tour Now
            </button>
          </a>
        </div>
      </div>

      {/* Tour Options */}
      <div id="tour-options" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose The Tour That Best Suits You!</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Select from our variety of tour options designed to accomdate tour sizes and interests.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {mockTours.map((tour) => (
            <div
              key={tour.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-b-4 border-orange-300"
            >
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">{tour.title}</h3>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                    Available
                  </span>
                </div>
                
                <div className="flex items-center space-x-4 mb-4 text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">{tour.duration}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span className="text-sm">Max {tour.maxAttendees}</span>
                  </div>
                </div>
                <div className="flex-grow flex flex-col justify-between">
                <p className="text-gray-600 mb-6 max-h-32 overflow-y-auto">{tour.description}</p>
                
                <button
                  onClick={() => setSelectedTour(tour.id)}
                  className="w-full bg-blue-700 text-white py-2 px-4 rounded-lg hover:bg-blue-900 transition-colors font-medium"
                >
                  Select This Tour
                </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tour Selection Modal */}
      {selectedTour && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Book Your Tour</h3>
                <button
                  onClick={() => setSelectedTour(null)}
                  className="text-gray-400 hover:text-gray-600">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Name *
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Attendees *
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      {Array.from({ length: mockTours.find(t => t.id === selectedTour)?.maxAttendees || 15 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>{i + 1} attendee{i > 0 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Date *
                    </label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Time *
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option>9:00 AM</option>
                      <option>10:00 AM</option>
                      <option>11:00 AM</option>
                      <option>1:00 PM</option>
                      <option>2:00 PM</option>
                      <option>3:00 PM</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Requests or Notes
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Any specific areas of interest or accessibility needs..."
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setSelectedTour(null)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Submit Booking Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );

 {/* ADMIN PAGE START*/}

  const DashboardLayout = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <nav className="bg-white shadow-sm border-b-4 border-orange-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <img src="/BE_logo.png" className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">BESA Tours</span>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium ml-2">
                {currentRole === 'admin' ? 'Admin' : 'BESA'}
              </span>
            </div>

            {/* DASHBOARD HEADER BUTTON */}
            <div className="hidden md:flex items-center space-x-6">
              <button onClick={() => navigate('/admin/dashboard')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  window.location.pathname === '/admin/dashboard' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'
                }`}>
                <Calendar className="h-4 w-4" />
                <span>Dashboard</span>
              </button>

              {/* SCHEDULE HEADER BUTTON */}
              <button onClick={() => navigate('/admin/schedule')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  window.location.pathname === '/admin/schedule' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'
                }`}>
                <Clock className="h-4 w-4" />
                <span>Schedule</span>
              </button>

              {/* TOURS HEADER BUTTON */}
              <button onClick={() => navigate('/admin/tours')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  window.location.pathname === '/admin/tours' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'
                }`}>
                <MapPin className="h-4 w-4" />
                <span>Tours</span>
              </button>

              {/* BESAs HEADER BUTTON */}
              <button onClick={() => navigate('/admin/besas')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  window.location.pathname === '/admin/besas' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'
                }`}>
                <Users className="h-4 w-4" />
                <span>BESAs</span>
              </button>

            {/* OFFICE HOURS HEADER BUTTON */}
              <button onClick={() => navigate('/admin/office-hours')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  window.location.pathname === '/admin/office-hours' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'
                }`}>
                <Clock className="h-4 w-4" />
                <span>Office Hours</span>
              </button>

              {/* SETTINGS HEADER BUTTON */}
              <button onClick={() => navigate('/admin/settings')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  window.location.pathname === '/admin/settings' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'
                }`}>
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </button>

              <button onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 text-red-600 hover:text-red-800 transition-colors">
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900">
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-4 py-2 space-y-1">
              <button
                onClick={() => { navigate('/admin/dashboard'); setIsMobileMenuOpen(false); }}
                className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-left text-gray-600 hover:text-gray-900"
              >
                <Calendar className="h-4 w-4" />
                <span>Dashboard</span>
              </button>
              <button
                onClick={() => { navigate('/admin/schedule'); setIsMobileMenuOpen(false); }}
                className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-left text-gray-600 hover:text-gray-900"
              >
                <Clock className="h-4 w-4" />
                <span>Schedule</span>
              </button>
              {currentRole === 'admin' && (
                <>
                  <button
                    onClick={() => { navigate('/admin/tours'); setIsMobileMenuOpen(false); }}
                    className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-left text-gray-600 hover:text-gray-900"
                  >
                    <MapPin className="h-4 w-4" />
                    <span>Tours</span>
                  </button>
                  <button
                    onClick={() => { navigate('/admin/besas'); setIsMobileMenuOpen(false); }}
                    className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-left text-gray-600 hover:text-gray-900"
                  >
                    <Users className="h-4 w-4" />
                    <span>BESAs</span>
                  </button>
                  <button
                    onClick={() => { navigate('/admin/office-hours'); setIsMobileMenuOpen(false); }}
                    className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-left text-gray-600 hover:text-gray-900"
                  >
                    <Clock className="h-4 w-4" />
                    <span>Office Hours</span>
                  </button>
                </>
              )}
              <button
                onClick={() => { navigate('/admin/settings'); setIsMobileMenuOpen(false); }}
                className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-left text-gray-600 hover:text-gray-900"
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-left text-red-600 hover:text-red-800"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </nav>

      {children}
    </div>
  );

  {/* DASHBOARD VIEW */}
  const DashboardView = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {currentRole === 'admin' ? 'Admin Dashboard' : 'BESA Dashboard'}
        </h1>
        <p className="text-gray-600">
          {currentRole === 'admin' 
            ? 'Manage tours, BESAs, and system settings' 
            : 'Track your assigned tours and manage your schedule'
          }
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border-b-4 border-orange-400">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Tours</p>
              <p className="text-3xl font-bold text-gray-900">4</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-b-4 border-orange-400">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Week</p>
              <p className="text-3xl font-bold text-gray-900">23</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Recent Bookings</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tour</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendees</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">BESA</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mockBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{booking.tourType}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{booking.date}</div>
                    <div className="text-sm text-gray-500">{booking.time}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{booking.attendees}/{booking.maxAttendees}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{booking.besa}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{booking.contactName}</div>
                    <div className="text-sm text-gray-500">{booking.contactEmail}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const ToursManagementView = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tour Management</h1>
          <p className="text-gray-600">Create and manage different types of tours</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add New Tour</span>
        </button>
      </div>

      <div className="grid gap-6">
        {mockTours.map((tour) => (
          <div key={tour.id} className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{tour.title}</h3>
                <p className="text-gray-600 mb-4">{tour.description}</p>
                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{tour.duration}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>Max {tour.maxAttendees} attendees</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    tour.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {tour.available ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium flex items-center space-x-1">
                  <Edit3 className="h-3 w-3" />
                  <span>Edit</span>
                </button>
                <button className="px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium flex items-center space-x-1">
                  <Trash2 className="h-3 w-3" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const [showNewBesaModal, setShowNewBesaModal] = useState(false);
  const [newBesa, setNewBesa] = useState({
    name: '',
    email: '',
    role: 'BESA',
    status: 'active',
    toursThisWeek: 0,
    totalTours: 0,
    officeHours: {
      monday: { start: '', end: '', available: false },
      tuesday: { start: '', end: '', available: false },
      wednesday: { start: '', end: '', available: false },
      thursday: { start: '', end: '', available: false },
      friday: { start: '', end: '', available: false },
      saturday: { start: '', end: '', available: false },
      sunday: { start: '', end: '', available: false }
    }
  });

  const BESAManagementView = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">BESA Management</h1>
        <p className="text-gray-600">Manage BESA accounts and permissions</p>
      </div>
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        onClick={() => setShowNewBesaModal(true)}
      >
        <User className="h-4 w-4" />
        <span>Add New BESA</span>
      </button>
    </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">BESA</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">This Week</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Tours</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {besas.map((besa) => (
                <tr key={besa.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{besa.name}</div>
                        <div className="text-sm text-gray-500">{besa.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      besa.role === 'BESA Lead' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {besa.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {besa.toursThisWeek}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {besa.totalTours}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      besa.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {besa.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button 
                      onClick={() => setSelectedBesa(besa.id)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-600 hover:text-red-900"
                      onClick={() => {
                      if (window.confirm(`Are you sure you want to deactivate and delete ${besa.name}? This action cannot be undone.`)) {
                      setBesas(prev => prev.filter(b => b.id !== besa.id));
                      }
                      }}
                    >
                    Deactivate
                  </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* BESA Detail Modal */}
      {selectedBesa && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  Edit BESA: {besas.find(b => b.id === selectedBesa)?.name}
                </h3>
                <button
                  onClick={() => setSelectedBesa(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Office Hours Section */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Office Hours</h4>
                <div className="space-y-4">
                  {Object.entries(besas.find(b => b.id === selectedBesa)?.officeHours || {}).map(([day, hours]) => (
                    <div key={day} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-24">
                        <span className="text-sm font-medium text-gray-700 capitalize">{day}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={hours.available}
                          onChange={(e) => updateBesaOfficeHours(selectedBesa, day, 'available', e.target.checked)}
                          className="h-4 w-4 text-blue-600"
                        />
                        <span className="text-sm text-gray-600">Available</span>
                      </div>
                      {hours.available && (
                        <>
                          <div className="flex items-center space-x-2">
                            <label className="text-sm text-gray-600">Start:</label>
                            <input
                              type="time"
                              value={hours.start}
                              onChange={(e) => updateBesaOfficeHours(selectedBesa, day, 'start', e.target.value)}
                              className="px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <label className="text-sm text-gray-600">End:</label>
                            <input
                              type="time"
                              value={hours.end}
                              onChange={(e) => updateBesaOfficeHours(selectedBesa, day, 'end', e.target.value)}
                              className="px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setSelectedBesa(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setSelectedBesa(null)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* New BESA Modal */}
    {showNewBesaModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl max-w-md w-full p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-900">Add New BESA</h3>
            <button
              onClick={() => setShowNewBesaModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <form
            className="space-y-4"
            onSubmit={e => {
              e.preventDefault();
              setBesas(prev => [
                ...prev,
                { ...newBesa, id: prev.length ? Math.max(...prev.map(b => b.id)) + 1 : 1 }
              ]);
              setShowNewBesaModal(false);
              setNewBesa({
                name: '',
                email: '',
                role: 'BESA',
                status: 'active',
                toursThisWeek: 0,
                totalTours: 0,
                officeHours: {
                  monday: { start: '', end: '', available: false },
                  tuesday: { start: '', end: '', available: false },
                  wednesday: { start: '', end: '', available: false },
                  thursday: { start: '', end: '', available: false },
                  friday: { start: '', end: '', available: false },
                  saturday: { start: '', end: '', available: false },
                  sunday: { start: '', end: '', available: false }
                }
              });
            }}
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={newBesa.name}
                onChange={e => setNewBesa({ ...newBesa, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={newBesa.email}
                onChange={e => setNewBesa({ ...newBesa, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={newBesa.role}
                onChange={e => setNewBesa({ ...newBesa, role: e.target.value })}
              >
                <option value="BESA">BESA</option>
                <option value="BESA Lead">BESA Lead</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={newBesa.status}
                onChange={e => setNewBesa({ ...newBesa, status: e.target.value })}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="flex justify-end mt-4">
              <button
                type="button"
                onClick={() => setShowNewBesaModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 mr-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add BESA
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
  </div>
);

  const OfficeHoursView = () => {
    const compiledSchedule = getCompiledSchedule();
    const dayNames = {
      monday: 'Monday',
      tuesday: 'Tuesday',
      wednesday: 'Wednesday',
      thursday: 'Thursday',
      friday: 'Friday',
      saturday: 'Saturday',
      sunday: 'Sunday'
    };

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Office Hours Management</h1>
          <p className="text-gray-600">Manage individual BESA office hours and view compiled schedule</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Individual BESA Office Hours */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Individual BESA Hours</h2>
            {besas.map((besa) => (
              <div key={besa.id} className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{besa.name}</h3>
                    <p className="text-sm text-gray-500">{besa.email}</p>
                  </div>
                  <button
                    onClick={() => setEditingOfficeHours(editingOfficeHours === besa.id ? null : besa.id)}
                    className="flex items-center space-x-1 px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium"
                  >
                    <Edit3 className="h-3 w-3" />
                    <span>{editingOfficeHours === besa.id ? 'Cancel' : 'Edit'}</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {Object.entries(besa.officeHours).map(([day, hours]) => (
                    <div key={day} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                      <span className="text-sm font-medium text-gray-700 capitalize w-20">{day}</span>
                      {editingOfficeHours === besa.id ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={hours.available}
                            onChange={(e) => updateBesaOfficeHours(besa.id, day, 'available', e.target.checked)}
                            className="h-4 w-4 text-blue-600"
                          />
                          {hours.available && (
                            <>
                              <input
                                type="time"
                                value={hours.start}
                                onChange={(e) => updateBesaOfficeHours(besa.id, day, 'start', e.target.value)}
                                className="px-2 py-1 border border-gray-300 rounded text-xs"
                              />
                              <span className="text-xs text-gray-500">to</span>
                              <input
                                type="time"
                                value={hours.end}
                                onChange={(e) => updateBesaOfficeHours(besa.id, day, 'end', e.target.value)}
                                className="px-2 py-1 border border-gray-300 rounded text-xs"
                              />
                            </>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-600">
                          {hours.available ? `${hours.start} - ${hours.end}` : 'Unavailable'}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {editingOfficeHours === besa.id && (
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => setEditingOfficeHours(null)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center space-x-1"
                    >
                      <Save className="h-3 w-3" />
                      <span>Save Changes</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Compiled Schedule */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Compiled Office Hours</h2>
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Availability</h3>
              <div className="space-y-4">
                {Object.entries(dayNames).map(([key, dayName]) => {
                  const daySchedule = compiledSchedule[key];
                  return (
                    <div key={key} className="border-b border-gray-100 pb-4 last:border-b-0">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-gray-900">{dayName}</span>
                        {daySchedule ? (
                          <span className="text-sm font-medium text-green-600">
                            {daySchedule.start} - {daySchedule.end}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-500">Closed</span>
                        )}
                      </div>
                      {daySchedule && (
                        <div className="text-xs text-gray-600">
                          Available BESAs: {daySchedule.besas.join(', ')}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-6 bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Coverage Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {Object.keys(compiledSchedule).length}
                  </div>
                  <div className="text-sm text-gray-600">Days Covered</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {besas.filter(b => b.status === 'active').length}
                  </div>
                  <div className="text-sm text-gray-600">Active BESAs</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ScheduleView = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Schedule Management</h1>
        <p className="text-gray-600">View and manage tour schedules and office hours</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Calendar View */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">January 2024</h2>
              <div className="flex space-x-2">
                <button className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg text-sm">Previous</button>
                <button className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg text-sm">Next</button>
              </div>
            </div>
            
            <div className="grid grid-cols-7 gap-1 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 35 }, (_, i) => {
                const date = i - 6;
                const hasBooking = [8, 12, 15, 18, 22, 25].includes(date);
                return (
                  <div
                    key={i}
                    className={`p-2 text-center text-sm h-12 flex items-center justify-center rounded-lg ${
                      date > 0 && date <= 31
                        ? hasBooking
                          ? 'bg-blue-100 text-blue-800 font-medium cursor-pointer hover:bg-blue-200'
                          : 'hover:bg-gray-100 cursor-pointer'
                        : 'text-gray-300'
                    }`}
                  >
                    {date > 0 && date <= 31 ? date : ''}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Upcoming Tours */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Upcoming Tours</h3>
            <div className="space-y-4">
              {mockBookings.slice(0, 3).map((booking) => (
                <div key={booking.id} className="border-l-4 border-blue-500 pl-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{booking.tourType}</p>
                      <p className="text-sm text-gray-500">{booking.date} at {booking.time}</p>
                      <p className="text-sm text-gray-600">{booking.attendees} attendees</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Today's Coverage</h3>
            <div className="space-y-3">
              {besas.filter(besa => besa.officeHours.monday.available).map((besa) => (
                <div key={besa.id} className="flex justify-between items-center">
                  <span className="text-sm text-gray-900">{besa.name}</span>
                  <span className="text-sm font-medium text-blue-600">
                    {besa.officeHours.monday.start} - {besa.officeHours.monday.end}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const SettingsView = () => (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your account and system preferences</p>
      </div>

      <div className="space-y-8">
        {/* Profile Settings */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Information</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                defaultValue={currentRole === 'admin' ? 'Jay Administrator' : 'Sarah Johnson'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                defaultValue={currentRole === 'admin' ? 'jay@university.edu' : 'sarah.j@university.edu'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                defaultValue="(555) 123-4567"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                value={currentRole === 'admin' ? 'Administrator' : 'BESA Guide'}
                disabled
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Save Changes
            </button>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Notification Preferences</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Email Notifications</p>
                <p className="text-sm text-gray-500">Receive email alerts for tour bookings and updates</p>
              </div>
              <input type="checkbox" className="h-5 w-5 text-blue-600" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">SMS Notifications</p>
                <p className="text-sm text-gray-500">Get text messages for urgent tour changes</p>
              </div>
              <input type="checkbox" className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Calendar Sync</p>
                <p className="text-sm text-gray-500">Automatically sync tours to your calendar</p>
              </div>
              <input type="checkbox" className="h-5 w-5 text-blue-600" defaultChecked />
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Security Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter current password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter new password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Confirm new password"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Update Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );

return (
  <Routes>
    <Route path="/" element={<PublicBookingView />} />
    <Route path="/admin" element={<Navigate to="/admin/dashboard" />} />
    <Route path="/admin/dashboard" element={<DashboardLayout><DashboardView /></DashboardLayout>} />
    <Route path="/admin/schedule" element={<DashboardLayout><ScheduleView /></DashboardLayout>} />
    <Route path="/admin/tours" element={<DashboardLayout><ToursManagementView /></DashboardLayout>} />
    <Route path="/admin/besas" element={<DashboardLayout><BESAManagementView /></DashboardLayout>} />
    <Route path="/admin/office-hours" element={<DashboardLayout><OfficeHoursView /></DashboardLayout>} />
    <Route path="/admin/settings" element={<DashboardLayout><SettingsView /></DashboardLayout>} />
  </Routes>
);
}

export default App;
