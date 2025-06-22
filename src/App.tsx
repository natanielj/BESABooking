import React, { useState } from 'react';
import { Calendar, Clock, Users, Settings, Plus, Edit2, Trash2, Save, X, User, Mail, Phone, MapPin, UserPlus, Lock, Eye, EyeOff } from 'lucide-react';

interface BESA {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  status: 'active' | 'inactive';
  officeHours: {
    [key: string]: {
      available: boolean;
      startTime: string;
      endTime: string;
    };
  };
}

interface Tour {
  id: string;
  name: string;
  duration: number;
  maxParticipants: number;
  description: string;
  status: 'active' | 'inactive';
}

interface Booking {
  id: string;
  tourType: string;
  date: string;
  time: string;
  participants: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  assignedBESA: string;
}

const defaultOfficeHours = {
  monday: { available: false, startTime: '09:00', endTime: '17:00' },
  tuesday: { available: false, startTime: '09:00', endTime: '17:00' },
  wednesday: { available: false, startTime: '09:00', endTime: '17:00' },
  thursday: { available: false, startTime: '09:00', endTime: '17:00' },
  friday: { available: false, startTime: '09:00', endTime: '17:00' },
  saturday: { available: false, startTime: '10:00', endTime: '16:00' },
  sunday: { available: false, startTime: '10:00', endTime: '16:00' }
};

function App() {
  const [currentView, setCurrentView] = useState('booking');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [editingBESA, setEditingBESA] = useState<string | null>(null);
  const [showAddBESAForm, setShowAddBESAForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginCredentials, setLoginCredentials] = useState({
    email: '',
    password: ''
  });
  const [loginError, setLoginError] = useState('');

  // Sample data
  const [besas, setBesas] = useState<BESA[]>([
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@university.edu',
      phone: '(555) 123-4567',
      department: 'Engineering',
      status: 'active',
      officeHours: {
        monday: { available: true, startTime: '09:00', endTime: '17:00' },
        tuesday: { available: true, startTime: '10:00', endTime: '16:00' },
        wednesday: { available: true, startTime: '09:00', endTime: '17:00' },
        thursday: { available: false, startTime: '09:00', endTime: '17:00' },
        friday: { available: true, startTime: '09:00', endTime: '15:00' },
        saturday: { available: false, startTime: '10:00', endTime: '16:00' },
        sunday: { available: false, startTime: '10:00', endTime: '16:00' }
      }
    },
    {
      id: '2',
      name: 'Michael Chen',
      email: 'michael.chen@university.edu',
      phone: '(555) 234-5678',
      department: 'Business',
      status: 'active',
      officeHours: {
        monday: { available: true, startTime: '08:00', endTime: '16:00' },
        tuesday: { available: true, startTime: '09:00', endTime: '17:00' },
        wednesday: { available: false, startTime: '09:00', endTime: '17:00' },
        thursday: { available: true, startTime: '10:00', endTime: '18:00' },
        friday: { available: true, startTime: '08:00', endTime: '16:00' },
        saturday: { available: true, startTime: '10:00', endTime: '14:00' },
        sunday: { available: false, startTime: '10:00', endTime: '16:00' }
      }
    }
  ]);

  const [tours, setTours] = useState<Tour[]>([
    { id: '1', name: 'Campus Walking Tour', duration: 60, maxParticipants: 15, description: 'General campus overview including main academic buildings, student centers, and recreational facilities', status: 'active' },
    { id: '2', name: 'Engineering Lab Tour', duration: 90, maxParticipants: 10, description: 'Specialized tour of engineering facilities including labs, maker spaces, and research centers', status: 'active' },
    { id: '3', name: 'Business School Tour', duration: 75, maxParticipants: 12, description: 'Focused tour of business facilities including case study rooms, trading floor, and career center', status: 'active' }
  ]);

  const [bookings] = useState<Booking[]>([
    { id: '1', tourType: 'Campus Walking Tour', date: '2024-01-15', time: '10:00', participants: 8, customerName: 'John Smith', customerEmail: 'john@email.com', customerPhone: '(555) 111-2222', status: 'confirmed', assignedBESA: 'Sarah Johnson' },
    { id: '2', tourType: 'Engineering Lab Tour', date: '2024-01-16', time: '14:00', participants: 6, customerName: 'Emily Davis', customerEmail: 'emily@email.com', customerPhone: '(555) 333-4444', status: 'pending', assignedBESA: 'Michael Chen' }
  ]);

  // New BESA form state
  const [newBESA, setNewBESA] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    status: 'active' as 'active' | 'inactive',
    officeHours: { ...defaultOfficeHours }
  });

  const departments = ['Engineering', 'Business', 'Liberal Arts', 'Sciences', 'Medicine', 'Law', 'Education'];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    // Simple demo authentication - in production, this would be handled by a backend
    if (loginCredentials.email === 'admin@university.edu' && loginCredentials.password === 'admin123') {
      setIsAdmin(true);
      setShowLoginForm(false);
      setCurrentView('bookings');
      setLoginCredentials({ email: '', password: '' });
    } else {
      setLoginError('Invalid email or password. Please try again.');
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    setCurrentView('booking');
    setLoginCredentials({ email: '', password: '' });
    setLoginError('');
  };

  const handleAddBESA = () => {
    if (!newBESA.name || !newBESA.email || !newBESA.department) {
      alert('Please fill in all required fields');
      return;
    }

    const besa: BESA = {
      id: Date.now().toString(),
      ...newBESA
    };

    setBesas([...besas, besa]);
    setNewBESA({
      name: '',
      email: '',
      phone: '',
      department: '',
      status: 'active',
      officeHours: { ...defaultOfficeHours }
    });
    setShowAddBESAForm(false);
  };

  const updateBESAOfficeHours = (besaId: string, day: string, field: string, value: any) => {
    setBesas(besas.map(besa => 
      besa.id === besaId 
        ? {
            ...besa,
            officeHours: {
              ...besa.officeHours,
              [day]: {
                ...besa.officeHours[day],
                [field]: value
              }
            }
          }
        : besa
    ));
  };

  const updateNewBESAOfficeHours = (day: string, field: string, value: any) => {
    setNewBESA({
      ...newBESA,
      officeHours: {
        ...newBESA.officeHours,
        [day]: {
          ...newBESA.officeHours[day],
          [field]: value
        }
      }
    });
  };

  const getCompiledSchedule = () => {
    const schedule: { [key: string]: { available: boolean; startTime: string; endTime: string; availableBESAs: string[] } } = {};
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    days.forEach(day => {
      const availableBESAs = besas.filter(besa => 
        besa.status === 'active' && besa.officeHours[day]?.available
      );

      if (availableBESAs.length > 0) {
        const startTimes = availableBESAs.map(besa => besa.officeHours[day].startTime);
        const endTimes = availableBESAs.map(besa => besa.officeHours[day].endTime);
        
        schedule[day] = {
          available: true,
          startTime: startTimes.sort()[0],
          endTime: endTimes.sort().reverse()[0],
          availableBESAs: availableBESAs.map(besa => besa.name)
        };
      } else {
        schedule[day] = {
          available: false,
          startTime: '09:00',
          endTime: '17:00',
          availableBESAs: []
        };
      }
    });

    return schedule;
  };

  const renderLoginForm = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Lock className="w-8 h-8" />
              <h2 className="text-2xl font-bold">Admin Login</h2>
            </div>
            <button 
              onClick={() => setShowLoginForm(false)}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="text-blue-100 mt-2">Access the BESA management dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="p-6">
          {loginError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
              {loginError}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={loginCredentials.email}
                  onChange={(e) => setLoginCredentials({ ...loginCredentials, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={loginCredentials.password}
                  onChange={(e) => setLoginCredentials({ ...loginCredentials, password: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
            >
              Sign In
            </button>
          </div>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Demo credentials: admin@university.edu / admin123
            </p>
          </div>
        </form>
      </div>
    </div>
  );

  const renderTourTypesShowcase = () => (
    <div className="max-w-4xl mx-auto p-6 mb-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Choose Your Campus Experience</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Discover our campus through specialized tours designed to showcase different aspects of university life. 
          Each tour is led by experienced BESA guides who know the campus inside and out.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {tours.filter(tour => tour.status === 'active').map((tour, index) => (
          <div key={tour.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className={`h-2 ${
              index === 0 ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
              index === 1 ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
              'bg-gradient-to-r from-green-500 to-teal-500'
            }`}></div>
            
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">{tour.name}</h3>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  index === 0 ? 'bg-blue-100 text-blue-600' :
                  index === 1 ? 'bg-purple-100 text-purple-600' :
                  'bg-green-100 text-green-600'
                }`}>
                  {index === 0 ? <MapPin className="w-6 h-6" /> :
                   index === 1 ? <Settings className="w-6 h-6" /> :
                   <Users className="w-6 h-6" />}
                </div>
              </div>
              
              <p className="text-gray-600 mb-6 leading-relaxed">{tour.description}</p>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center text-gray-500">
                    <Clock className="w-4 h-4 mr-2" />
                    Duration
                  </span>
                  <span className="font-semibold text-gray-800">{tour.duration} minutes</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center text-gray-500">
                    <Users className="w-4 h-4 mr-2" />
                    Group Size
                  </span>
                  <span className="font-semibold text-gray-800">Up to {tour.maxParticipants} people</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center text-gray-500">
                    <Calendar className="w-4 h-4 mr-2" />
                    Availability
                  </span>
                  <span className="font-semibold text-green-600">Daily tours</span>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="flex items-center text-sm text-gray-500">
                  <User className="w-4 h-4 mr-2" />
                  <span>Led by expert BESA guides</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Can't decide?</h3>
          <p className="text-gray-600 mb-4">
            Our BESA guides can help you choose the perfect tour based on your interests and available time.
          </p>
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
            <span className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              Flexible scheduling
            </span>
            <span className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              Small group sizes
            </span>
            <span className="flex items-center">
              <User className="w-4 h-4 mr-1" />
              Expert guides
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBookingForm = () => (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Book Your Campus Tour</h1>
          <p className="text-blue-100">Discover our campus with expert BESA guides</p>
        </div>
        
        <div className="p-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Tour Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tour Type</label>
                  <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option>Select a tour type</option>
                    {tours.filter(tour => tour.status === 'active').map(tour => (
                      <option key={tour.id} value={tour.id}>{tour.name} ({tour.duration} min)</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                    <input type="date" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                    <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option>Select time</option>
                      <option>9:00 AM</option>
                      <option>10:00 AM</option>
                      <option>11:00 AM</option>
                      <option>2:00 PM</option>
                      <option>3:00 PM</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Number of Participants</label>
                  <input type="number" min="1" max="15" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Contact Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input type="text" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input type="email" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input type="tel" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Special Requirements</label>
                  <textarea rows={3} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Any accessibility needs or special requests..."></textarea>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex justify-center">
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105">
              Book Tour
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAddBESAForm = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-green-600 to-blue-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <UserPlus className="w-8 h-8" />
              <h2 className="text-2xl font-bold">Add New BESA</h2>
            </div>
            <button 
              onClick={() => setShowAddBESAForm(false)}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Personal Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newBESA.name}
                    onChange={(e) => setNewBESA({ ...newBESA, name: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={newBESA.email}
                    onChange={(e) => setNewBESA({ ...newBESA, email: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={newBESA.phone}
                    onChange={(e) => setNewBESA({ ...newBESA, phone: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newBESA.department}
                    onChange={(e) => setNewBESA({ ...newBESA, department: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={newBESA.status}
                    onChange={(e) => setNewBESA({ ...newBESA, status: e.target.value as 'active' | 'inactive' })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Office Hours
              </h3>
              <div className="space-y-3">
                {Object.entries(newBESA.officeHours).map(([day, hours]) => (
                  <div key={day} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-700 capitalize">{day}</span>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={hours.available}
                          onChange={(e) => updateNewBESAOfficeHours(day, 'available', e.target.checked)}
                          className="mr-2 rounded"
                        />
                        <span className="text-sm text-gray-600">Available</span>
                      </label>
                    </div>
                    {hours.available && (
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Start Time</label>
                          <input
                            type="time"
                            value={hours.startTime}
                            onChange={(e) => updateNewBESAOfficeHours(day, 'startTime', e.target.value)}
                            className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">End Time</label>
                          <input
                            type="time"
                            value={hours.endTime}
                            onChange={(e) => updateNewBESAOfficeHours(day, 'endTime', e.target.value)}
                            className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              onClick={() => setShowAddBESAForm(false)}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddBESA}
              className="px-6 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add BESA</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBESAManagement = () => (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <Users className="w-8 h-8 mr-3 text-blue-600" />
          BESA Management
        </h2>
        <button
          onClick={() => setShowAddBESAForm(true)}
          className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add New BESA</span>
        </button>
      </div>

      <div className="grid gap-6">
        {besas.map(besa => (
          <div key={besa.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {besa.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">{besa.name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                      <span className="flex items-center">
                        <Mail className="w-4 h-4 mr-1" />
                        {besa.email}
                      </span>
                      {besa.phone && (
                        <span className="flex items-center">
                          <Phone className="w-4 h-4 mr-1" />
                          {besa.phone}
                        </span>
                      )}
                      <span className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {besa.department}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    besa.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {besa.status}
                  </span>
                  <button
                    onClick={() => setEditingBESA(editingBESA === besa.id ? null : besa.id)}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6">
              <h4 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Office Hours
              </h4>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Object.entries(besa.officeHours).map(([day, hours]) => (
                  <div key={day} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium text-gray-700 capitalize">{day}</span>
                      {editingBESA === besa.id && (
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={hours.available}
                            onChange={(e) => updateBESAOfficeHours(besa.id, day, 'available', e.target.checked)}
                            className="mr-2 rounded"
                          />
                          <span className="text-sm text-gray-600">Available</span>
                        </label>
                      )}
                      {editingBESA !== besa.id && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          hours.available 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {hours.available ? 'Available' : 'Unavailable'}
                        </span>
                      )}
                    </div>
                    {hours.available && (
                      <div className="space-y-2">
                        {editingBESA === besa.id ? (
                          <>
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Start Time</label>
                              <input
                                type="time"
                                value={hours.startTime}
                                onChange={(e) => updateBESAOfficeHours(besa.id, day, 'startTime', e.target.value)}
                                className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">End Time</label>
                              <input
                                type="time"
                                value={hours.endTime}
                                onChange={(e) => updateBESAOfficeHours(besa.id, day, 'endTime', e.target.value)}
                                className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                          </>
                        ) : (
                          <div className="text-sm text-gray-600">
                            {hours.startTime} - {hours.endTime}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {editingBESA === besa.id && (
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => setEditingBESA(null)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {showAddBESAForm && renderAddBESAForm()}
    </div>
  );

  const renderOfficeHours = () => {
    const compiledSchedule = getCompiledSchedule();
    const activeBESAs = besas.filter(besa => besa.status === 'active');
    const daysCovered = Object.values(compiledSchedule).filter(day => day.available).length;

    return (
      <div className="p-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
            <Clock className="w-8 h-8 mr-3 text-blue-600" />
            Office Hours Overview
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Days Covered</p>
                  <p className="text-3xl font-bold">{daysCovered}/7</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-200" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Active BESAs</p>
                  <p className="text-3xl font-bold">{activeBESAs.length}</p>
                </div>
                <Users className="w-8 h-8 text-green-200" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Coverage Rate</p>
                  <p className="text-3xl font-bold">{Math.round((daysCovered / 7) * 100)}%</p>
                </div>
                <Settings className="w-8 h-8 text-purple-200" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-6 text-gray-800">Compiled Schedule</h3>
            <div className="space-y-4">
              {Object.entries(compiledSchedule).map(([day, schedule]) => (
                <div key={day} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-700 capitalize">{day}</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      schedule.available 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {schedule.available ? 'Available' : 'Closed'}
                    </span>
                  </div>
                  {schedule.available && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">
                        {schedule.startTime} - {schedule.endTime}
                      </p>
                      <p className="text-xs text-gray-500">
                        Available BESAs: {schedule.availableBESAs.join(', ')}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-6 text-gray-800">Individual BESA Schedules</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {activeBESAs.map(besa => (
                <div key={besa.id} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-3">{besa.name}</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(besa.officeHours).map(([day, hours]) => (
                      <div key={day} className="flex justify-between">
                        <span className="text-gray-600 capitalize">{day.slice(0, 3)}:</span>
                        <span className={hours.available ? 'text-green-600' : 'text-red-500'}>
                          {hours.available ? `${hours.startTime}-${hours.endTime}` : 'Closed'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTourManagement = () => (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <Settings className="w-8 h-8 mr-3 text-blue-600" />
          Tour Management
        </h2>
        <button className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add New Tour</span>
        </button>
      </div>

      <div className="grid gap-6">
        {tours.map(tour => (
          <div key={tour.id} className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">{tour.name}</h3>
                <p className="text-gray-600">{tour.description}</p>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  tour.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {tour.status}
                </span>
                <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center text-gray-600">
                <Clock className="w-4 h-4 mr-2" />
                Duration: {tour.duration} minutes
              </div>
              <div className="flex items-center text-gray-600">
                <Users className="w-4 h-4 mr-2" />
                Max Participants: {tour.maxParticipants}
              </div>
              <div className="flex items-center text-gray-600">
                <Calendar className="w-4 h-4 mr-2" />
                Bookings: {bookings.filter(b => b.tourType === tour.name).length}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderBookingManagement = () => (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <Calendar className="w-8 h-8 mr-3 text-blue-600" />
        Booking Management
      </h2>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tour</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Participants</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">BESA</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bookings.map(booking => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{booking.customerName}</div>
                      <div className="text-sm text-gray-500">{booking.customerEmail}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.tourType}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{booking.date}</div>
                    <div className="text-sm text-gray-500">{booking.time}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.participants}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.assignedBESA}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                    <button className="text-red-600 hover:text-red-900">Cancel</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold text-gray-800">BESA Tour System</h1>
              <div className="flex space-x-4">
                <button
                  onClick={() => setCurrentView('booking')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    currentView === 'booking' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Book Tour
                </button>
                {isAdmin && (
                  <>
                    <button
                      onClick={() => setCurrentView('bookings')}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        currentView === 'bookings' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      Manage Bookings
                    </button>
                    <button
                      onClick={() => setCurrentView('besas')}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        currentView === 'besas' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      Manage BESAs
                    </button>
                    <button
                      onClick={() => setCurrentView('office-hours')}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        currentView === 'office-hours' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      Office Hours
                    </button>
                    <button
                      onClick={() => setCurrentView('tours')}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        currentView === 'tours' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      Manage Tours
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {isAdmin && (
                <span className="text-sm text-gray-600">
                  Welcome, Admin
                </span>
              )}
              {isAdmin ? (
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                >
                  Logout
                </button>
              ) : (
                <button
                  onClick={() => setShowLoginForm(true)}
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center space-x-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>Admin Login</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main>
        {currentView === 'booking' && (
          <>
            {renderTourTypesShowcase()}
            {renderBookingForm()}
          </>
        )}
        {currentView === 'bookings' && isAdmin && renderBookingManagement()}
        {currentView === 'besas' && isAdmin && renderBESAManagement()}
        {currentView === 'office-hours' && isAdmin && renderOfficeHours()}
        {currentView === 'tours' && isAdmin && renderTourManagement()}
      </main>

      {showLoginForm && renderLoginForm()}
    </div>
  );
}

export default App;