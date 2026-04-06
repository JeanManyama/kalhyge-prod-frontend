import { useNavigate } from "react-router-dom"; // Importer le hook pour naviguer
import { useTimer } from "../TimerContext/TimerContext";
import "./SideBar.scss";

interface Article {
  id: number;
  name: string;
  initial_quantity: number;
  objective: number;
}

interface SideBarProps {
  datas: Article[] | null;
  userRole: string | null;
  setOpenRejet: React.Dispatch<React.SetStateAction<boolean>>;
  setOpenProdDetail: React.Dispatch<React.SetStateAction<boolean>>;
  setOpenAdminArticle: React.Dispatch<React.SetStateAction<boolean>>;
  setOpenAdminMachine: React.Dispatch<React.SetStateAction<boolean>>;
  setOpenHistorique: React.Dispatch<React.SetStateAction<boolean>>;
  setOpenAdminUsers: React.Dispatch<React.SetStateAction<boolean>>;
}
function SideBar({
  datas,
  userRole,
  setOpenAdminMachine,
  setOpenRejet,
  setOpenAdminArticle,
  setOpenProdDetail,
  setOpenHistorique,
  setOpenAdminUsers,
}: SideBarProps) {
  const { start } = useTimer();
  const navigate = useNavigate();

  // Réinitialise tous les modals
  const resetAllModals = () => {
    setOpenRejet(false);
    setOpenProdDetail(false);
    setOpenAdminArticle(false);
    setOpenAdminMachine(false);
    setOpenRejet(false);
    setOpenProdDetail(false);
    setOpenHistorique(false);
    setOpenAdminUsers(false);
  };

  // Ouvre le modal pour Article et change le chemin
  const handleArticleClick = () => {
    resetAllModals();
    navigate("/home/article"); // Met à jour l'URL
    setOpenAdminArticle(true); // Ouvre le modal Article
  };

  // Ouvre le modal pour Machine et change le chemin
  const handleMachineClick = () => {
    resetAllModals();
    navigate("/home/machine"); // Met à jour l'URL
    setOpenAdminMachine(true); // Ouvre le modal Machine
  };

  // Ouvre le modal pour Rejet et change le chemin
  const handleRejetClick = () => {
    resetAllModals();
    navigate("/home/rejet"); // Met à jour l'URL
    setOpenRejet(true); // Ouvre le modal Rejet
  };
  // Gérer la navigation pour les users
  const handleUsersClick = () => {
    resetAllModals();
    navigate("/home/users/admin"); // Met à jour l'URL
    setOpenAdminUsers(true); // Ouvre le modal Rejet
  };

  // Gérer la navigation pour le'historique
  const handleHistoriqueClick = () => {
    resetAllModals();
    navigate("/home/historique"); // Navigue vers l'article spécifique
    setOpenHistorique(true); // Ouvre le modal de détail de production
  };

  // Gérer la navigation pour les articles en production
  const handleProdClick = (articleId: number) => {
    resetAllModals();
    navigate(`/home/${articleId}`); // Navigue vers l'article spécifique
    setOpenProdDetail(true); // Ouvre le modal de détail de production
  };

  return (
    <nav className="nav-side-bar">
      <ul>
        {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
        <li className="nav-side-bar-item" onClick={() => navigate("/home")}>
          ACCUEIL
        </li>
        {start ? (
          <>
            {datas && datas.length > 0 ? (
              datas.map((article) =>
                userRole === "admin" ? null : (
                  // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
                  <li
                    key={article.id}
                    className="nav-side-bar-item"
                    onClick={() => handleProdClick(article.id)}
                  >
                    {article.name.toUpperCase()}
                  </li>
                ),
              )
            ) : (
              <li className="nav-side-bar-item">Aucun article disponible</li>
            )}

            {/* Affiche l'option "REJET" uniquement si l'utilisateur n'est pas admin */}
            {userRole !== "admin" && (
              // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
              <li
                className="nav-side-bar-item"
                onClick={() => handleRejetClick()}
              >
                {/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
                <i className="close icon"></i> REJET
              </li>
            )}
          </>
        ) : (
          <li className="nav-side-bar-item">En attente du demarrage</li>
        )}

        {/* Affiche les options administratives si l'utilisateur est admin */}

        {userRole === "admin" && (
          <>
            {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
            <li
              className="nav-side-bar-item"
              onClick={() => handleArticleClick()}
            >
              {/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
              <i className="plus icon"></i>/<i className="cog icon"></i> ARTICLE
            </li>
            {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
            <li
              className="nav-side-bar-item"
              onClick={() => handleMachineClick()}
            >
              {/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
              <i className="plus icon"></i>/<i className="cog icon"></i> MACHINE
            </li>
            {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
            <li
              className="nav-side-bar-item"
              onClick={() => handleHistoriqueClick()}
            >
              {/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
              <i className="plus icon"></i>/<i className="cog icon"></i>{" "}
              HISTORIQUE
            </li>
            {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
            <li
              className="nav-side-bar-item"
              onClick={() => handleUsersClick()}
            >
              {/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
              <i className="plus icon"></i>/<i className="cog icon"></i>{" "}
              UTILISATEURS
            </li>
          </>
        )}
      </ul>
      <p className="footer-message">kalhyge@copyright2026</p>
    </nav>
  );
}

export default SideBar;
