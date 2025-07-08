import { Close } from "@mui/icons-material";

const CreateTeamFormation = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-[80%] max-w-[1152px] mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="text-center w-full">
            <h2 className="text-2xl font-bold">Team Formation</h2>
            <h3 className="text-xl font-semibold">Create New Session</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <Close className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateTeamFormation;
