import { useState, useEffect } from 'react';
import { Users, Clock } from 'lucide-react';
import { Routes, Route, useNavigate } from 'react-router-dom';

import { collection, getDocs } from 'firebase/firestore';
import { db } from '../src/firebase.ts'; 

import DashboardLayout from './pages/admin/adminDash';
import DashboardView from './pages/admin/views/dashboard';
import ScheduleView from './pages/admin/views/schedule';
import ToursManagementView from './pages/admin/views/toursManagement';
import BESAManagementView from './pages/admin/views/BESAManagements';
import OfficeHoursView from './pages/admin/views/officeHoursView.tsx';
import SettingsView from './pages/Settings';
import DynamicBookingForm from './pages/DynamicBookingFlow.tsx';


function App() {
  const [tours, setTours] = useState<Tour[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
  const fetchTours = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'Tours'));
      const tourData: Tour[] = querySnapshot.docs.map(doc => {
        const data = doc.data();

        return {
          id: doc.id,
          title: data.title ?? '',
          description: data.description ?? '',
          duration: data.duration ?? 0,
          durationUnit: data.durationUnit ?? 'minutes',
          maxAttendees: data.maxAttendees ?? 1,
          location: data.location ?? '',
          zoomLink: data.zoomLink ?? '',
          autoGenerateZoom: data.autoGenerateZoom ?? false,
          weeklyHours: data.weeklyHours ?? {},
          dateSpecificHours: data.dateSpecificHours ?? [],
          frequency: data.frequency ?? 1,
          frequencyUnit: data.frequencyUnit ?? 'hours',
          registrationLimit: data.registrationLimit ?? 1,
          minNotice: data.minNotice ?? 0,
          minNoticeUnit: data.minNoticeUnit ?? 'hours',
          maxNotice: data.maxNotice ?? 1,
          maxNoticeUnit: data.maxNoticeUnit ?? 'days',
          bufferTime: data.bufferTime ?? 0,
          bufferUnit: data.bufferUnit ?? 'minutes',
          cancellationPolicy: data.cancellationPolicy ?? '',
          reschedulingPolicy: data.reschedulingPolicy ?? '',
          intakeForm: data.intakeForm ?? {
            firstName: true,
            lastName: true,
            email: true,
            phone: false,
            attendeeCount: true,
            majorsInterested: false,
            customQuestions: [],
          },
          reminderEmails: data.reminderEmails ?? [],
          sessionInstructions: data.sessionInstructions ?? '',
          published: data.published ?? false,
          createdAt: data.createdAt ?? '',
          upcomingBookings: data.upcomingBookings ?? 0,
          totalBookings: data.totalBookings ?? 0,
        };
      });

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
          .filter((tour) => tour.published)
          .map((tour) => (
            <div
              key={tour.id  }
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
                    onClick={() => navigate('/booking/${tourId}')}
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
        path="/booking/:id"
        element={
          <DynamicBookingForm/>
        }
        
      />
    </Routes>
  );
}

export default App;

