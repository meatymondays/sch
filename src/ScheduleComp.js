import { GoogleOAuthProvider } from "@react-oauth/google";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { useEffect, useState } from "react";
import Confetti from "react-confetti";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const timeSlots = ["Early AM", "Morning AM", "Afternoon PM", "Late PM"];
const programs = [
  {
    name: "VM2",
    fullName: "VM Fitness 2.0 (Home Edition)",
    description: "12 week strength, fitness and yoga programme",
    image: "/images1/vm2.png",
    color: "bg-gray-200",
  },
  {
    name: "VM Sculpt",
    fullName: "Vertue Method Gym (Sculpt)",
    description: "12 week strength, fitness and yoga programme",
    image: "/images1/sculpt.png",
    color: "bg-pink-200",
  },
  {
    name: "VM Stretch",
    fullName: "Vertue Method 2",
    description:
      "30-35 minute workouts with a choice of 3-6 days training per week",
    image: "/images1/stretch.png",
    color: "bg-beige-200",
  },
  {
    name: "Other",
    fullName: "Custom Workout",
    description: "Create your own custom workout plan",
    image: "/images1/biceps.png",
    color: "bg-blue-200",
  },
];

const ProgramItem = ({ program, onClick, isSelected, status, isMobile }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "program",
    item: { name: program.name },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      onClick={() => onClick(program.name)}
      className={`flex-shrink-0 ${
        isMobile ? "w-1/4" : "w-40 h-48"
      } text-left rounded-xl overflow-hidden shadow-md ${
        isMobile ? "mr-2" : "mr-4"
      } ${program.color} ${isDragging ? "opacity-50" : "opacity-100"} ${
        isSelected ? "ring-2 ring-red-500" : ""
      }`}
      style={{ touchAction: "none" }}
    >
      <div
        className={`p-2 ${
          isMobile ? "" : "h-full"
        } flex flex-col justify-between`}
      >
        <div>
          <div className="bg-white rounded-lg mb-1">
            <img
              src={program.image}
              alt={program.name}
              className={`w-full ${isMobile ? "h-12" : "h-20"} object-contain`}
            />
          </div>
          <h3 className="font-bold text-xs mb-1">{program.name}</h3>
          {!isMobile && (
            <p className="text-xs text-gray-600 mb-1 h-8 overflow-hidden">
              {program.description}
            </p>
          )}
        </div>
        {!isMobile && (
          <span
            className={`${
              status === "STARTED" ? "bg-green-500" : "bg-green-800"
            } text-white text-xs px-2 py-1 rounded-full self-start`}
          >
            {status || "NOT STARTED"}
          </span>
        )}
      </div>
    </div>
  );
};

const CalendarSlot = ({ day, slot, program, onDrop, onClick, isMobile }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "program",
    drop: (item) => onDrop(day, slot, item.name),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={isMobile ? null : drop}
      onClick={() => isMobile && onClick(day, slot)}
      className={`p-1 text-xs border-b last:border-b-0 cursor-pointer ${
        isOver ? "bg-green-100" : program ? "bg-green-200" : "hover:bg-gray-100"
      }`}
    >
      {program || <span className="text-gray-400">{slot}</span>}
    </div>
  );
};

const ProgramCarousel = ({
  programs,
  handleProgramClick,
  programStatus,
  selectedProgram,
  isMobile,
}) => {
  return (
    <div
      className={`program-carousel-container ${
        isMobile ? "overflow-x-auto" : ""
      }`}
    >
      <div
        className={`program-carousel flex flex-row ${
          isMobile ? "flex-nowrap" : "flex-wrap"
        } w-full`}
      >
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
  const [calendar, setCalendar] = useState({});
  const [currentWeek, setCurrentWeek] = useState(0);
  const [programStatus, setProgramStatus] = useState({});
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [weeklyCalendars, setWeeklyCalendars] = useState({});
  const [isMobile, setIsMobile] = useState(false);
  const [name, setName] = useState("Shona");
  const [isEditing, setIsEditing] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const login = async () => {
    try {
      const response = await fetch("/api/auth/google", {
        method: "GET",
        credentials: "include",
      });

      console.log({ response });

      if (!response.ok) {
        throw new Error(
          `Failed to initiate Google login: ${response.status} ${response.statusText}`
        );
      }

      // Handle the response from your API endpoint
    } catch (error) {
      console.error("Error initiating Google login:", error);
      alert(`Failed to start Google login. Error: ${error.message}`);
    }
  };

  // const login = useGoogleLogin ({
  //   onSuccess: async (tokenResponse) => {
  //     try {
  //       console.log('Token response:', tokenResponse);
  //       const response = await fetch('/api/auth/google', {
  //         method: 'GET',
  //         credentials: 'include',
  //       });

  //       console.log('Response status:', response.status);
  //       const responseText = await response.text();
  //       console.log('Response text:', responseText);

  //       if (!response.ok) {
  //         throw new Error(`Failed to initiate Google login: ${response.status} ${responseText}`);
  //       }

  //       console.log('Redirecting to Google login...');
  //     } catch (error) {
  //       console.error('Error initiating Google login:', error);
  //       alert(`Failed to start Google login. Error: ${error.message}`);
  //     }
  //   },
  //   onError: (error) => {
  //     console.error('Google Login Error:', error);
  //     alert(`Google Login Error: ${error.message}`);
  //   },
  //   flow: 'auth-code',
  // });

  const handleNameClick = () => {
    setIsEditing(true);
  };

  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  const handleNameBlur = () => {
    setIsEditing(false);
  };

  const handleNameKeyDown = (e) => {
    if (e.key === "Enter") {
      setIsEditing(false);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    }
  };

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
      [programName]:
        prev[programName] === "STARTED" ? "NOT STARTED" : "STARTED",
    }));
  };

  const renderCalendar = () => (
    <div className="mt-4 bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <ChevronLeft
          className="text-gray-500 cursor-pointer hover:text-gray-700 transition-colors duration-200"
          onClick={() => {
            setCurrentWeek((prev) => {
              const newWeek = prev - 1;
              setCalendar(weeklyCalendars[newWeek] || {});
              return newWeek;
            });
          }}
        />
        <h2 className="text-xl font-bold">Week {currentWeek + 1}</h2>
        <ChevronRight
          className="text-gray-500 cursor-pointer hover:text-gray-700 transition-colors duration-200"
          onClick={() => {
            setCurrentWeek((prev) => {
              const newWeek = prev + 1;
              setCalendar(weeklyCalendars[newWeek] || {});
              return newWeek;
            });
          }}
        />
      </div>
      <div className="hidden md:grid md:grid-cols-7 gap-2">
        {days.map((day) => (
          <div
            key={day}
            className="text-center font-medium text-gray-700 text-sm"
          >
            {day}
          </div>
        ))}
        {days.map((day) => (
          <div
            key={day}
            className="border rounded-lg overflow-hidden shadow-sm"
          >
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
          <div
            key={day}
            className="bg-white rounded-lg shadow-sm overflow-hidden"
          >
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
  );

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="max-w-7xl mx-auto bg-gray-100 min-h-screen flex flex-col">
        <div className="relative h-60 sm:h-80">
          <img
            src="/images1/hero.jpg'"
            alt="Hero"
            className="w-full h-full object-cover"
          />
          <div
            className="absolute inset-0 flex flex-col justify-center items-center text-white"
            style={{
              backgroundImage: "url('/images1/hero.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              height: "100%",
            }}
          >
            <div className="bg-gray-500 bg-opacity-50 w-full h-full flex items-center justify-center">
              <h1 className="text-4xl sm:text-6xl font-bold font-serif italic text-center">
                MAKE A CHANGE
              </h1>
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
            <p className="text-sm sm:text-xl text-white mt-2">Welcome back</p>
          </div>
        </div>
        <div className="flex-1 p-6 space-y-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
            PLAN YOUR WEEK
          </h2>
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
            className="relative flex items-center justify-center px-4 py-2 border border-transparent rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow duration-300"
          >
            <div className="absolute inset-0 rounded-lg bg-gray-200 opacity-50"></div>
            <div className="relative flex items-center">
              <div className="mr-3">
                <svg
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 48 48"
                  className="w-6 h-6"
                >
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  ></path>
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  ></path>
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  ></path>
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  ></path>
                  <path fill="none" d="M0 0h48v48H0z"></path>
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-800">
                Continue with Google
              </span>
            </div>
          </button>
        </div>
        {showConfetti && <Confetti />}
      </div>
    </DndProvider>
  );
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
          Privacy Policy and Terms of Service
        </a>
      </div>
    </GoogleOAuthProvider>
  );
}
