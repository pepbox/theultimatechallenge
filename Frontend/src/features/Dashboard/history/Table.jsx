import React, { useState } from "react";


const mockData = [
  { id: "12345", date: "20/04/2025", total: 20, rounds: 2 },
  { id: "12345", date: "20/04/2025", total: 20, rounds: 2 },
  { id: "12345", date: "20/04/2025", total: 20, rounds: 2 },
  { id: "12345", date: "20/04/2025", total: 20, rounds: 2 },
  { id: "12345", date: "20/04/2025", total: 20, rounds: 2 },
  { id: "12345", date: "20/04/2025", total: 20, rounds: 2 },
  { id: "12345", date: "20/04/2025", total: 20, rounds: 2 },
  { id: "12345", date: "20/04/2025", total: 20, rounds: 2 },
  { id: "12345", date: "20/04/2025", total: 20, rounds: 2 },
  { id: "12345", date: "20/04/2025", total: 20, rounds: 2 }
];

function Table() {
  const [data, setData] = useState(mockData);
  
  return (
    <div className="w-full overflow-x-auto font-sans">
      <div className="min-w-[600px] w-[95%] md:w-[80%] mx-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-gray-500 text-sm font-normal h-[40px]">
              <th className="text-center">Game ID / Name</th>
              <th className="text-center">Date & Time</th>
              <th className="text-center">Total Teams</th>
              <th className="text-center">Total Rounds Played</th>
              <th className="text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} style={{ height: '68px' }}>
                <td className="text-center text-[13px] md:text-[14px]">{item.id}</td>
                <td className="text-center text-[13px] md:text-[14px]">{item.date}</td>
                <td className="text-center text-[13px] md:text-[14px]">{item.total}</td>
                <td className="text-center text-[13px] md:text-[14px]">{item.rounds}</td>
                <td className="text-center text-[13px] md:text-[14px]">
                  <button className="border border-gray-400 rounded-[8px] w-[110px] md:w-[150px] h-[34px] md:h-[38px] text-[13px] md:text-[14px] hover:bg-gray-100 transition-colors">
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Table;