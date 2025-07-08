import CreateTheUltimateChallenge from "../createGamesSessions/theUltimateChallenge/CreateTheUltimateChallenge";
import CreateTeamFormation from "../createGamesSessions/teamFormation/CreateTeamFormation";

const CreateSessionPopup = ({ isOpen, onClose, activeGame }) => {

  if (activeGame === "the-ultimate-challenge") {
    return <CreateTheUltimateChallenge isOpen={isOpen} onClose={onClose} />;
  } else if (activeGame === "team-formation") {
    return <CreateTeamFormation isOpen={isOpen} onClose={onClose}/>;
  }

  return null;
};

export default CreateSessionPopup;
