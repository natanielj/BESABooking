// Work on having the days show in order - Monday to Sunday
import { useState, useEffect } from 'react';
import { Edit3, Save} from 'lucide-react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '/Users/arely/BESABooking/BESABooking/src/firebase.ts';

interface DayHours {
  start: string;
  end: string;
  available: boolean;
}

interface Besa {
  id: string;
  name: string;
  email: string;
  status: string;
  role: string;
  officeHours: {
    [day: string]: DayHours;
  };
}

export default function OfficeHoursView() {
  const [besas, setBesas] = useState<Besa[]>([]);
  const [editingOfficeHours, setEditingOfficeHours] = useState<string | null>(null);


  useEffect(() => {
    const fetchBesas = async () => {
      const snapshot = await getDocs(collection(db, 'Besas'));
      const besaData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<Besa, 'id'>),
      }));
      setBesas(besaData);
    };
      fetchBesas();
    }, []);

  const getCompiledSchedule = () => {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const schedule: { [key: string]: { start: string; end: string; besas: string[] } } = {};

    days.forEach(day => {
      const availableBesas = besas.filter(besa =>
        besa.officeHours?.[day]?.available
      );

      if (availableBesas.length > 0) {
        const times = availableBesas.map(besa => ({
          start: besa.officeHours[day].start,
          end: besa.officeHours[day].end,
          name: besa.name,
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

  const compiledSchedule = getCompiledSchedule();
  const orderedDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayNames = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday'
  };


  const updateBesaOfficeHours = (besaId: string, day: string, field: string, value: string | boolean) => {
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

  const saveOfficeHoursChanges = async (besa: Besa) => {
  try {
    const besaDocRef = doc(db, 'Besas', besa.id);
    await updateDoc(besaDocRef, {
      officeHours: besa.officeHours,
    });
    console.log('Office hours saved!');
  } catch (error) {
    console.error('Failed to save office hours:', error);
    alert('Failed to save changes. Please try again.');
    }
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
                  onClick={async () => {
                    if (editingOfficeHours === besa.id) {
                      await saveOfficeHoursChanges(besa);
                      setEditingOfficeHours(null);
                    } else {
                      setEditingOfficeHours(besa.id);
                    }
                  }}
                  className="flex items-center space-x-1 px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium">
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
                    onClick={async () => {
                      const besaToSave = besas.find(b => b.id === editingOfficeHours);
                      if (!besaToSave) return;

                      try {
                        const besaDocRef = doc(db, 'Besas', besaToSave.id);
                        await updateDoc(besaDocRef, {
                          officeHours: besaToSave.officeHours,
                        });
                        setEditingOfficeHours(null); 
                      } catch (error) {
                        console.error('Failed to save office hours:', error);
                        alert('Failed to save changes. Please try again.');
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center space-x-1">
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
}
