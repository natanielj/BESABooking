
import { useState, useEffect } from 'react';
import { Calendar,Clock, X, CalendarX, User, MapPin, Edit3, Plus, Trash2, CheckCircle2, BellDot, Timer } from 'lucide-react';
import { addDoc, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '/Users/arely/BESABooking/BESABooking/src/firebase.ts';

type Tour = {
  id?: string;
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


export default function ToursManagementView() {
  const defaultNewTour = {
    title: '',
    description: '',
    duration: '',
    maxAttendees: 1,
    available: true,
    frequency: '',
    break: '',
    timeRange: '',
    startDate: '',
    endDate: '',
    notice: '',
    location: '',
    zoomLink: '',
    holidayHours: '',
  };

  const [showEditTourModal, setShowEditTourModal] = useState(false);
  const [editTour, setEditTour] = useState<any>(null);
  const [showNewTourModal, setShowNewTourModal] = useState(false);
  // const [newTour, setNewTour] = useState({ ...defaultNewTour });
  const [newTour, setNewTour] = useState<Tour>({ ...defaultNewTour });


  const [tours, setTours] = useState<Tour[]>([]);


  useEffect(() => {
  const fetchTours = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'Tours'));
      const tourData = querySnapshot.docs.map(doc => ({
        id: doc.id,         // Use Firestore doc ID here as string
        ...doc.data(),
      })) as Tour[];
      setTours(tourData);
    } catch (error) {
      console.error('Error fetching tours:', error);
    }
  };

  fetchTours();
}, []);


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tour Management</h1>
          <p className="text-gray-600">Create and manage different types of tours</p>
        </div>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          onClick={() => setShowNewTourModal(true)}>
          <Plus className="h-4 w-4" />
          <span>Add New Tour</span>
        </button>
      </div>

      <div className="grid gap-6">
        {/* Tour View */}
        {tours.map((tour) => (
          <div key={tour.id} className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{tour.title}</h3>
                <p className="text-gray-600 mb-4">{tour.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4 text-sm text-gray-700">
                  <div>
                    <Clock className="inline-block mr-1" />
                    <strong>Duration:</strong> {tour.duration}
                  </div>

                  <div>
                    <User className="inline-block mr-1" />
                    <strong>Max Attendees:</strong> {tour.maxAttendees}
                  </div>

                  <div>
                    <CheckCircle2 className="inline-block mr-1" />
                    <strong>Status:</strong>{' '}
                    <span className={`font-medium ${tour.available ? 'text-green-700' : 'text-red-700'}`}>
                      {tour.available ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div>
                    <Timer className="inline-block mr-1" />
                    <strong>Frequency:</strong> {tour.frequency || 'N/A'}
                  </div>

                  <div>
                    <Clock className="inline-block mr-1" />
                    <strong>Break Duration:</strong> {tour.break || 'N/A'}
                  </div>

                  <div>
                    <MapPin className="inline-block mr-1" />
                    <strong>Location:</strong> {tour.location || 'N/A'}
                  </div>

                  <div>
                    <Calendar className="inline-block mr-1" />
                    <strong>Date Range:</strong>{' '}
                    {tour.startDate && tour.endDate
                      ? `${new Date(tour.startDate).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })} to ${new Date(tour.endDate).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}`
                      : 'N/A'}
                  </div>

                  <div>
                    <Clock className="inline-block mr-1" />
                    <strong>Time Range:</strong> {tour.timeRange || 'N/A'}
                  </div>

                  <div>
                    <CalendarX className="inline-block mr-1" />
                    <strong>Holiday Hours:</strong> {tour.holidayHours || 'N/A'}
                  </div>

                  {tour.zoomLink && (
                    <div className="md:col-span-3">
                      <strong>Zoom Link:</strong>{' '}
                      <a href={tour.zoomLink} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">
                        {tour.zoomLink}
                      </a>
                    </div>
                  )}

                  <div>
                    <BellDot className="inline-block mr-1" />
                    <strong>Advance Notice:</strong> {tour.notice || 'N/A'}
                  </div>

                </div>
              </div>

              <div className="flex flex-col space-y-2 ml-4">
                <button
                  className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium flex items-center space-x-1"
                  onClick={() => {
                    setEditTour(tour);
                    setShowEditTourModal(true);
                  }}>
                  <Edit3 className="h-3 w-3" />
                  <span>Edit</span>
                </button>
                <button
                  className="px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium flex items-center space-x-1"
                  onClick={async () => {
                    if (window.confirm(`Are you sure you want to delete ${tour.title}? This action cannot be undone.`)) {
                      try {
                        await deleteDoc(doc(db, 'Tours', tour.id!)); // `tour.id` is required and should be defined
                        setTours(prev => prev.filter(t => t.id !== tour.id));
                      } catch (error) {
                        console.error('Error deleting tour:', error);
                        alert('Failed to delete tour. Please try again.');
                      }
                    }
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                  <span>Delete</span>
                </button>

              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add New Tour Button Window */}
      {/* Rendering Fixed; Tour Doesn't Save With Correct Properties*/}
      {showNewTourModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-xl h-3/4 overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Add New Tour</h3>
              <button
                onClick={() => setShowNewTourModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form
              className="space-y-4"
              onSubmit={async (e) => {
              e.preventDefault();
              try {
                const tourToSave = { ...newTour };
                delete tourToSave.id; 

                const docRef = await addDoc(collection(db, 'Tours'), tourToSave);

                setTours((prev) => [...prev, 
                  {...newTour, id: docRef.id, },
                ]);

                setShowNewTourModal(false);
                setNewTour(defaultNewTour);
              } catch (error) {
                console.error('Error adding new tour:', error);
              }
            }}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  value={newTour.title}
                  onChange={(e) => setNewTour((prev) => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  value={newTour.description}
                  onChange={(e) => setNewTour((prev) => ({ ...prev, description: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="e.g. 1 Hour"
                  value={newTour.duration}
                  onChange={(e) => setNewTour((prev) => ({ ...prev, duration: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Attendees</label>
                <input
                  type="number"
                  min={1}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  value={newTour.maxAttendees}
                  onChange={(e) => setNewTour((prev) => ({ ...prev, maxAttendees: Number(e.target.value) }))}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  value={newTour.available ? 'active' : 'inactive'}
                  onChange={(e) =>
                    setNewTour((prev) => ({ ...prev, available: e.target.value === 'active' }))
                  }
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  value={newTour.frequency || ''}
                  onChange={(e) => setNewTour((prev) => ({ ...prev, frequency: e.target.value }))}
                >
                  <option value="">Select Frequency</option>
                  <option value="hourly">Every Hour</option>
                  <option value="half-hourly">Every Half Hour</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Break Duration</label>
                <input
                  type="text"
                  placeholder="e.g. 5 minutes"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  value={newTour.break || ''}
                  onChange={(e) => setNewTour((prev) => ({ ...prev, break: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time Range</label>
                <input
                  type="text"
                  placeholder="e.g. 9am - 12pm"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  value={newTour.timeRange || ''}
                  onChange={(e) => setNewTour((prev) => ({ ...prev, timeRange: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Start Date</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      value={newTour.startDate || ''}
                      onChange={(e) => setNewTour((prev) => ({ ...prev, startDate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">End Date</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      value={newTour.endDate || ''}
                      onChange={(e) => setNewTour((prev) => ({ ...prev, endDate: e.target.value }))}
                      min={newTour.startDate || ''}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Advance Notice</label>
                <input
                  type="text"
                  placeholder="e.g. Must book 1 week in advance"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  value={newTour.notice || ''}
                  onChange={(e) => setNewTour((prev) => ({ ...prev, notice: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  placeholder="e.g. Baskin Engineering"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  value={newTour.location || ''}
                  onChange={(e) => setNewTour((prev) => ({ ...prev, location: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Zoom Link</label>
                <input
                  type="url"
                  placeholder="e.g. https://zoom.us/..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  value={newTour.zoomLink || ''}
                  onChange={(e) => setNewTour((prev) => ({ ...prev, zoomLink: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Holiday Hours / Notes</label>
                <textarea
                  placeholder="e.g. No tours on Nov 28"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  value={newTour.holidayHours || ''}
                  onChange={(e) => setNewTour((prev) => ({ ...prev, holidayHours: e.target.value }))}
                />
              </div>

              <div className="flex justify-end mt-4">
                <button
                  type="button"
                  onClick={() => setShowNewTourModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 mr-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Tour
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* Edit Tour Button Window */}
      {/* Rendering Problem: Reclick after every input */}
      {showEditTourModal && editTour && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-xl h-3/4 overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Edit Tour</h3>
              <button
                onClick={() => setShowEditTourModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                setTours((prev) =>
                  prev.map((t) => (t.id === editTour.id ? editTour : t))
                );
                setShowEditTourModal(false);
                setEditTour(null);
              }}
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  value={editTour.title}
                  onChange={(e) => setEditTour({ ...editTour, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  value={editTour.description}
                  onChange={(e) => setEditTour({ ...editTour, description: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  value={editTour.duration}
                  onChange={(e) => setEditTour({ ...editTour, duration: e.target.value })}
                  required
                  placeholder="e.g. 1 Hour"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Attendees</label>
                <input
                  type="number"
                  min={1}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  value={editTour.maxAttendees}
                  onChange={(e) => setEditTour({ ...editTour, maxAttendees: Number(e.target.value) })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  value={editTour.available ? 'active' : 'inactive'}
                  onChange={(e) => setEditTour({ ...editTour, available: e.target.value === 'active' })}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  value={editTour.frequency || ''}
                  onChange={(e) => setEditTour({ ...editTour, frequency: e.target.value })}
                >
                  <option value="">Select Frequency</option>
                  <option value="hourly">Every Hour</option>
                  <option value="half-hourly">Every Half Hour</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Break Duration</label>
                <input
                  type="text"
                  placeholder="e.g. 5 minutes"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  value={editTour.break || ''}
                  onChange={(e) => setEditTour({ ...editTour, break: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time Range</label>
                <input
                  type="text"
                  placeholder="e.g. 9am - 12pm"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  value={editTour.timeRange || ''}
                  onChange={(e) => setEditTour({ ...editTour, timeRange: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Start Date</label>
                    <input
                      type="date"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      value={editTour.startDate || ''}
                      onChange={(e) => setEditTour({ ...editTour, startDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">End Date</label>
                    <input
                      type="date"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      value={editTour.endDate || ''}
                      onChange={(e) => setEditTour({ ...editTour, endDate: e.target.value })}
                      min={editTour.startDate || ''}
                    />
                  </div>
                </div>
              </div>


              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Advance Notice</label>
                <input
                  type="text"
                  placeholder="e.g. Must book 1 week in advance"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  value={editTour.notice || ''}
                  onChange={(e) => setEditTour({ ...editTour, notice: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  placeholder="e.g. Baskin Engineering"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  value={editTour.location || ''}
                  onChange={(e) => setEditTour({ ...editTour, location: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Zoom Link</label>
                <input
                  type="url"
                  placeholder="e.g. https://zoom.us/..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  value={editTour.zoomLink || ''}
                  onChange={(e) => setEditTour({ ...editTour, zoomLink: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Holiday Hours / Notes</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="e.g. No tours on Nov 28"
                  value={editTour.holidayHours || ''}
                  onChange={(e) => setEditTour({ ...editTour, holidayHours: e.target.value })}
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end mt-4">
                <button
                  type="button"
                  onClick={() => setShowEditTourModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 mr-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
