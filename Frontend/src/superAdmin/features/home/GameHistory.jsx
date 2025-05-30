import React from 'react'

function GameHistory() {
    const historyData = [
        {
            id: 1,
            gameName: "The Ultimate Challenge",
            admin: "Admin Name",
            completedOn: "14 Apr 2025",
            players: 8760,
            teams: 20
        },
        {
            id: 2,
            gameName: "Team Naming",
            admin: "Sarah Johnson",
            completedOn: "12 Apr 2025",
            players: 6542,
            teams: 15
        },
        {
            id: 3,
            gameName: "The Ultimate Challenge",
            admin: "Michael Chen",
            completedOn: "10 Apr 2025",
            players: 7235,
            teams: 18
        },
        {
            id: 4,
            gameName: "Team Naming",
            admin: "Jessica Williams",
            completedOn: "08 Apr 2025",
            players: 5124,
            teams: 12
        },
        {
            id: 5,
            gameName: "The Ultimate Challenge",
            admin: "Robert Davis",
            completedOn: "05 Apr 2025",
            players: 9320,
            teams: 22
        }
    ];
    
    return (
        <div className="space-y-0"> {/* Changed to space-y-0 to remove gap between rows */}
            {/* Header Row */}
            <div className='grid grid-cols-5 gap-4 text-[12px]  rounded-lg  items-center px-4 text-gray-400'>
                <div className="flex items-center justify-center">Game Name</div>
                <div className="flex items-center justify-center">Admin</div>
                <div className="flex items-center justify-center">Completed On</div>
                <div className="flex items-center justify-center">Players</div>
                <div className="flex items-center justify-center">Teams</div>
            </div>
            
            {/* Data Rows */}
            {historyData.map((item, index) => (
                <div 
                    key={item.id} 
                    className={`grid grid-cols-5 gap-4 h-16 items-center px-4 font-sans ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'  // Alternating row colors
                    }`}
                >
                    <div className="flex items-center justify-center text-gray-600 text-[14px]">{item.gameName}</div>
                    <div className="flex items-center justify-center text-gray-600 text-[14px]">{item.admin}</div>
                    <div className="flex items-center justify-center text-gray-600 text-[14px]">{item.completedOn}</div>
                    <div className="flex items-center justify-center text-gray-600 text-[14px]">{item.players.toLocaleString()}</div>
                    <div className="flex items-center justify-center text-gray-600 text-[14px]">{item.teams}</div>
                </div>
            ))}
        </div>
    )
}

export default GameHistory