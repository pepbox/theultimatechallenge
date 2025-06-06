const TheUltimateChallenge = require("../../../theUltimateChallenge/models/TheUltimateChallenge")
const Player = require("../../../theUltimateChallenge/models/playerSchema")

const handleGetAllLiveGames = async (req,res) => {
    try {
        const allGames = await TheUltimateChallenge.find({ sessionEnded: false }).sort({ createdAt: -1 })

        console.log("All live games fetched:", allGames);
        if( !allGames || allGames.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No live games found"
            });
        }

        // For each game find the number of players in each session
        const gamesWithPlayerCount = await Promise.all(allGames.map(async (game) => {
            const playerCount = await Player.find({ session: game._id })
                .countDocuments();
            return {
                ...game.toObject(),
                playerCount
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



module.exports = {
    handleGetAllLiveGames
};