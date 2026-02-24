import { useState } from "react";
import "./Modale3trait.scss";

import SideBar from "../SideBar/SideBar";
import type { Machine } from "../@types";

interface Article {
  id: number;
  name: string;
  initial_quantity: number;
  objective: number;
}
interface Modale3traitPros {
  datas: Article[] | null;
  userRole: string | null;
  setIsMobile: React.Dispatch<React.SetStateAction<boolean>>;
  setOpenRejet: React.Dispatch<React.SetStateAction<boolean>>;
  setOpenProdDetail: React.Dispatch<React.SetStateAction<boolean>>;
  setOpenAdminArticle: React.Dispatch<React.SetStateAction<boolean>>;
  setOpenAdminMachine: React.Dispatch<React.SetStateAction<boolean>>;
  setOpenHistorique: React.Dispatch<React.SetStateAction<boolean>>;
  setOpenAdminUsers: React.Dispatch<React.SetStateAction<boolean>>;
  fetchMachines: () => Promise<Machine[] | null>;
}
function Modale3trait({
  datas,
  userRole,
  setOpenRejet,
  setOpenProdDetail,
  setOpenAdminArticle,
  setOpenAdminMachine,
  setOpenHistorique,
  setOpenAdminUsers,
}: Modale3traitPros) {
  const [openModaleSideBar, setOpenModaleSideBar] = useState(false);

  return (
    <div>
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
      <div
        className="hamburger"
        onClick={() => {
          setOpenModaleSideBar(true);
        }}
      >
        <div className="bar" />
        <div className="bar" />
        {/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
        <div className="bar"></div>
      </div>

      {/* Modal */}
      {openModaleSideBar && (
        <div>
          {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
          <span
            className="closed"
            onClick={() => {
              setOpenModaleSideBar(false);
            }}
          >
            {" "}
            &times;
          </span>

          <SideBar
            datas={datas}
            userRole={userRole}
            setOpenRejet={setOpenRejet}
            setOpenProdDetail={setOpenProdDetail}
            setOpenAdminArticle={setOpenAdminArticle}
            setOpenAdminMachine={setOpenAdminMachine}
            setOpenHistorique={setOpenHistorique}
            setOpenAdminUsers={setOpenAdminUsers}
            // fetchMachines={fetchMachines}
          />
        </div>
      )}
    </div>
  );
}

export default Modale3trait;
