import React, { useState } from "react";
import { Pencil, Lock, Eye } from "lucide-react"; // Optional icons
import mockData from "./mockData"

function Table() {
  const [dummyData,setDummyData] = useState(mockData) 

  return (
    <div className="w-[70%] overflow-x-auto font-sans">
      <table className="w-full  border-collapse">
        <thead>
          <tr className=" text-center">
            {["Team Id", "Players", "Progress", "Score"].map((title) => (
              <th key={title} className="h-12">
                <div className="flex justify-center items-center text-[12px] text-[#111111]/50">{title}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dummyData.map((team) => (
            <tr key={team.id} className="even:bg-gray-50 text-center rounded-2xl ">
              <td>
                <div className="flex justify-center items-center h-16 rounded-l-2xl text-[14px]">{team.id}</div>
              </td>
              <td>
                <div className="flex justify-center items-center h-16 text-[14px]">{team.players}</div>
              </td>
              <td>
                <div className="flex flex-col items-center justify-center space-y-1 h-full py-2">
                  {team.progress.map((p) => (
                    <div key={p.label} className="flex items-center space-x-2 text-[14px]">
                      <span className="text-[14px]">{p.label}</span>
                      <div className="w-24 h-2.5 bg-gray-200 rounded-full relative">
                        <div
                          className={`h-2.5 ${p.color} rounded-full`}
                          style={{ width: `${(p.value / p.total) * 100}%` }}
                        />
                      </div>
                      <span className="text-[14px]">{`${p.value}/${p.total}`}</span>
                    </div>
                  ))}
                </div>
              </td>
              <td>
                <div className="flex justify-center items-center h-16 text-[14px]">
                  {team.score.toLocaleString()}
                </div>
              </td>
              
              
               
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
