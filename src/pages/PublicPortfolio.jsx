import DebugPortfolioState from "./DebugPortfolioState";
import { useDeveloper } from "../context/DeveloperContext";
import { useParams } from "react-router-dom";

const PublicPortfolio = () => {
  const { username } = useParams();

  const {
    developer,
    publicLoading,
    publicError
  } = useDeveloper();

  return (
    <DebugPortfolioState
      username={username}
      publicLoading={publicLoading}
      publicError={publicError}
      developer={developer}
    />
  );
};

export default PublicPortfolio;
