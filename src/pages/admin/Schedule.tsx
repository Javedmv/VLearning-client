import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

const Schedule:React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const events = [
    {
      id: 1,
      title: 'Web Development Live Session',
      time: '09:00 AM - 10:30 AM',
      instructor: 'Dr. Robert Brown',
      type: 'Live Session',
      color: 'bg-blue-100 text-blue-800',
      date: new Date(2024, 2, 15) // March 15, 2024
    },
    {
      id: 2,
      title: 'Data Science Workshop',
      time: '11:00 AM - 12:30 PM',
      instructor: 'Prof. Emily White',
      type: 'Workshop',
      color: 'bg-purple-100 text-purple-800',
      date: new Date(2024, 2, 15) // March 15, 2024
    },
    {
      id: 3,
      title: 'UI/UX Design Review',
      time: '02:00 PM - 03:30 PM',
      instructor: 'Sarah Johnson',
      type: 'Review',
      color: 'bg-pink-100 text-pink-800',
      date: new Date(2024, 2, 16) // March 16, 2024
    },
    {
      id: 4,
      title: 'Machine Learning Q&A',
      time: '04:00 PM - 05:00 PM',
      instructor: 'Dr. Michael Chen',
      type: 'Q&A Session',
      color: 'bg-green-100 text-green-800',
      date: new Date(2024, 2, 16) // March 16, 2024
    }
  ];

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { 
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => isSameDay(event.date, date));
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      if (direction === 'prev') {
        newDate.setMonth(prevDate.getMonth() - 1);
      } else {
        newDate.setMonth(prevDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDayOfMonth = getFirstDayOfMonth(currentDate);
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="aspect-square p-2" />);
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayEvents = getEventsForDate(date);
      const hasEvents = dayEvents.length > 0;
      
      days.push(
        <div
          key={day}
          className={`aspect-square p-2 rounded-lg border ${
            isToday(date)
              ? 'bg-blue-50 border-blue-200'
              : 'border-gray-200 hover:bg-gray-50'
          } relative cursor-pointer`}
        >
          <span className={`text-sm ${
            isToday(date) ? 'font-bold text-blue-600' : ''
          }`}>
            {day}
          </span>
          {hasEvents && (
            <div className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-blue-500" />
          )}
        </div>
      );
    }

    return days;
  };

  const todayEvents = events.filter(event => 
    isSameDay(event.date, new Date())
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Schedule</h1>
        <p className="text-gray-600">Manage your classes and events</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center justify-between w-64">
          <button 
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-semibold mx-4 whitespace-nowrap">{formatDate(currentDate)}</h2>
          <button 
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus className="w-5 h-5" />
            <span>Add Event</span>
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-7 gap-4 text-center text-sm font-medium text-gray-500 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-4 text-sm">
            {renderCalendar()}
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Today's Schedule</h3>
            <div className="space-y-4">
              {todayEvents.length > 0 ? (
                todayEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">{event.title}</h4>
                        <p className="text-sm text-gray-500 mt-1">{event.time}</p>
                        <p className="text-sm text-gray-500">{event.instructor}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${event.color}`}>
                        {event.type}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No events scheduled for today</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Schedule;