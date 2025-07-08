const TheUltimateChallenge = require("../../../theUltimateChallenge/models/TheUltimateChallenge")
const Player = require("../../../theUltimateChallenge/models/playerSchema")

const handleGetAllLiveGames = async (req, res) => {
    try {
        const allGames = await TheUltimateChallenge.find({ sessionEnded: false }).sort({ createdAt: -1 })

        if (!allGames || allGames.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No live games found"
            });
        }


        // For each game find the number of players in each session
        const gamesWithPlayerCount = await Promise.all(allGames.map(async (game) => {
            const playerCount = await Player.find({ session: game._id })
                .countDocuments();

            let playerGameLink;
            let adminGameLink;
            if (game.teamFormationGame) {
                const teamFormationSessionId = game.teamFormationSessionId;
                playerGameLink = `${process.env.TEAM_FORMATION_LINK}/user/${teamFormationSessionId}/login`;
                adminGameLink = `${process.env.TEAM_FORMATION_LINK}/admin/${teamFormationSessionId}/login`;
            }
            else {
                playerGameLink = `${process.env.FRONTEND_URL}/theultimatechallenge/login/${game._id.toString()}`;
                adminGameLink = `${process.env.FRONTEND_URL}/admin/${game._id.toString()}/login`;
            }

            return {
                ...game.toObject(),
                playerCount,
                playerGameLink,
                adminGameLink
            };
        }
        ));

        return res.json({
            success: true,
            data: gamesWithPlayerCount
        })
    } catch (error) {
        console.error("Error fetching live games:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}


const handleGetGameHistory = async (req, res) => {
    try {
        const allGames = await TheUltimateChallenge.find({ sessionEnded: true }).sort({ completionDate: -1 }).select('companyName admin createdAt completionDate numberOfPlayersJoined numberOfTeamsJoined');

        if (!allGames || allGames.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No game history found"
            });
        }

        return res.json({
            success: true,
            data: allGames
        });
    }
    catch (error) {
        console.error("Error fetching game history:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }

}


module.exports = {
    handleGetGameHistory,
    handleGetAllLiveGames
};