import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Users, User, Mail, Phone, MapPin, ArrowLeft, ArrowRight, Check, AlertCircle, Star, Heart, GraduationCap, BookOpen, Book } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '/Users/arely/BESABooking/BESABooking/src/firebase.ts';

interface BookingData {
  // Date & Tour Type
  tourType: string;
  date: string;
  
  // Available Times
  timeSlot: string;
  groupSize: number;
  
  // Preferences & Booking Info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  organization: string;
  role: string;
  interests: string[];
  accessibility: string;
  specialRequests: string;
  marketingConsent: boolean;
}

interface Tour {
  id: string;
  title: string;
  description: string;
  duration: string;
  maxAttendees: number;
}

interface DynamicBookingFormProps {
  onBack: () => void | Promise<void>;
  preselectedTour?: string;
  tours: Tour[]; 
}

function BookingPage() {
  const [tours, setTours] = useState<Tour[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTours = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "Tours"));
        const toursData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          title: doc.data().title || "",
          description: doc.data().description || "",
          duration: doc.data().duration || "",
          maxAttendees: doc.data().maxAttendees || 0,
        })) as Tour[];
        setTours(toursData);
      } catch (error) {
        console.error("Error fetching tours:", error);
      }
    };

    fetchTours();
  }, []);

  return <DynamicBookingForm tours={tours} onBack={() => navigate('/')} />;
}

const DynamicBookingForm: React.FC<DynamicBookingFormProps> = ({
  onBack,
  preselectedTour = '',
  tours, 
}) => {
  const [selectedTour, setSelectedTour] = useState<string | null>(null);
  const [currentSection, setCurrentSection] = useState(1);
  const [bookingData, setBookingData] = useState<BookingData>({
    tourType: preselectedTour,
    date: '',
    timeSlot: '',
    groupSize: 1,
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    organization: '',
    role: '',
    interests: [],
    accessibility: '',
    specialRequests: '',
    marketingConsent: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);

  
  const timeSlotsByTour = {
    'campus-walking': ['9:00 AM', '10:30 AM', '12:00 PM', '1:30 PM', '3:00 PM', '4:30 PM'],
    'engineering-lab': ['9:00 AM', '11:00 AM', '1:00 PM', '3:00 PM'],
    'business-school': ['9:30 AM', '11:15 AM', '1:00 PM', '2:45 PM', '4:30 PM'],
    'student-life': ['10:00 AM', '12:00 PM', '2:00 PM', '4:00 PM'],
    'research-facilities': ['9:00 AM', '1:00 PM', '3:00 PM'],
    'custom': ['9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM']
  };

  const interestOptions = [
    'Academic Programs', 'Student Life', 'Research Opportunities',
    'Campus Facilities', 'Housing Options', 'Career Services',
    'Athletics & Recreation', 'Study Abroad', 'Financial Aid', 'Graduate Programs',
    'Clubs & Organizations', 'Internship Programs'
  ];

  const sections = [
    { id: 1, title: 'Date & Type of Tour', description: 'Choose your preferred tour and date' },
    { id: 2, title: 'Available Times', description: 'Select your time slot and group details' },
    { id: 3, title: 'Preferences & Booking Info', description: 'Complete your booking information' }
  ];

  {/* Update booking data and reset errors when a field changes */}
  const updateBookingData = (field: keyof BookingData, value: any) => {
    setBookingData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Update available times when tour type changes
    if (field === 'tourType' && value) {
      setAvailableTimes(timeSlotsByTour[value as keyof typeof timeSlotsByTour] || []);
      setBookingData(prev => ({ ...prev, timeSlot: '' })); // Reset time slot
    }
  };

  // Set available times when component mounts with preselected tour
  React.useEffect(() => {
    if (preselectedTour) {
      setAvailableTimes(timeSlotsByTour[preselectedTour as keyof typeof timeSlotsByTour] || []);
    }
  }, [preselectedTour]);

  {/* Validate current section data */}
  const validateSection = (section: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (section) {
      case 1:
        if (!bookingData.tourType) newErrors.tourType = 'Please select a tour type';
        if (!bookingData.date) newErrors.date = 'Please select a date';
        break;
      case 2:
        if (!bookingData.timeSlot) newErrors.timeSlot = 'Please select a time slot';
        if (bookingData.groupSize < 1) newErrors.groupSize = 'Group size must be at least 1';
        break;
      case 3:
        if (!bookingData.firstName) newErrors.firstName = 'First name is required';
        if (!bookingData.lastName) newErrors.lastName = 'Last name is required';
        if (!bookingData.email) newErrors.email = 'Email is required';
        if (!bookingData.phone) newErrors.phone = 'Phone number is required';
        if (!bookingData.organization) newErrors.organization = 'Organization is required';
        if (!bookingData.role) newErrors.role = 'Role is required';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  {/* Navigate to the next section */}
  const nextSection = () => {
    if (validateSection(currentSection)) {
      setCurrentSection(prev => Math.min(prev + 1, 3));
    }
  };

  {/* Navigate to the previous section */}
  const prevSection = () => {
    setCurrentSection(prev => Math.max(prev - 1, 1));
  };

  {/* Handle form submission */}
  const handleSubmit = () => {
    if (validateSection(currentSection)) {
      alert('Booking submitted successfully!');
      console.log('Booking Data:', bookingData);
    }
  };

  {/* Clicking on a tour type toggle*/}
  const toggleInterest = (interest: string) => {
    const currentInterests = bookingData.interests;
    const newInterests = currentInterests.includes(interest)
      ? currentInterests.filter(i => i !== interest)
      : [...currentInterests, interest];
    updateBookingData('interests', newInterests);
  };

  {/* Current Section Indicator On Top*/}
  const renderSectionIndicator = () => (
    <div className="flex items-start justify-center mb-8">
      {sections.map((section, index) => (
        <div key={section.id} className="flex items-center">
          <div className="text-center flex flex-col items-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium mb-2 ${
              section.id <= currentSection 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-600'
            }`}>
              {section.id < currentSection ? <Check className="w-6 h-6" /> : section.id}
            </div>
            <div className="text-center w-32">
              <p className={`text-sm font-medium ${
                section.id <= currentSection ? 'text-blue-600' : 'text-gray-500'
              }`}>
                {section.title}
              </p>
              <p className="text-xs text-gray-400 mt-1">{section.description}</p>
            </div>
          </div>
          {index < sections.length - 1 && (
            <div className={`w-20 h-1 mx-4 mt-6 flex-shrink-0 ${
              section.id < currentSection ? 'bg-blue-600' : 'bg-gray-200'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  {/* Date & Type of Tour Section */}
  const renderSection1 = () => (
    <div className="space-y-8">
      {/* Title and Description */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Tour Experience</h2>
        <p className="text-gray-600">Select the tour that best matches your interests and preferred date</p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Available Tours</h3>
        <div className="grid gap-6">
          {tours.map((tour) => (
          <div key={tour.id} className={`tour-card ${selectedTour === tour.id ? 'selected' : ''}`}>
            <h3 className="text-lg font-semibold text-indigo-600 mb-2">
              {tour.title}
            </h3>
            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
              {tour.description}
            </p>
            <div className="text-sm text-gray-700 space-y-1">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                  {tour.duration}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                  Max {tour.maxAttendees} people
              </span>
            </div>
            <button
              onClick={() => {
                  setSelectedTour(tour.id);
                  updateBookingData('tourType', tour.id);
                }}
                className={`mt-4 px-4 py-2 rounded-lg font-semibold ${
                  selectedTour === tour.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-blue-100'
                }`}>
                {selectedTour === tour.id ? 'Selected' : 'Select This Tour'}
            </button>
          </div>
        ))}
      </div>
    </div>

    {errors.tourType && (
      <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
        <AlertCircle className="w-4 h-4" />
        {errors.tourType}
      </p>
    )}

    <div>
      <label className="block text-lg font-semibold text-gray-900 mb-4">
        Preferred Date
      </label>
      <input
        type="date"
        value={bookingData.date}
        onChange={(e) => updateBookingData('date', e.target.value)}
        min={new Date().toISOString().split('T')[0]}
        className={`w-full px-4 py-3 border-2 rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          errors.date ? 'border-red-500' : 'border-gray-300'
        }`}
      />
      {errors.date && (
        <p className="text-red-500 text-sm mt-2">{errors.date}</p>
      )}
    </div>
  </div>
);

  {/* Available Times Section */}
  const renderSection2 = () => (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Your Time Slot</h2>
        <p className="text-gray-600">Choose from available times for your selected tour</p>
      </div>

      {bookingData.tourType && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-blue-900">
                {tours.find(t => t.id === bookingData.tourType)?.title}
              </p>
              <p className="text-blue-700 text-sm">
                {bookingData.date} • {tours.find(t => t.id === bookingData.tourType)?.duration}
              </p>
            </div>
          </div>
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Time Slots</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {availableTimes.map((time) => (
            <button
              key={time}
              onClick={() => updateBookingData('timeSlot', time)}
              className={`p-4 border-2 rounded-lg text-center transition-all hover:shadow-md ${
                bookingData.timeSlot === time
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Clock className="w-5 h-5 mx-auto mb-2 text-gray-600" />
              <span className="font-medium">{time}</span>
            </button>
          ))}
        </div>
        {errors.timeSlot && (
          <p className="text-red-500 text-sm mt-2">{errors.timeSlot}</p>
        )}
      </div>

      <div>
        <label className="block text-lg font-semibold text-gray-900 mb-4">
          Group Size
        </label>
        <div className="flex items-center space-x-4">
          <button
            type="button"
            onClick={() => updateBookingData('groupSize', Math.max(1, bookingData.groupSize - 1))}
            className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-50"
          >
            -
          </button>
          <span className="text-2xl font-semibold text-gray-900 min-w-12 text-center">
            {bookingData.groupSize}
          </span>
          <button
            type="button"
            onClick={() => {
              const maxSize = tours.find(t => t.id === bookingData.tourType)?.maxAttendees || 15;
              updateBookingData('groupSize', Math.min(maxSize, bookingData.groupSize + 1));
            }}
            className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-50"
          >
            +
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Maximum group size: {tours.find(t => t.id === bookingData.tourType)?.maxAttendees || 15} people
        </p>
        {errors.groupSize && (
          <p className="text-red-500 text-sm mt-2">{errors.groupSize}</p>
        )}
      </div>
    </div>
  );

  {/* Preferences & Booking Info Section */}
  const renderSection3 = () => (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Booking</h2>
        <p className="text-gray-600">Provide your details and preferences to finalize your tour</p>
      </div>

      {/* Personal Information */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <User className="w-5 h-5" />
          Personal Information
        </h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name *
            </label>
            <input
              type="text"
              value={bookingData.firstName}
              onChange={(e) => updateBookingData('firstName', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.firstName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your first name"
            />
            {errors.firstName && (
              <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name *
            </label>
            <input
              type="text"
              value={bookingData.lastName}
              onChange={(e) => updateBookingData('lastName', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.lastName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your last name"
            />
            {errors.lastName && (
              <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              value={bookingData.email}
              onChange={(e) => updateBookingData('email', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="your.email@example.com"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              value={bookingData.phone}
              onChange={(e) => updateBookingData('phone', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.phone ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="(555) 123-4567"
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
            )}
          </div>
        </div>
      </div>

      {/* Background Information */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <GraduationCap className="w-5 h-5" />
          Background Information
        </h3>
        
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Organization/School *
            </label>
            <input
              type="text"
              value={bookingData.organization}
              onChange={(e) => updateBookingData('organization', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.organization ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Your school or organization"
            />
            {errors.organization && (
              <p className="text-red-500 text-sm mt-1">{errors.organization}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role *
            </label>
            <select
              value={bookingData.role}
              onChange={(e) => updateBookingData('role', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.role ? 'border-red-500' : 'border-gray-300'
              }`}>
              <option value="">Select your role</option>
              <option value="prospective-student">Prospective Student</option>
              <option value="parent">Parent/Guardian</option>
              <option value="counselor">School Counselor</option>
              <option value="teacher">Teacher</option>
              <option value="administrator">Administrator</option>
              <option value="other">Other</option>
            </select>
            {errors.role && (
              <p className="text-red-500 text-sm mt-1">{errors.role}</p>
            )}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Areas of Interest (Select all that apply)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {interestOptions.map((interest) => (
              <label key={interest} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={bookingData.interests.includes(interest)}
                  onChange={() => toggleInterest(interest)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{interest}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Accessibility Needs
            </label>
            <textarea
              value={bookingData.accessibility}
              onChange={(e) => updateBookingData('accessibility', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Please describe any accessibility accommodations needed..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Special Requests
            </label>
            <textarea
              value={bookingData.specialRequests}
              onChange={(e) => updateBookingData('specialRequests', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Any special requests or questions about your visit..."
            />
          </div>
        </div>
      </div>

      {/* Marketing Consent */}
      <div className="border-t pt-6">
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={bookingData.marketingConsent}
            onChange={(e) => updateBookingData('marketingConsent', e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">
            I would like to receive updates about campus events and programs
          </span>
        </label>
      </div>

      {/* Booking Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="font-semibold text-blue-900 mb-3">Booking Summary</h4>
        <div className="space-y-2 text-sm text-blue-800">
          <p><span className="font-medium">Tour:</span> {tours.find(t => t.id === bookingData.tourType)?.title}</p>
          <p><span className="font-medium">Date & Time:</span> {bookingData.date} at {bookingData.timeSlot}</p>
          <p><span className="font-medium">Group Size:</span> {bookingData.groupSize} people</p>
          <p><span className="font-medium">Contact:</span> {bookingData.firstName} {bookingData.lastName}</p>
        </div>
      </div>
    </div>
  );

  return (
    // Main Title and Header + Back To Home Button
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              Back to Home
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Campus Tour Booking</h1>
            <div className="w-24" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          {renderSectionIndicator()}

          <div className="mb-8">
            {currentSection === 1 && renderSection1()}
            {currentSection === 2 && renderSection2()}
            {currentSection === 3 && renderSection3()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t">
            <button
              onClick={prevSection}
              disabled={currentSection === 1}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
                currentSection === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}>
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>

            {currentSection < 3 ? (
              <button
                onClick={nextSection}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <Check className="w-4 h-4" />
                Complete Booking
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};



export default BookingPage;
