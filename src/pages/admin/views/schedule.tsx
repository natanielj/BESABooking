import React, { useState } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameDay,
  isSameMonth,
  subMonths,
  addMonths,
  getDate
} from 'date-fns';

import { mockTours, mockBesas, mockBookings } from '../../../../data/mockData';

export default function ScheduleView() {
  const [besas, setBesas] = useState(mockBesas);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const generateCalendarDays = () => {
    const days = [];
    let day = startDate;
    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  };

  const calendarDays = generateCalendarDays();

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    setSelectedDate(today);
  };

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const selectedDateKey = format(selectedDate, 'MM-dd-yyyy');
  const filteredBookings = mockBookings.filter(
    booking => format(new Date(booking.date), 'MM-dd-yyyy') === selectedDateKey
  );

  const selectedWeekday = format(selectedDate, 'EEEE').toLowerCase() as keyof typeof mockBesas[0]['officeHours'];

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
              <h2 className="text-xl font-bold text-gray-900">
                {format(currentMonth, 'MMMM yyyy')}
              </h2>
              <div className="flex space-x-2">
                <button onClick={handlePrevMonth} className="text-sm px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg">Previous</button>
                <button onClick={handleToday} className="text-sm px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg">Today</button>
                <button onClick={handleNextMonth} className="text-sm px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg">Next</button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, i) => {
                const isSelected = isSameDay(day, selectedDate);
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const hasBooking = mockBookings.some(
                  booking => isSameDay(new Date(booking.date), day)
                );
                return (
                  <div
                    key={i}
                    onClick={() => handleDayClick(day)}
                    className={`p-2 text-center text-sm h-12 flex items-center justify-center rounded-lg cursor-pointer
                      ${isSelected
                        ? 'bg-blue-100 text-blue-800 font-medium'
                        : hasBooking
                        ? 'border border-blue-400 text-blue-700 font-medium hover:bg-blue-50'
                        : isCurrentMonth
                        ? 'hover:bg-gray-100 text-gray-900'
                        : 'text-gray-300'}
                    `}
                  >
                    {getDate(day)}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tours & Coverage */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Tours for {format(selectedDate, 'MMMM d, yyyy')}
            </h3>
            <div className="space-y-4">
              {filteredBookings.length > 0 ? (
                filteredBookings.map(booking => (
                  <div key={booking.id} className="border-l-4 border-blue-500 pl-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">{booking.tourType}</p>
                        <p className="text-sm text-gray-500">{booking.date} at {booking.time}</p>
                        <p className="text-sm text-gray-600">{booking.attendees} attendees</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        booking.status === 'confirmed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No tours scheduled.</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {format(selectedDate, 'MMMM d, yyyy')} Coverage
            </h3>
            <div className="space-y-3">
              {besas
                .filter(besa => besa.officeHours[selectedWeekday]?.available)
                .map(besa => (
                  <div key={besa.id} className="flex justify-between items-center">
                    <span className="text-sm text-gray-900">{besa.name}</span>
                    <span className="text-sm font-medium text-blue-600">
                      {besa.officeHours[selectedWeekday].start} – {besa.officeHours[selectedWeekday].end}
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
