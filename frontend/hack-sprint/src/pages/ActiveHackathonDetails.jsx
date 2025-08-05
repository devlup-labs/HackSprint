import { useLocation } from "react-router-dom";
import { FaUsers, FaTrophy } from "react-icons/fa";


export default function HackathonDetails() {
  const { state: hackathon } = useLocation();

  if (!hackathon)
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#101622] text-[#ff164a] font-mono text-2xl">
        Hackathon not found.
      </div>
    );

  const isActive = hackathon.status;
  return (
    <div className="min-h-screen bg-[#101622] font-mono text-white flex flex-col items-center px-6 py-10">
      <div className="w-full max-w-3xl bg-[#161d2c] rounded-xl shadow-lg border border-[#16ff66]/30 p-8">
        <div>
          <h1 className="text-4xl font-bold text-[#16ff66] tracking-widest mb-1 drop-shadow-[0_0_12px_#16ff66cc]">
            {hackathon.title}
          </h1>
          <h2 className="text-lg text-[#20e6fc] mb-4 italic">{hackathon.subTitle}</h2>
        </div>

        <div className="flex items-center space-x-4 mb-4">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              isActive
                ? "bg-[#17f6541c] text-[#16ff66] border border-[#16ff66]"
                : "bg-[#ff164a21] text-[#ff164a] border border-[#ff164a]"
            }`}
          >
            {isActive ? "Active" : "Expired"}
          </span>
          <span className="flex items-center gap-x-2 text-[#16ff66]">
            ⏰ {hackathon.endDate}
          </span>
        </div>

        <div className="mb-6">
          <div className="text-[#e7ffd6]">{hackathon.description}</div>
        </div>

        <div className="mb-4 flex gap-4 items-center justify-start">
          <span className="block text-[#20e6fc] text-xs mb-1">Category:</span>
          <div className="inline-block px-3 rounded-full bg-blue-600 text-blue-200 font-bold text-sm w-max">
            {hackathon.category}
          </div>
        </div>


        <div className="mb-4 flex flex-wrap gap-2">
          {hackathon.techStack.map((tech, index) => (
            <span
              key={index}
              className="bg-gray-700/50 text-gray-300 text-xs px-2 py-1 rounded"
            >
              {tech}
            </span>
          ))}
        </div>

        <div className="mb-4 flex gap-4 items-center justify-start">
          <span className="block text-[#20e6fc] text-xs mb-1">Difficulty:</span>
          <div className="inline-block px-3 rounded-full bg-green-600 text-green-200 font-bold text-sm w-max">
            {hackathon.difficulty}
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-1 text-gray-500">
            <FaUsers size={14} className="text-gray-500" />
            <span>{hackathon.participants} participants</span>
          </div>
          <div className="flex items-center gap-1 text-gray-500">
            <FaTrophy size={14} className="text-gray-500" />
            <span>{hackathon.prize}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <div>
            <span className="block text-[#20e6fc] text-xs">Start Date:</span>
            <span className="font-bold text-[#16ff66]">{hackathon.startDate}</span>
          </div>
          <div>
            <span className="block text-[#20e6fc] text-xs">End Date:</span>
            <span className="font-bold text-[#16ff66]">{hackathon.endDate}</span>
          </div>
        </div>

        <div className="mb-4">
          <span className="block text-[#20e6fc] text-xs mb-1">Total Submissions:</span>
          <span className="font-bold text-[#16ff66]">{hackathon.submissions?.length || 0}</span>
        </div>

        <div className="mb-6">
          <span className="block text-[#20e6fc] text-xs mb-2">Progress:</span>
          <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all ease-in-out duration-500"
              style={{ width: `${hackathon.progress}%` }}
            />
          </div>
          <span className="text-[#16ff66] font-mono text-xs mt-1 block">{hackathon.progress}%</span>
        </div>

        <div className="mt-8 text-center">
          {isActive ? (
            <button className="bg-[#16ff66] text-[#101622] rounded-md px-8 py-2 text-lg shadow-[0_0_12px_2px_rgba(22,255,102,0.7)] font-bold hover:bg-[#1bff84] transition">
              Register Now
            </button>
          ) : (
            <button
              className="bg-[#ff164a] text-white rounded-md px-8 py-2 text-lg font-bold cursor-not-allowed"
              disabled
            >
              Registration Closed
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
