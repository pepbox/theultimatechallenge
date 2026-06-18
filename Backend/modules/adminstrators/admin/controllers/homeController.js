const Team = require('../../../theUltimateChallenge/models/teamSchema');
const Player = require('../../../theUltimateChallenge/models/playerSchema');
const TheUltimateChallenge = require('../../../theUltimateChallenge/models/TheUltimateChallenge');
const jwt = require('jsonwebtoken');
const archiver = require('archiver');
const { listObjects, getFileStream, uploadFile } = require('../../../../services/s3/s3Service');

const changeTeamLevels = async (req, res) => {
    try {
        // 1. Verify admin token
        const token = req.cookies.adminToken;
        if (!token) {
            return res.status(401).json({ error: 'Admin token missing' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { sessionId, level } = req.body;

        // 2. Validate input
        if (!sessionId || !level) {
            return res.status(400).json({ error: 'sessionId and level are required' });
        }

        // 3. Fetch session
        const session = await TheUltimateChallenge.findById(sessionId);
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        if (Number(level) < 1 || Number(level) > session.numberOfLevels) {
            return res.status(400).json({ error: `Level must be between 1 and ${session.numberOfLevels}` });
        }

        // 4. Update all teams' currentLevel
        const teams = await Team.find({ session: sessionId }).populate({
            path: 'questionStatus.question',
            model: 'Question'
        });

        if (!teams || teams.length === 0) {
            return res.status(404).json({ error: 'No teams found for this session' });
        }

        session.currentLevel = Number(level);
        await session.save();

        // 5. Update currentLevel for all teams
        // await Team.updateMany(
        //     { session: sessionId },
        //     { $set: { currentLevel: Number(level) } }
        // );

        // 6. Emit updated team data to all players
        const io = req.app.get("socketService");

        for (const team of teams) {
            // Fetch players for the team
            const teamPlayers = await Player.find({ team: team._id });
            const teamSocketIds = teamPlayers.map(p => p.socketId).filter(id => id);

            // Format question data
            const questionData = team.questionStatus.map(q => ({
                id: q.question._id,
                text: q.question.text,
                level: q.question.level,
                category: q.question.category,
                status: q.status,
                currentPlayer: q.currentPlayer,
                pointsEarned: q.pointsEarned,
                answerUrl: q.answerUrl,
                answerType: q.question.answerType,
                questionImageUrl: q.question.questionImageUrl,
                points: q.question.points,
                difficulty: q.question.difficulty
            }));

            // Create payload
            const payload = {
                teamInfo: {
                    name: team.name,
                    currentLevel: Number(level), // Use the new level
                    teamScore: team.teamScore,
                    caption: team.caption,
                    isPaused: session.isPaused
                },
                questions: questionData
            };

            // Emit to all team members
            teamSocketIds.forEach(socketId => {
                io.to(socketId).emit("team-data", payload);
            });
        }

        // 7. Return success response
        return res.status(200).json({
            success: true,
            message: `All teams in session ${sessionId} updated to level ${level}`
        });

    } catch (err) {
        console.error('Error updating team levels:', err);
        return res.status(500).json({
            error: err.message || 'Failed to update team levels'
        });
    }
};


const getGameSettingsData = async (req, res) => {
    try {
        const token = req.cookies.adminToken;
        if (!token) {
            return res.status(401).json({ error: 'Admin token missing' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const { sessionId } = req.query;
        if (!sessionId) {
            return res.status(400).json({ error: 'sessionId is required' });
        }

        const session = await TheUltimateChallenge.findById(sessionId);

        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        const playerGameLink = `${process.env.FRONTEND_URL}/theultimatechallenge/login/${session._id.toString()}`;
        const adminGameLink = `${process.env.FRONTEND_URL}/admin/${session._id.toString()}/login`;

        const selectedLevels = [];
        let numQuestionsSelected = 0;
        if (session.selectedQuestions) {
            for (let l = 1; l <= 10; l++) {
                if (session.selectedQuestions[l] && session.selectedQuestions[l].length > 0) {
                    selectedLevels.push(l);
                    numQuestionsSelected += session.selectedQuestions[l].length;
                }
            }
        }

        const numTeamsCreated = await Team.countDocuments({ session: sessionId });
        const joinedTeamIds = await Player.distinct('team', { session: sessionId });
        const numTeamsJoined = joinedTeamIds.length;

        return res.status(200).json({
            success: true,
            data: {
                sessionId: session._id,
                numberOfLevels: session.numberOfLevels,
                isPaused: session.isPaused,
                adminName: session.admin,
                sessionName: session.companyName,
                companyLogo: session.companyLogo || null,
                currentLevel: session.currentLevel,
                playerGameLink,
                adminGameLink,
                selectedLevels,
                numQuestionsSelected,
                numTeamsCreated,
                numTeamsJoined
            }
        });
    }
    catch (err) {
        console.error('Error fetching game settings data:', err);
        return res.status(500).json({
            error: err.message || 'Failed to fetch game settings data'
        });
    }
}

const updateSessionBranding = async (req, res) => {
    try {
        // 1. Verify admin token
        const token = req.cookies.adminToken;
        if (!token) {
            return res.status(401).json({ error: 'Admin token missing' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { sessionId, companyName } = req.body;

        if (!sessionId) {
            return res.status(400).json({ error: 'sessionId is required' });
        }

        // 2. Fetch session
        const session = await TheUltimateChallenge.findById(sessionId);
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        // 3. Update companyName if provided
        if (companyName) {
            session.companyName = companyName;
        }

        // 4. Handle logo upload if provided
        if (req.file) {
            const extension = req.file.originalname.split('.').pop() || 'png';
            const key = `branding/${sessionId}/logo-${Date.now()}.${extension}`;
            const uploadResult = await uploadFile({
                fileBuffer: req.file.buffer,
                key: key,
                contentType: req.file.mimetype,
            });
            session.companyLogo = uploadResult.Location;
        }

        await session.save();

        // 5. Broadcast updated branding to all players in the session via Socket.io
        const io = req.app.get("socketService");
        if (io) {
            const teams = await Team.find({ session: sessionId }).populate({
                path: 'questionStatus.question',
                model: 'Question'
            });

            for (const team of teams) {
                const teamPlayers = await Player.find({ team: team._id });
                const teamSocketIds = teamPlayers.map(p => p.socketId).filter(id => id);

                const questionData = team.questionStatus.map(q => ({
                    id: q.question._id,
                    text: q.question.text,
                    level: q.question.level,
                    category: q.question.category,
                    status: q.status,
                    currentPlayer: q.currentPlayer,
                    pointsEarned: q.pointsEarned,
                    answerUrl: q.answerUrl,
                    answerType: q.question.answerType,
                    questionImageUrl: q.question.questionImageUrl,
                    points: q.question.points,
                    difficulty: q.question.difficulty
                }));

                const payload = {
                    teamInfo: {
                        name: team.name,
                        currentLevel: session.currentLevel,
                        teamScore: team.teamScore,
                        caption: team.caption,
                        isPaused: session.isPaused,
                        companyName: session.companyName,
                        companyLogo: session.companyLogo || null
                    },
                    questions: questionData
                };

                teamSocketIds.forEach(socketId => {
                    io.to(socketId).emit("team-data", payload);
                });
            }
        }

        return res.status(200).json({
            success: true,
            message: 'Session branding updated successfully',
            data: {
                companyName: session.companyName,
                companyLogo: session.companyLogo
            }
        });

    } catch (err) {
        console.error('Error updating session branding:', err);
        return res.status(500).json({
            error: err.message || 'Failed to update session branding'
        });
    }
}



const downloadSessionData = async (req, res) => {
    try {
        const sessionId = req.params.sessionId;

        // Verify admin token
        const token = req.cookies.adminToken;
        if (!token) {
            return res.status(401).json({ error: 'Admin token missing' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Validate sessionId
        if (!sessionId) {
            return res.status(400).json({ error: 'sessionId is required' });
        }

        // Verify session exists
        const session = await TheUltimateChallenge.findById(sessionId);
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        // List all objects in the S3 folder for this session
        const s3Prefix = `answers/${sessionId}/`;
        const files = await listObjects(s3Prefix);

        if (!files || files.length === 0) {
            return res.status(404).json({ error: 'No files found for this session' });
        }

        // Set response headers for zip download
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader(
            'Content-Disposition',
            `attachment; filename=session-${session.companyName}-${session.createdAt.toISOString()}.zip`
        );

        // Create archiver instance
        const archive = archiver('zip', { zlib: { level: 9 } });

        // Handle archiver errors
        archive.on('error', (err) => {
            console.error('Archive error:', err);
            throw err;
        });

        // Pipe archive to response
        archive.pipe(res);

        // Add each file from S3 to the archive
        for (const file of files) {
            try {
                // Get file stream from S3
                const fileStream = getFileStream(file.Key);

                // Extract filename from S3 key (remove prefix)
                const fileName = file.Key.replace(s3Prefix, '');

                // Add file to archive
                archive.append(fileStream, { name: fileName });
            } catch (fileErr) {
                console.error(`Error processing file ${file.Key}:`, fileErr);
                // Continue with other files
            }
        }

        // Finalize the archive (this is important!)
        await archive.finalize();

    } catch (err) {
        console.error('Error downloading session data:', err);

        // Only send error response if headers haven't been sent
        if (!res.headersSent) {
            return res.status(500).json({
                error: err.message || 'Failed to download session data'
            });
        }
    }
}

const getBase64Image = async (url) => {
    if (!url || typeof url !== 'string') return '';
    if (url.startsWith('data:')) return url;
    
    let buffer;
    let contentType = 'image/png';

    try {
        let bucketName = process.env.AWS_S3_BUCKET_NAME;
        if (bucketName) {
            bucketName = bucketName.replace(/['"]/g, '').trim();
        }
        
        // Check if URL is an S3 URL for our bucket
        if (bucketName && url.includes(bucketName)) {
            let key = '';
            const hostAndPath = url.split('.amazonaws.com/');
            if (hostAndPath.length > 1) {
                key = decodeURIComponent(hostAndPath[1]);
            } else {
                const parts = url.split(`/${bucketName}/`);
                if (parts.length > 1) {
                    key = decodeURIComponent(parts[1]);
                }
            }

            if (key) {
                // Try original key
                try {
                    const { downloadFile } = require('../../../../services/s3/s3Service');
                    const s3Obj = await downloadFile(key);
                    buffer = s3Obj.Body;
                    contentType = s3Obj.ContentType || 'image/png';
                } catch (s3Err) {
                    // Try replacing '+' with space
                    try {
                        const spaceKey = key.replace(/\+/g, ' ');
                        const { downloadFile } = require('../../../../services/s3/s3Service');
                        const s3Obj = await downloadFile(spaceKey);
                        buffer = s3Obj.Body;
                        contentType = s3Obj.ContentType || 'image/png';
                    } catch (s3Err2) {
                        console.warn(`S3 download failed for key "${key}" and "${key.replace(/\+/g, ' ')}", falling back to HTTP GET`);
                    }
                }
            }
        }
    } catch (err) {
        console.warn("Error checking S3 bucket key:", err.message);
    }

    // Fallback to axios if not fetched from S3
    if (!buffer) {
        try {
            const axios = require('axios');
            const response = await axios.get(url, { responseType: 'arraybuffer' });
            buffer = response.data;
            contentType = response.headers['content-type'] || 'image/png';
        } catch (axiosErr) {
            console.error(`Error fetching image via axios: ${url}`, axiosErr.message);
        }
    }

    if (buffer) {
        try {
            const base64 = Buffer.from(buffer).toString('base64');
            return `data:${contentType};base64,${base64}`;
        } catch (base64Err) {
            console.error(`Error converting buffer to base64: ${url}`, base64Err.message);
        }
    }

    return url; // fallback to original url if everything fails
};

const getPopulatedQuestionsForSession = async (req, res) => {
    try {
        const token = req.cookies.adminToken;
        if (!token) {
            return res.status(401).json({ error: 'Admin token missing' });
        }

        jwt.verify(token, process.env.JWT_SECRET);
        const { sessionId } = req.params;

        if (!sessionId) {
            return res.status(400).json({ error: 'sessionId is required' });
        }

        const session = await TheUltimateChallenge.findById(sessionId);
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        // Dynamically build populate options up to the number of levels in this session
        const populatePaths = [];
        for (let l = 1; l <= session.numberOfLevels; l++) {
            populatePaths.push({
                path: `selectedQuestions.${l}`,
                model: 'Question'
            });
        }
        await TheUltimateChallenge.populate(session, populatePaths);

        const sessionObj = session.toObject();

        const tasks = [];

        if (sessionObj.companyLogo) {
            tasks.push((async () => {
                sessionObj.companyLogo = await getBase64Image(sessionObj.companyLogo);
            })());
        }

        for (let level = 1; level <= session.numberOfLevels; level++) {
            const strLevel = level.toString();
            if (sessionObj.selectedQuestions && sessionObj.selectedQuestions[strLevel]) {
                const questions = sessionObj.selectedQuestions[strLevel];
                questions.forEach(q => {
                    if (q && q.questionImageUrl) {
                        tasks.push((async () => {
                            q.questionImageUrl = await getBase64Image(q.questionImageUrl);
                        })());
                    }
                });
            }
        }

        await Promise.all(tasks);

        return res.status(200).json({
            success: true,
            data: {
                companyName: sessionObj.companyName,
                companyLogo: sessionObj.companyLogo,
                numberOfLevels: sessionObj.numberOfLevels,
                selectedQuestions: sessionObj.selectedQuestions
            }
        });
    } catch (err) {
        console.error('Error fetching populated questions for session:', err);
        return res.status(500).json({
            error: err.message || 'Failed to fetch questions'
        });
    }
};

const createTeams = async (req, res) => {
    try {
        const token = req.cookies.adminToken;
        if (!token) {
            return res.status(401).json({ error: 'Admin token missing' });
        }

        const { sessionId, count } = req.body;
        if (!sessionId || !count) {
            return res.status(400).json({ error: 'sessionId and count are required' });
        }

        const session = await TheUltimateChallenge.findById(sessionId);
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        const numTeamsToCreate = Number(count);
        if (isNaN(numTeamsToCreate) || numTeamsToCreate < 1) {
            return res.status(400).json({ error: 'count must be a positive number' });
        }

        // Find existing teams for this session to determine sequential naming (e.g. Team 1, Team 2)
        const existingTeams = await Team.find({ session: sessionId }).lean();
        const existingNames = new Set(existingTeams.map(t => t.name));

        // Determine target total teams count and update session.numberOfTeams
        const newTotalTeamsCount = existingTeams.length + numTeamsToCreate;
        session.numberOfTeams = newTotalTeamsCount;
        await session.save();

        // Prepare questions list for initializing questionStatus
        const questionStatus = [];
        for (let level = 1; level <= session.numberOfLevels; level++) {
            const levelQuestions = session.selectedQuestions[level] || [];
            levelQuestions.forEach(questionId => {
                questionStatus.push({
                    question: questionId,
                    status: 'available'
                });
            });
        }

        const createdTeams = [];
        let suffix = 1;
        for (let i = 0; i < numTeamsToCreate; i++) {
            let teamName = `Team ${suffix}`;
            while (existingNames.has(teamName)) {
                suffix++;
                teamName = `Team ${suffix}`;
            }
            existingNames.add(teamName);

            const team = new Team({
                name: teamName,
                session: sessionId,
                questionStatus,
            });
            await team.save();
            createdTeams.push(team);
            suffix++;
        }

        // Trigger realtime update via socket to admin dashboard
        const io = req.app.get('socketService');
        if (io) {
            const { emitAllTeamsData } = require('../../../theUltimateChallenge/controllers/loginController');
            if (emitAllTeamsData) {
                await emitAllTeamsData(sessionId, io);
            }
        }

        return res.status(201).json({
            success: true,
            message: `Successfully created ${numTeamsToCreate} team(s)`,
            data: createdTeams
        });
    } catch (error) {
        console.error('createTeams error:', error);
        return res.status(500).json({ error: error.message || 'Failed to create teams' });
    }
};

module.exports = { 
    getGameSettingsData, 
    changeTeamLevels, 
    downloadSessionData, 
    updateSessionBranding, 
    getPopulatedQuestionsForSession,
    createTeams
};