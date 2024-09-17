import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import Confetti from 'react-confetti'

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const timeSlots = ['Early AM', 'Morning AM', 'Afternoon PM', 'Late PM']
const programs = [
  {
    name: 'VM2',
    fullName: 'VM Fitness 2.0 (Home Edition)',
    description: '12 week strength, fitness and yoga programme',
    image: '/images1/vm2.png',
    color: 'bg-gray-200',
  },
  {
    name: 'VM Sculpt',
    fullName: 'Vertue Method Gym (Sculpt)',
    description: '12 week strength, fitness and yoga programme',
    image: '/images1/sculpt.png',
    color: 'bg-pink-200',
  },
  {
    name: 'VM Stretch',
    fullName: 'Vertue Method 2',
    description: '30-35 minute workouts with a choice of 3-6 days training per week',
    image: '/images1/stretch.png',
    color: 'bg-beige-200',
  },
  {
    name: 'Other',
    fullName: 'Custom Workout',
    description: 'Create your own custom workout plan',
    image: '/images1/biceps.png',
    color: 'bg-blue-200',
  },
]

const ProgramItem = ({ program, onClick, isSelected, status, isMobile }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'program',
    item: { name: program.name },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }))

  return (
    <div
      ref={drag}
      onClick={() => onClick(program.name)}
      className={`flex-shrink-0 ${isMobile ? 'w-1/4' : 'w-40 h-48'} text-left rounded-xl overflow-hidden shadow-md ${isMobile ? 'mr-2' : 'mr-4'} ${program.color} ${
        isDragging ? 'opacity-50' : 'opacity-100'
      } ${isSelected ? 'ring-2 ring-red-500' : ''}`}
      style={{ touchAction: 'none' }}
    >
      <div className={`p-2 ${isMobile ? '' : 'h-full'} flex flex-col justify-between`}>
        <div>
          <div className="bg-white rounded-lg mb-1">
            <img
              src={program.image}
              alt={program.name}
              className={`w-full ${isMobile ? 'h-12' : 'h-20'} object-contain`}
            />
          </div>
          <h3 className="font-bold text-xs mb-1">{program.name}</h3>
          {!isMobile && <p className="text-xs text-gray-600 mb-1 h-8 overflow-hidden">{program.description}</p>}
        </div>
        {!isMobile && (
          <span className={`${status === 'STARTED' ? 'bg-green-500' : 'bg-green-800'} text-white text-xs px-2 py-1 rounded-full self-start`}>
            {status || 'NOT STARTED'}
          </span>
        )}
      </div>
    </div>
  )
}

const CalendarSlot = ({ day, slot, program, onDrop, onClick, isMobile }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'program',
    drop: (item) => onDrop(day, slot, item.name),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }))

  return (
    <div
      ref={isMobile ? null : drop}
      onClick={() => isMobile && onClick(day, slot)}
      className={`p-1 text-xs border-b last:border-b-0 cursor-pointer ${
        isOver ? 'bg-green-100' : program ? 'bg-green-200' : 'hover:bg-gray-100'
      }`}
    >
      {program || <span className="text-gray-400">{slot}</span>}
    </div>
  )
}

const ProgramCarousel = ({ programs, handleProgramClick, programStatus, selectedProgram, isMobile }) => {
  return (
    <div className={`program-carousel-container ${isMobile ? 'overflow-x-auto' : ''}`}>
      <div className={`program-carousel flex flex-row ${isMobile ? 'flex-nowrap' : 'flex-wrap'} w-full`}>
        {programs.map((program) => (
          <ProgramItem
            key={program.name}
            program={program}
            onClick={handleProgramClick}
            isSelected={selectedProgram === program.name}
            status={programStatus[program.name]}
            isMobile={isMobile}
          />
        ))}
      </div>
    </div>
  );
};

function VertueMethodCalendar() {
  const [calendar, setCalendar] = useState({})
  const [currentWeek, setCurrentWeek] = useState(0)
  const [user, setUser] = useState(null)
  const [programStatus, setProgramStatus] = useState({})
  const [selectedProgram, setSelectedProgram] = useState(null)
  const [weeklyCalendars, setWeeklyCalendars] = useState({})
  const [isMobile, setIsMobile] = useState(false)
  const [name, setName] = useState('Shona')
  const [isEditing, setIsEditing] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      await sendCalendarInvite(tokenResponse.access_token);
    },
    scope: 'https://www.googleapis.com/auth/calendar.events',
  });

  const sendCalendarInvite = async (accessToken) => {
    if (!accessToken) {
      console.error('No access token available');
      return;
    }

    await window.gapi.load('client', async () => {
      window.gapi.client.setToken({ access_token: accessToken });
      window.gapi.client.load('calendar', 'v3', async () => {
        const events = createEventObjects();
        for (const event of events) {
          try {
            const response = await window.gapi.client.calendar.events.insert({
              calendarId: 'primary',
              resource: event,
            });
            console.log('Event created:', response.result);
          } catch (error) {
            console.error('Error creating event:', error);
          }
        }
        alert('Calendar invites sent!');
      });
    });
  };

  const createEventObjects = () => {
    const currentDate = new Date()
    const startOfWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 1))

    return Object.entries(calendar).flatMap(([day, slots]) => 
      Object.entries(slots).map(([slot, programName]) => {
        if (!programName) return null

        const program = programs.find(p => p.name === programName)
        if (!program) return null

        const dayIndex = days.indexOf(day)
        const eventDate = new Date(startOfWeek)
        eventDate.setDate(eventDate.getDate() + dayIndex)

        const startTime = getTimeFromSlot(slot, true)
        const endTime = getTimeFromSlot(slot, false)

        return {
          'summary': program.fullName,
          'description': program.description,
          'start': {
            'dateTime': `${eventDate.toISOString().split('T')[0]}T${startTime}:00`,
            'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone
          },
          'end': {
            'dateTime': `${eventDate.toISOString().split('T')[0]}T${endTime}:00`,
            'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone
          }
        }
      }).filter(Boolean)
    )
  }

  const getTimeFromSlot = (slot, isStart) => {
    switch(slot) {
      case 'Early AM': return isStart ? '06:00' : '08:00'
      case 'Morning AM': return isStart ? '09:00' : '11:00'
      case 'Afternoon PM': return isStart ? '14:00' : '16:00'
      case 'Late PM': return isStart ? '18:00' : '20:00'
      default: return isStart ? '12:00' : '13:00'
    }
  }

  const handleNameClick = () => {
    setIsEditing(true)
  }

  const handleNameChange = (e) => {
    setName(e.target.value)
  }

  const handleNameBlur = () => {
    setIsEditing(false)
  }

  const handleNameKeyDown = (e) => {
    if (e.key === 'Enter') {
      setIsEditing(false)
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 5000)
    }
  }

  const handleDrop = (day, slot, programName) => {
    setCalendar((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [slot]: programName,
      },
    }));
    setWeeklyCalendars((prev) => ({
      ...prev,
      [currentWeek]: {
        ...prev[currentWeek],
        [day]: {
          ...(prev[currentWeek]?.[day] || {}),
          [slot]: programName,
        },
      },
    }));
  };

  const handleSlotClick = (day, slot) => {
    if (selectedProgram) {
      handleDrop(day, slot, selectedProgram);
    }
  };

  const handleProgramClick = (programName) => {
    setSelectedProgram(programName);
    setProgramStatus((prev) => ({
      ...prev,
      [programName]: prev[programName] === 'STARTED' ? 'NOT STARTED' : 'STARTED',
    }));
  };

  const renderCalendar = () => (
    <div className="mt-4 bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <ChevronLeft
          className="text-gray-500 cursor-pointer hover:text-gray-700 transition-colors duration-200"
          onClick={() => {
            setCurrentWeek((prev) => {
              const newWeek = prev - 1
              setCalendar(weeklyCalendars[newWeek] || {})
              return newWeek
            })
          }}
        />
        <h2 className="text-xl font-bold">Week {currentWeek + 1}</h2>
        <ChevronRight
          className="text-gray-500 cursor-pointer hover:text-gray-700 transition-colors duration-200"
          onClick={() => {
            setCurrentWeek((prev) => {
              const newWeek = prev + 1
              setCalendar(weeklyCalendars[newWeek] || {})
              return newWeek
            })
          }}
        />
      </div>
      <div className="hidden md:grid md:grid-cols-7 gap-2">
        {days.map((day) => (
          <div key={day} className="text-center font-medium text-gray-700 text-sm">
            {day}
          </div>
        ))}
        {days.map((day) => (
          <div key={day} className="border rounded-lg overflow-hidden shadow-sm">
            {timeSlots.map((slot) => (
              <CalendarSlot
                key={slot}
                day={day}
                slot={slot}
                program={calendar[day]?.[slot]}
                onDrop={handleDrop}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="md:hidden space-y-4">
        {days.map((day) => (
          <div key={day} className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="text-center font-medium text-gray-700 text-lg py-2 bg-gray-100">
              {day}
            </div>
            <div className="border-t">
              {timeSlots.map((slot) => (
                <CalendarSlot
                  key={slot}
                  day={day}
                  slot={slot}
                  program={calendar[day]?.[slot]}
                  onClick={handleSlotClick}
                  isMobile={true}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="max-w-7xl mx-auto bg-gray-100 min-h-screen flex flex-col">
        <div className="relative h-60 sm:h-80">
          <img
            src="/images1/hero.jpg'"
            alt="Hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex flex-col justify-center items-center text-white" style={{backgroundImage: "url('/images1/hero.jpg')", backgroundSize: 'cover', backgroundPosition: 'center', height: '100%'}}>
            <div className="bg-gray-500 bg-opacity-50 w-full h-full flex items-center justify-center">
              <h1 className="text-4xl sm:text-6xl font-bold font-serif italic text-center">MAKE A CHANGE</h1>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 p-4 flex flex-col items-start">
            <h2 className="text-xl sm:text-3xl font-bold mb-1 text-white flex items-end">
              <span>Hello</span>
              <span className="inline-block min-w-[100px] h-[1.5em] relative ml-2">
                {isEditing ? (
                  <input
                    type="text"
                    value={name}
                    onChange={handleNameChange}
                    onBlur={handleNameBlur}
                    onKeyDown={handleNameKeyDown}
                    className="bg-transparent border-b border-white text-red-500 focus:outline-none w-full absolute bottom-0 left-0"
                    autoFocus
                  />
                ) : (
                  <span
                    className="text-red-500 cursor-pointer animate-pulse absolute bottom-0 left-0"
                    onClick={handleNameClick}
                  >
                    {name}
                  </span>
                )}
              </span>
            </h2>
            <p className="text-sm sm:text-xl text-white mt-2">Welcome back - set your workout, sign in and email yourself an invite!</p>
          </div>
        </div>
        <div className="flex-1 p-6 space-y-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">PLAN YOUR WEEK</h2>
          <div className="bg-white rounded-lg shadow-md p-4">
            <ProgramCarousel
              programs={programs}
              handleProgramClick={handleProgramClick}
              programStatus={programStatus}
              selectedProgram={selectedProgram}
              isMobile={isMobile}
            />
          </div>
          <div className="h-[calc(100vh-450px)] overflow-y-auto md:h-auto">
            {renderCalendar()}
          </div>
        </div>
        <div className="p-4 border-t border-gray-200 mt-4">
          <button
            onClick={() => login()}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-full hover:bg-blue-600 transition duration-200"
          >
            Send Calendar Invite
          </button>
        </div>
        {showConfetti && <Confetti />}
      </div>
    </DndProvider>
  )
}

export default function Component() {
  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <VertueMethodCalendar />
      <div className="text-center mt-4">
        <a
          href="https://shonavertue.com/en-au/policies/privacy-policy"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-gray-600 hover:text-gray-800 underline"
        >
          Privacy Policy
        </a>
      </div>
    </GoogleOAuthProvider>
  )
}