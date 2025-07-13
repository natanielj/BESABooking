
// Mock data
export const mockTours = [
  {
    id: 1,
    title: 'Baskin Engineering Group In-Person Tours',
    duration: 1,
    maxAttendees: 5,
    description: 'This is an in-person tour of the Jack Baskin Engineering Building, led by the Baskin Engineering Student Ambassadors. During the tour, we will explore key areas that define the engineering experience at UCSC, such as classes, advising, research, student clubs, and more. You will also get a look inside Slugworks, our student-focused makerspace in the Baskin basement!',
    available: true
  },
  {
    id: 2,
    title: 'Baskin Engineering Group Virtual Tours',
    duration: 1,
    maxAttendees: 8,
    description: 'The virtual tour is hosted via Zoom and features a presentation led by our BESA ambassadors. You will get an overview of the Baskin Engineering building, detailed information on the majors offered under Baskin, and an introduction to student clubs and organizations within Baskin. The session ends with time for questions, so you can engage directly with our ambassadors.',
    available: true
  },
  {
    id: 3,
    title: 'Baskin Engineering Large In-Person Tours (10+ attendees)',
    duration: 1,
    maxAttendees: 50,
    description: 'This is a UCSC Baskin Engineering Large In Person Tours (For groups of more than 10) provided by the Baskin Engineering Student Ambassadors. This page is for those who are wanting to book this tour for a class. Please do not book this unless your group has more than 10 people.',
    available: true
  },
  {
    id: 4,
    title: 'Slugworks Group In-Person Tours',
    duration: 0.75,
    maxAttendees: 5,
    description: 'Book a tour of Slugworks, UCSC’s student-focused makerspace in Baskin Engineering. Open to all undergraduates, it features a machine shop, Creatorspace, classroom, and club space — no engineering major required!',
    available: true
  },
  {
    id: 5,
    title: 'BESAs Drop In Office Hours',
    duration: 0.25,
    maxAttendees: 5,
    description: 'Book a one-on-one Virtual Office Hour with a BESA Ambassador to ask questions and learn more about Baskin Engineering.',
    available: true
  }
];

export const mockBesas = [
  {
    id: 1,
    name: 'Sarah Johnson',
    email: 'sarah.j@university.edu',
    role: 'BESA',
    status: 'active',
    major: 'Computer Science',
    toursThisWeek: 8,
    totalTours: 147,
    officeHours: {
      monday: { start: '09:00', end: '17:00', available: true },
      tuesday: { start: '09:00', end: '17:00', available: true },
      wednesday: { start: '10:00', end: '16:00', available: true },
      thursday: { start: '09:00', end: '17:00', available: true },
      friday: { start: '09:00', end: '15:00', available: true },
      saturday: { start: '', end: '', available: false },
      sunday: { start: '', end: '', available: false }
    }
  },
  {
    id: 2,
    name: 'Michael Chen',
    email: 'michael.c@university.edu',
    role: 'BESA Lead',
    status: 'active',
    toursThisWeek: 12,
    totalTours: 203,
    officeHours: {
      monday: { start: '08:00', end: '16:00', available: true },
      tuesday: { start: '08:00', end: '16:00', available: true },
      wednesday: { start: '08:00', end: '16:00', available: true },
      thursday: { start: '08:00', end: '16:00', available: true },
      friday: { start: '08:00', end: '14:00', available: true },
      saturday: { start: '10:00', end: '14:00', available: true },
      sunday: { start: '', end: '', available: false }
    }
  },
  {
    id: 3,
    name: 'Emma Rodriguez',
    email: 'emma.r@university.edu',
    role: 'BESA',
    status: 'active',
    toursThisWeek: 6,
    totalTours: 89,
    officeHours: {
      monday: { start: '11:00', end: '19:00', available: true },
      tuesday: { start: '11:00', end: '19:00', available: true },
      wednesday: { start: '11:00', end: '19:00', available: true },
      thursday: { start: '11:00', end: '19:00', available: true },
      friday: { start: '11:00', end: '17:00', available: true },
      saturday: { start: '', end: '', available: false },
      sunday: { start: '12:00', end: '16:00', available: true }
    }
  },
  {
    id: 4,
    name: 'Arely Rosendes',
    email: 'emma.r@university.edu',
    role: 'BESA',
    status: 'active',
    toursThisWeek: 6,
    totalTours: 89,
    officeHours: {
      monday: { start: '11:00', end: '19:00', available: true },
      tuesday: { start: '11:00', end: '19:00', available: true },
      wednesday: { start: '11:00', end: '19:00', available: true },
      thursday: { start: '11:00', end: '19:00', available: true },
      friday: { start: '11:00', end: '17:00', available: true },
      saturday: { start: '', end: '', available: false },
      sunday: { start: '12:00', end: '16:00', available: true }
    }
  },
  {
    id: 5,
    name: 'Nataniel J',
    email: 'emma.r@university.edu',
    role: 'BESA',
    status: 'active',
    toursThisWeek: 6,
    totalTours: 89,
    officeHours: {
      monday: { start: '11:00', end: '19:00', available: true },
      tuesday: { start: '11:00', end: '19:00', available: true },
      wednesday: { start: '11:00', end: '19:00', available: true },
      thursday: { start: '11:00', end: '19:00', available: true },
      friday: { start: '11:00', end: '17:00', available: true },
      saturday: { start: '', end: '', available: false },
      sunday: { start: '12:00', end: '16:00', available: true }
    }
  }
];

export const mockBookings = [
  {
    id: 1,
    tourType: 'Campus Tour',
    date: '2024-01-15',
    time: '10:00 AM',
    attendees: 12,
    maxAttendees: 15,
    besa: 'Sarah Johnson',
    status: 'confirmed',
    contactName: 'Jennifer Davis',
    contactEmail: 'j.davis@email.com',
    contactPhone: '(555) 123-4567'
  },
  {
    id: 2,
    tourType: 'Academic Program Deep Dive',
    date: '2024-01-15',
    time: '2:00 PM',
    attendees: 6,
    maxAttendees: 8,
    besa: 'Michael Chen',
    status: 'confirmed',
    contactName: 'Robert Wilson',
    contactEmail: 'r.wilson@email.com',
    contactPhone: '(555) 987-6543'
  },
  {
    id: 3,
    tourType: 'Student Life Experience',
    date: '2024-01-16',
    time: '11:00 AM',
    attendees: 8,
    maxAttendees: 12,
    besa: 'Emma Rodriguez',
    status: 'pending',
    contactName: 'Lisa Anderson',
    contactEmail: 'l.anderson@email.com',
    contactPhone: '(555) 456-7890'
  }
];
