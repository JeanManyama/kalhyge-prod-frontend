
//MES CODES D'AVANT

import {
  Form,
  Image,
  Button,
  FormGroup,
  FormInput,
} from "semantic-ui-react";
// import axios from 'axios';
import ModaleConfirm from "../ModaleConfirm/Modaleconfirm";
import "./Header.scss";
import { useNavigate } from "react-router-dom"; // Importer useNavigate
import logo from "../../assets/logokaly.png";
import jensen from "../../assets/jensen.png";
import kane from "../../assets/kannegieser.png";
import plieuse1 from "../../assets/plieuse-1.png";
import plieuse2 from "../../assets/plieuse-2.png";

import type { Machine } from "../@types";
// import { io } from "socket.io-client";  // Importer socket.io-client
import { useEffect, useState } from "react";
import { useTimer } from "../TimerContext/TimerContext"; // Importer le hook du contexte

// const socket = io("http://localhost:3000"); // URL de ton backend

const logoData = {
  src: logo,
  alt: "Logo de l'entreprise",
  className: "logo",
};

const machineAssets: Record<string, { image: string; colorClass: string }> = {
  jensen: { image: jensen, colorClass: "header-2_span-color-jensen" },
  kannegieser: { image: kane, colorClass: "header-2_span-color-kane" },
  "plieuse 1": { image: plieuse1, colorClass: "header-2_span-color-plieuse1" },
  "plieuse 2": { image: plieuse2, colorClass: "header-2_span-color-plieuse2" },
};

interface HeaderProps {
  setFormattedTime: React.Dispatch<React.SetStateAction<string>>;
  formattedTime: string;
  timeBegin: Date | null;
  // start: boolean;
  openPasswordModal: () => void;
  stop: boolean;
  setStop: React.Dispatch<React.SetStateAction<boolean>>;
  handleLogout: () => Promise<void>;
  error: string | null;
  userRole: string | null;
  userInfo: UserInfo | null;
  loginTime: Date | null;
  setOpenMachineDetail: React.Dispatch<React.SetStateAction<boolean>>;
  setOpenInitialisation: React.Dispatch<React.SetStateAction<boolean>>;
  machines: Machine[] | null; // Machines venant de la BDD
}

interface UserInfo {
  firstname: string;
  connectedAt: string;
}

function Header({
  // setFormattedTime,
  // formattedTime,
  // timeBegin,
  // start,
  // setStop,
  openPasswordModal,
  loginTime,
  handleLogout,
  userRole,
  userInfo,
  setOpenMachineDetail,
  setOpenInitialisation,
  machines,
}: HeaderProps) {
  const navigate = useNavigate(); // Initialiser useNavigate

  const {
    formattedTime,
    start,
    // setFormattedTime,
    // setStart,
    timeBegin,
  
    // handleStopTimer,
    // setStop, // Utilisation de setStop depuis le contexte
    // hours,
    // minutes,
    // seconds,
  } = useTimer(); // Utiliser le contexte du minuteur

  // Exemple d'utilisation de localStorage pour persister l'état du timer

//   useEffect(() => {
//   // Vérifier si un timer est déjà en cours dans le localStorage
//   const savedFormattedTime = localStorage.getItem('formattedTime');
//   const savedStart = localStorage.getItem('start') === 'true';  // Vérifie si le timer était démarré

//   if (savedFormattedTime && savedStart) {
//     setFormattedTime(savedFormattedTime);
//     setStart(true); // Démarre le timer
//   } else {
//     setFormattedTime("00:00:00");
//     setStart(false); // Assurez-vous que le timer commence arrêté
//   }
// }, []);

// // Lorsque l'état du timer change, on le sauvegarde dans localStorage
// useEffect(() => {
//   if (start) {
//     localStorage.setItem('formattedTime', formattedTime);
//     localStorage.setItem('start', 'true');
//   } else {
//     localStorage.setItem('formattedTime', "00:00:00");
//     localStorage.setItem('start', 'false');
//   }
// }, [formattedTime, start]);

  






  const [modaleConfirme, setModaleConfirme] = useState(false);

  // Fonction pour arrêter le timer
  // const handleStopTimer = async () => {
  //   try {
  //     const response = await axios.patch('http://localhost:3000/timers/stop');
  //     console.log('Timer arrêté avec succès', response.data);
  //     // setStop(true);           // Arrêter le timer localement
  //     // setStart(false);         // Mettre à jour l'état de démarrage
  //     setFormattedTime("00:00:00"); // Réinitialiser le timer
  //     setStart(false); // Arrêter le timer
  //     setStop(true); // Arrêter le timer
  //   } catch (error) {
  //     console.error('Erreur lors de l\'arrêt du timer', error);
  //   }
  // };


  // Fonction pour ouvrir la modale de confirmation
    const handleStop = () => {
    setModaleConfirme(true);  // Affiche la modale
    };

    // Réinitialise tous les modals
    const resetAllModals = () => {
      setOpenMachineDetail(false);
      setOpenInitialisation(false)
    };

   // Gestion de la navigation pour les machines en production
   const handleMachineClick = (machineId: number) => {
    resetAllModals();
    navigate(`/home/machines/${machineId}`); // Navigue vers l'article spécifique
    setOpenMachineDetail(true); // Ouvre le modal de détail de la machine de la production
    };
     // Gestion de la navigation pour l'initialisation
     const handleInitialisationClick = () => {
      resetAllModals();
      navigate('/home/initialisation'); // Navigue vers l'article spécifique
      setOpenInitialisation(true); // Ouvre le modal de détail de la machine de la production
    };
    
    // console.log("Le TEMPS RECUPERE EST -------------------------------------------", formattedTime);
   // Minuteur (simple)
   // veriication de format du temps
   const isValidFormattedTime = (time: string) => {
    return /^(\d{2}):(\d{2}):(\d{2})$/.test(time); // Vérifie si le format est HH:MM:SS
  };

  // Initialiser le temps "00:00:00" si le format est invalide
const [timeLeft, setTimeLeft] = useState(() => {
  if (!formattedTime || !isValidFormattedTime(formattedTime)) {
    console.error("formattedTime is invalid:", formattedTime);
    return 0; // Valeur par défaut si formattedTime est invalide
  }

  const [hours, minutes, seconds] = formattedTime.split(":").map(Number);
  return hours * 3600 + minutes * 60 + seconds;
});

// Réinitialiser timeLeft à chaque changement de formattedTime
  useEffect(() => {
    const [hours, minutes, seconds] = formattedTime.split(":").map(Number);
    const initialTime = hours * 3600 + minutes * 60 + seconds;
    setTimeLeft(initialTime);
  }, [formattedTime]);


// Décrémentation du timer

useEffect(() => {
  if (start && timeLeft > 0) {
    const intervalId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(intervalId); // Nettoyage de l'intervalle
  }
}, [start, timeLeft]);


// Synchroniser timeLeft avec formattedTime si le timer est redémarré ou arrêté
// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
useEffect(() => {
  if (isValidFormattedTime(formattedTime)) {
    const [hours, minutes, seconds] = formattedTime.split(":").map(Number);
    setTimeLeft(hours * 3600 + minutes * 60 + seconds);
  }
}, [formattedTime]);




// Fonction pour formater le temps(2654)
const formatTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
};

// Formater automatiquement timeLeft en HH:MM:SS(2654-->00:44:14)
const dynamicFormattedTime = formatTime(timeLeft);
// console.log("Le TEMPS RECUPERE dans Header.tsx EST -------------------------------------------", dynamicFormattedTime);
// console.log("Le TIMER RECUP DANS LA BDD EST -------------------------------------------", timeLeft);

  return (
    <header className="header">
      {/* Première partie avec le logo et la barre de recherche */}
      <div className="header-1">
        <div className="header-1_search">
          <Form size="mini">
            <FormGroup>
              <Image src={logoData.src} alt={logoData.alt} className={logoData.className} />
              <FormInput placeholder="Recherche ..." name="search" />
            </FormGroup>
          </Form>
        </div>
        <div>
          {userInfo && (
            <div className="header-1_form_welcome">
              <h5>Bienvenue, {userInfo.firstname} !</h5>
              <p>
                Connecté depuis : {loginTime ? loginTime.toLocaleTimeString() : "..." }
              </p>
            </div>
          )}
        </div>
       <div >
        <div>
          {userInfo && (
            <Button
              type="button"
              className="button-logout"
              onClick={handleLogout}
            >
              Déconnexion
            </Button>
          )}
        </div>
        <div>
          <Button
            type="button"
            className="button-logout"
            onClick={openPasswordModal}
          >
            COMPTE
          </Button>
        </div>
       </div>
      </div>

      {/* Dynamisation des machines */}
      <nav className="header-21">
        <ul className="header-2">
          {/* biome-ignore lint/complexity/useOptionalChain: <explanation> */}
          {machines &&
            machines.map((machine) => {
              const machineName = machine.name.toLowerCase(); // Convertir le nom en minuscule pour le mappage
              const machineAsset = machineAssets[machineName] || {
                image: "",
                colorClass: "",
              };

              return (
                // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
<li
                  key={machine.id}
                  className="header-2_item"
                  onClick={() => handleMachineClick(machine.id)} // Changer l'URL
                >
                  <Image
                    className={`header-2_image ${machineAsset.colorClass}`}
                    size="medium"
                    src={machineAsset.image}
                    alt={`Machine ${machine.name}`}
                  />
                  <h2 className="header-2_title">
                    <span className={`header-2_span ${machineAsset.colorClass}`}>
                      {machine.name}
                    </span>
                  </h2>
                </li>
              );
            })}
        </ul>
      </nav>

      {/* Partie du démarrage */}
      <div className="header-3">
        <div className="header-3_text">
          <h1>
            <span>Production</span>
            <span>en temps réel</span>
          </h1>
        </div>
          {/* Si c'est "admin" */}
        { (userRole === "admin" )  &&
          (start ? (
            <div className="header-3_counter">
              <div>
                Démarrée à  <span>
                {timeBegin
                  ? new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }).format(timeBegin)
                  : "-"}
                 
              </span>

              </div>
              <button
                  type="button"
                  className="button-counter-start"
                  onClick={() => {
                    if (userRole !== null) {
                      handleStop();
                      // setFormattedTime("00:00:00");
                    }
                  }}
                  disabled={userRole === null}
                >
                {dynamicFormattedTime}
              </button>
            </div>
          ) : (
            <div className="header-3_counter">
              <button
                type="button"
                className="button-counter-init"
                onClick={() => handleInitialisationClick()}
                // onClick={() => handleStart()}
              >
                Démarrer
              </button>
            </div>
          ))}
     {/* Si c'est "l'utilisateur" */}
     { (userRole === null )  &&
          (start && (
            <div className="header-3_counter">
              <div>
                Démarrée à  <span>
                {timeBegin
                  ? new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }).format(timeBegin)
                  : "-"}
              </span>

              </div>
              <button
                  type="button"
                  className="button-counter-start"
                  disabled
                >
                {dynamicFormattedTime}
              </button>
            </div>
          ) )}


      </div>
      <ModaleConfirm 
        open={modaleConfirme} 
        setOpen={setModaleConfirme} 
        // handleStopTimer={handleStopTimer} 
      />
    </header>
  );
}

export default Header;
