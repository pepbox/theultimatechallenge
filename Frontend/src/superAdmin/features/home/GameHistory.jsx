import React from "react";

function GameHistory({ data = [] }) {
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full min-w-[800px] bg-white rounded-lg overflow-hidden shadow-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Game Name
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Admin
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created On
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Completed On
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Players
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Teams
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.length > 0 ? (
            data.map((item, index) => (
              <tr
                key={item.id}
                className={`hover:bg-gray-50 transition-colors ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-25"
                }`}
              >
                <td className="px-4 py-4 text-sm text-gray-900 font-medium">
                  {item.companyName}
                </td>
                <td className="px-4 py-4 text-sm text-gray-600 text-center">
                  {item.admin}
                </td>
                <td className="px-4 py-4 text-sm text-gray-600 text-center">
                  {new Date(item.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </td>
                <td className="px-4 py-4 text-sm text-gray-600 text-center">
                  {item.completionDate ? (
                    new Date(item.completionDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  ) : (
                    <span className="text-gray-400 italic">Ongoing</span>
                  )}
                </td>
                <td className="px-4 py-4 text-sm text-gray-600 text-center">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {item.numberOfPlayersJoined}
                  </span>
                </td>
                <td className="px-4 py-4 text-sm text-gray-600 text-center">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {item.numberOfTeamsJoined}
                  </span>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                No games found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Mobile Card View - Shows on smaller screens */}
      <div className="block md:hidden space-y-4">
        {data.length > 0 ? (
          data.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-medium text-gray-900 text-sm">
                  {item.companyName}
                </h3>
                <div className="flex space-x-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {item.numberOfPlayersJoined} players
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {item.numberOfTeamsJoined} teams
                  </span>
                </div>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span className="font-medium">Admin:</span>
                  <span>{item.admin}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Created:</span>
                  <span>
                    {new Date(item.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Completed:</span>
                  <span>
                    {item.completionDate ? (
                      new Date(item.completionDate).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }
                      )
                    ) : (
                      <span className="text-gray-400 italic">Ongoing</span>
                    )}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
            No games found
          </div>
        )}
      </div>
    </div>
  );
}
export default GameHistory;