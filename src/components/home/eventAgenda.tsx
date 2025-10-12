import React from 'react'

function EventAgenda() {
  const Agenda = [
  {
  day: "Day 1 : The Start",
  dayTitle: "Kickoff",
  events: [
    { time: "10:00 AM", title: "Opening Ceremony", location: "Main Hall" },
    { time: "10:30 AM", title: "Welcome Address & Introduction", location: "Main Hall" },
    { time: "11:00 AM", title: "Keynote: Future of Robotics", location: "Conference Room A" },
    { time: "12:00 PM", title: "Networking Break", location: "Lounge Area" },
    { time: "1:00 PM", title: "Workshop: Autonomous Systems", location: "Lab 1" },
    { time: "3:00 PM", title: "Team Registrations & Kit Distribution", location: "Registration Desk" },
    { time: "4:00 PM", title: "Tech Talk: AI in Robotics", location: "Conference Room B" },
    { time: "5:30 PM", title: "Demo: Line-Following Robot", location: "Arena 1" },
    { time: "6:30 PM", title: "Day Wrap-up & Announcements", location: "Main Hall" },
  ],
  },
  {
  day: "Day 2 : The Challenge",
  dayTitle: "Main Day",

  events: [
    { time: "10:00 AM", title: "Competition Round 1: Obstacle Challenge", location: "Arena 2" },
    { time: "12:00 PM", title: "Lunch Break", location: "Food Court" },
    { time: "1:00 PM", title: "Seminar: Robotics in Industry 5.0", location: "Conference Room A" },
    { time: "2:30 PM", title: "Hands-on: Sensor Calibration", location: "Lab 2" },
    { time: "4:00 PM", title: "Coding Sprint: Robot Control Algorithms", location: "Lab 3" },
    { time: "5:30 PM", title: "Networking Session with Experts", location: "Lounge Area" },
    { time: "6:30 PM", title: "Daily Highlights & Updates", location: "Main Hall" },
  ],
  },
  {
  day: "Day 3 : The Finale",
  dayTitle: "Finale",
  events: [
    { time: "10:00 AM", title: "Final Round: Autonomous Arena", location: "Arena 3" },
    { time: "12:00 PM", title: "Lunch Break", location: "Food Court" },
    { time: "1:00 PM", title: "Tech Expo: Student Innovations", location: "Exhibition Hall" },
    { time: "3:00 PM", title: "Judges Evaluation & Feedback", location: "Conference Room B" },
    { time: "4:00 PM", title: "Award Ceremony", location: "Main Hall" },
    { time: "5:00 PM", title: "Photo Session & Press Interaction", location: "Media Zone" },
    { time: "6:00 PM", title: "Closing Remarks & Farewell", location: "Main Hall" },
  ],
  },
];

  return (
  <div className="relative bg-black min-h-screen w-screen flex flex-col tracking-tighter">
      <div className="relative mx-4 mt-18 h-20 w-60 text-2xl flex items-center justify-center gap-6">
        <span className="text-transparent bg-neutral-300 h-1 w-12">..........</span>
        <span className="text-white flex items-center justify-center">Event Agenda</span>
      </div>

    <div className="m-12 h-40 w-[70vw] text-7xl font-bricolage">
      <span className="text-white">
        Discover the complete
        <br />
        <span className="text-neutral-500">Event Agenda</span>
      </span>
    </div>

    {/* Agenda Content */}
    <div className="mx-12 mb-12 space-y-8">
    {Agenda.map((dayAgenda) => (
      <div key={dayAgenda.day} className="p-6 flex justify-items-center flex-col">
        <div className='bg-neutral-900/40 flex items-center justify-baseline gap-18 backdrop-blur-md rounded-2xl mb-6 border'>
          <span className='bg-blue-600 w-1/7 rounded-l-2xl flex items-center justify-center px-4 pt-3'>
            <h2 className="text-3xl font-bold text-white mb-4 p-2">{dayAgenda.dayTitle}</h2>
          </span>
          <span className='flex items-center pt-3'>
            <h2 className="text-3xl font-bold text-white mb-4 ">{dayAgenda.day}</h2>
          </span>
        </div>

      <div className="space-y-3">
        {dayAgenda.events.map((event, index) => (
        <div key={index} className="flex items-start justify-center gap-4 p-3 rounded-md">
          <span className="text-neutral-400 font-semibold min-w-[100px] text-2xl pt-6">{event.time}</span>
          <div className="flex-1">
            <div className='bg-transparent backdrop-blur-xl rounded-xl border-2 border-neutral-200 p-7'>
              <h3 className="text-white font-semibold text-xl">{event.title}</h3>
              <p className="text-neutral-500 text-md">{event.location}</p>
            </div>
          </div>
        </div>
        ))}
      </div>
      </div>
    ))}
    </div>
  </div>
  )
}

export default EventAgenda
