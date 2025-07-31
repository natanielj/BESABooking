import { useState, useEffect } from 'react';
import { Users, Clock, X, } from 'lucide-react';
import { Routes, Route, useNavigate } from 'react-router-dom';
// import { mockTours } from '../data/mockData.ts';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '/Users/arely/BESABooking/BESABooking/src/firebase.ts'; 


//pages and views
import AdminLogin from './pages/admin/adminLogin';
import DashboardLayout from './pages/admin/adminDash';
import DashboardView from './pages/admin/views/dashboard';
import ScheduleView from './pages/admin/views/schedule';
import ToursManagementView from './pages/admin/views/toursManagement';
import BESAManagementView from './pages/admin/views/BESAManagements';
import OfficeHoursView from './pages/admin/views/officeHoursView.tsx';
import SettingsView from './pages/Settings';
import DynamicBookingForm from './pages/DynamicBookingFlow.tsx';

type UserRole = 'public' | 'admin';

type Tour = {
  id: number;
  available: boolean;
  break: string;
  description: string;
  duration: string;
  endDate: string;
  frequency: string;
  holidayHours: string;
  location: string;
  maxAttendees: number;
  notice: string;
  startDate: string;
  timeRange: string;
  title: string;
  zoomLink: string;
};

function App() {
  // const [currentRole, setCurrentRole] = useState<UserRole>('public');
  // const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);

  // const [selectedBesa, setSelectedBesa] = useState<number | null>(null);
  // const [editingOfficeHours, setEditingOfficeHours] = useState<number | null>(null);
  //schedule view // const [besas, setBesas] = useState(mockBesas);
  // const [tours, setTours] = useState(mockTours);
  const [tours, setTours] = useState<Tour[]>([]);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchTours = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'Tours'));
    console.log('Firestore docs:', querySnapshot.docs);

    const tourData: Tour[] = querySnapshot.docs.map(doc => {
      const data = doc.data();

      return {
        id: data.id, // number, as stored in Firestore doc field
        available: data.available ?? false,
        break: data.Break ?? '', // Firestore field is "Break" (uppercase B)
        description: data.description ?? '',
        duration: data.duration ?? '',
        endDate: data.endDate ?? '',
        frequency: data.frequency ?? '',
        holidayHours: data.holidayHours ?? '',
        location: data.location ?? '',
        maxAttendees: data.maxAttendees ?? 0,
        notice: data.notice ?? '',
        startDate: data.startDate ?? '',
        timeRange: data.timeRange ?? '',
        title: data.title ?? '',
        zoomLink: data.zoomlink ?? '', // Note lowercase "zoomlink" in Firestore
      };
    });

    console.log('Fetched tours:', tourData);
    setTours(tourData);
  } catch (error) {
    console.error('Error fetching tours:', error);
  }
};

    fetchTours();
  }, []);

  

  {/* MAIN HOMEPAGE*/ }
  const PublicBookingView = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Top Header */}
      <header className="bg-white shadow-sm border-b-4 border-orange-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
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

      {/* Header Big Block Section */}
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
          Select from our variety of tour options designed to accommodate tour sizes and interests.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {tours
          .filter((tour) => tour.available) // ✅ Only show available tours
          .map((tour) => (
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
                    onClick={() => setSelectedTour(tour)}
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
  );

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
                      {Array.from({ length: selectedTour?.maxAttendees || 15 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1} attendee{i > 0 ? 's' : ''}
                        </option>
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

  return (
    // Move it back to use without login for now
    <Routes>
      <Route path="/" element={<PublicBookingView />} />
      <Route path='/admin/dashboard' element={<DashboardLayout><DashboardView /></DashboardLayout>} />
      <Route path='/admin/schedule' element={<DashboardLayout><ScheduleView /></DashboardLayout>} />
      <Route path='/admin/tours' element={<DashboardLayout><ToursManagementView /></DashboardLayout>} />
      <Route path='/admin/besas' element={<DashboardLayout><BESAManagementView /></DashboardLayout>} />
      <Route path='/admin/office-hours' element={<DashboardLayout><OfficeHoursView /></DashboardLayout>} />
      <Route path='/admin/settings' element={<DashboardLayout><SettingsView /></DashboardLayout>} />
      
      <Route
        path="/booking"
        element={
          <DynamicBookingForm
            onBack={() => navigate('/#tour-options')}
          />}/>
    </Routes>
  );
}

export default App;


      // <Route
      //   path="/admin"
      //   element={
      //     isAdminAuthenticated ? (
      //       <Navigate to="/admin/dashboard" />) : (<AdminLogin />)} />
      // <Route
      //   path="/admin/dashboard"
      //   element={
      //     isAdminAuthenticated ? (
      //       <DashboardLayout><DashboardView /></DashboardLayout>) : (<Navigate to="/admin" />)} />
      // <Route
      //   path="/admin/schedule"
      //   element={
      //     isAdminAuthenticated ? (
      //       <DashboardLayout><ScheduleView /></DashboardLayout>) : (<Navigate to="/admin" />)} />
      // <Route
      //   path="/admin/tours"
      //   element={
      //     isAdminAuthenticated ? (
      //       <DashboardLayout><ToursManagementView /></DashboardLayout>) : (<Navigate to="/admin" />)} />
      // <Route
      //   path="/admin/besas"
      //   element={
      //     isAdminAuthenticated ? (
      //       <DashboardLayout><BESAManagementView /></DashboardLayout>) : (<Navigate to="/admin" />)} />
      // <Route
      //   path="/admin/office-hours"
      //   element={
      //     isAdminAuthenticated ? (
      //       <DashboardLayout><OfficeHoursView /></DashboardLayout>) : (<Navigate to="/admin" />)} />
      // <Route
      //   path="/admin/settings"
      //   element={
      //     isAdminAuthenticated ? (
      //       <DashboardLayout><SettingsView /></DashboardLayout>) : (<Navigate to="/admin" />)} />
{/* ADMIN PAGE START*/ }



{/* ADMIN PAGE HEADER */ }

{/* DASHBOARD VIEW */ }

{/* TOURS MANAGEMENT PAGE */ }
{ /* Tour Info Rendering Problem: Doesn't Save + Needs Reclick After Each Input */ }


{/* Add '+' next to office hours */ }



{/* Update office Hours Helper Function */ }


{/* Office Hours Page - Compiled Schedule*/ }
