import Background from "../../assets/images/Background.jpg";
import UserTimer from "../../features/user/timer/components/UserTimer.jsx";

import TheUltimateChallengeRouter from "../../TheUltimateChallenge/pages/TheUltimateChallengeRouter.jsx";

function UserRoutes() {
  return (
    <div
      style={{
        position: "relative",
        maxWidth: "480px",
        margin: "0 auto",
        minHeight: `${window.innerHeight}px`,
        backgroundColor: "#23203E",
      }}
      className=""
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url(${Background})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.2,
          zIndex: 0,
        }}
      ></div>

      <div style={{ position: "relative", zIndex: 1 }}>
        <TheUltimateChallengeRouter />
      </div>
    </div>
  );
}

export default UserRoutes;
