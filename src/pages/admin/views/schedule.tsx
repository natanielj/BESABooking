import React, { useState } from 'react';

import { mockTours, mockBesas, mockBookings } from '../../../../data/mockData.ts';


export default function ScheduleView() {
  const [besas, setBesas] = useState(mockBesas);
  
  return (
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
                    className={`p-2 text-center text-sm h-12 flex items-center justify-center rounded-lg ${date > 0 && date <= 31
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
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
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
}


