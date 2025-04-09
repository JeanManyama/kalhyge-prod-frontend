
import Header from "../Header/Header";
import Prod from "../Prod/Prod";
import SideBar from "../SideBar/SideBar";
import ModaleInit from "../ModaleInit/ModaleInit";
import ProdDetail from "../ProdDetail/ProdDetail";
import MachineDetail from "../MachineDetail/MachineDetail";
import AdminArticle from "../AdminArticle/AdminArticle";
import Rejet from "../Rejet/Rejet";
import ModaleStop from "../ModaleStop/ModaleStop";
import Historique from "../Historique/Historique";
import AdminUsers from "../AdminUsers/AdminUsers";
// import LoginSignupForm from "../LoginSignupForm/LoginSignupForm";
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import  { useEffect, useState } from "react";
import type { Machine, Article, ProductionResponse, ArticleProduction, UserInfo } from '../@types';
// import { io } from 'socket.io-client';
import {  useTimer } from "../TimerContext/TimerContext";

import "./Home.scss";
import AdminMachine from "../AdminMachine/AdminMachine";
import Modale3trait from "../Modale3trait/Modale3trait";
import ModaleUpdatePassword from "../ModaleUpdatePassword/ModaleUpdatePassword";


//Utiliser HashRouter si l'utilisation de githubPages !!!

function Home() {
  const {  timerId } = useTimer(); // Depuis context
  
  const [formattedTime, setFormattedTime] = useState("00:00:00");

  // const [timerId, setTimerId]= useState<number | null>(null);
  const [timeBegin]=useState<Date |null>(null);
  const [userRole, setUserRole] = useState<string | null>(null); // Rôle de l'utilisateur connecté
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null); // Informations de l'utilisateur connecté
  const [loginTime, setLoginTime] = useState<Date | null>(null); // Heure de connexion
  const navigate = useNavigate();

  const apiUrl = import.meta.env.VITE_API_URL;

  //  // Fecth des données essaie
  // const [datas] = useState<null | []>(null);
  const [articles, setArticles] = useState<Article[] | null>(null);
  const [machines, setMachines] = useState<Machine[] | null>([]);
  const [production, setProduction]= useState<ArticleProduction[] | null>(null);

  // Vérification de rôle de l'utilisateur connecté
  const verifRole = async () => {
    const accessToken = localStorage.getItem('accessToken');
    const csrfToken = localStorage.getItem('csrfToken');
  
    if (!accessToken) {
      setError('Token manquant');
      return;
    }
  
    try {
      const response = await axios.get(`${apiUrl}/checkRole`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'x-csrf-token': csrfToken,
        },
      });
  
      setUserRole(response.data.message); // Stocker le role de l'utilisateur
      // console.log('Role utilisateur récupéré--------------------------------- :', response.data.message);
    } catch (err: unknown) { // Typage de l'erreur comme unknown
      // Vérification si l'erreur est une err d'axios
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Erreur lors de la récupération des informations utilisateur.');
      } else {
        setError('Erreur inconnue.');
      }
    }
  };

  // Récupérer les informations de l'utilisateur connecté
  const fetchUserInfo = async () => {
    // console.log("On est bien dans fetchUserInfo-------------------------------------------");
    const accessToken = localStorage.getItem('accessToken');
    const csrfToken = localStorage.getItem('csrfToken');
  
    if (!accessToken) {
      setError('Erreur');
      // Rediriger vers la page de connexion
      navigate("/");
      return;
    }
  
    try {
      const response = await axios.get(`${apiUrl}/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'x-csrf-token': csrfToken,
        },
      });
      // console.log('Informations utilisateur récupérées----------------------------- :', response.data);
      setUserInfo(response.data); // Stocker les informations de l'utilisateur
      //  console.log("LOGIN TIME A-------------------------------------------", loginTime);
      // L'heure de connexion est stockée dans le localStorage
       const savedLoginTime = localStorage.getItem("loginTime");
        if (savedLoginTime) {
          setLoginTime(new Date(savedLoginTime)); // Restaurer depuis le localStorage
        } else {
          const now = new Date();
          setLoginTime(now);
          localStorage.setItem("loginTime", now.toISOString()); // Sauvegarder
        }

      // console.log("LOGIN TIME A a la sortie -------------------------------------------", loginTime);
    } catch (err: unknown) { // Typage de l'erreur comme unknown
      // Vérification si l'erreur est une erreur d'axios
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Erreur lors de la récupération des informations utilisateur.');
      } else {
        setError('Erreur inconnue.');
      }
    }
  };
   
  
  // Charger les informations de l'utilisateur au chargement de la page
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    verifRole();
    if(userInfo === null){
      fetchUserInfo();
    }
  }, []);


// FETCH DATA Centre, SideBar et Header
  const fetchData = async (timerId : number) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const csrfToken = localStorage.getItem('csrfToken');
      // console.log("TIMER ID DANS CONTEXT Avant d'envoyé au back -----------------------------",timerId);
      const response = await axios.get(`${apiUrl}/productions/${timerId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'x-csrf-token': csrfToken,
          'Content-Type': 'application/json',
        },
      });
      const data =  response.data;  
      // console.log(data);
      setArticles(data.data.articles); 
      // console.log("ARTICLES DANS HOME A -----------------------------",articles);
      setMachines(data.data.machines);
      // console.log("MACHINES DANS HOME A -----------------------------",machines);
    
      setProduction(data.data.productions);
      // console.log("LA PRODUCTION DANS HOME A  -----------------------------",production);
    } catch (error) {
      console.error("Erreur lors du chargement des données :", error);
    }
  };

// FETCH DATA POUR UN ARTICLE
// Fonction pour fermer le modal et revenir à l'URL de base
const [articleData, setarticleData] = useState<ProductionResponse | null>(null);

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
    setOpenInitialisation(false)
    // fetchData(timerId? timerId : 0);
	};

// Fermeture modale de la Production
const closeProdDetail = () => {
  resetAllModals()
  setOpenProdDetail(false);

  navigate('/home'); // Mise à jour de l'URL
  
};
// Fermeture modale de la Production
const closeMachineDetail = () => {
  setOpenMachineDetail(false);

  navigate('/home'); // Mise à jour de l'URL
  
};
// Fermeture modale de la Production
const closeInitialisation = () => {
  setOpenInitialisation(false);

  navigate('/home'); // Mise à jour de l'URL
  
};

// Fetch la production d'un article
const { articleId } = useParams<{ articleId?: string }>();
const fetchDataOneArticle = async (articleId: number, timerId : number) => {
  try {
    const response = await fetch(`${apiUrl}/productions/articles/${articleId}/fetch`, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({ timer_id: timerId }), 
  });
    if (!response.ok) {
      throw new Error(`Erreur HTTP : ${response.status}`);
    }
    const data = await response.json(); 
    setarticleData(data);
  } catch (error) {
    console.error("Erreur lors du chargement des données :", error);
    return null; // Vous pouvez gérer un cas de fallback si nécessaire
  }
};

// Changement de l'url pour afficher les détails de l'article
// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
useEffect(() => {
 
  if (articleId) {
    fetchDataOneArticle(Number.parseInt(articleId), timerId?timerId:0); // Charge les détails de l'article à partir de l'ID
    setOpenProdDetail(true); // Ouvre le modal
  }else {
    setOpenProdDetail(false); // Assurez-vous que le modal est fermé si l'ID est retiré
  }
}, [articleId]);

  // STATE 0 : COMPTEUR
  const [setStart] = useState(false);
  // const {start} =useTimer();

  // STATE 1 : Modal Admin / configuration produits
  const [openAdminArticle, setOpenAdminArticle] = useState(false);
    // STATE 1.1 : Modal Admin / configuration produits
    const [openAdminMachine, setOpenAdminMachine] = useState(false);
  // STATE 2 : Modal Initialisation des données
  const [openInitialisation, setOpenInitialisation] = useState(false);
  // STATE 3 : Modal production en detail d'un produit
  const [openProdDetail, setOpenProdDetail] = useState(false);
  // STATE 4 : Modal production d'une machine en detail
  const [openMachineDetail, setOpenMachineDetail] = useState(false);
  // STATE 5 : Modal DE REJET
  const [openRejet, setOpenRejet] = useState(false);
  // STATE 6 : STOP
  const [stop, setStop] = useState(false);
  // STATE 7 : Confirmation pour lancer
  // const [open, setOpen] = useState(false);
  // STATE 7 : Verification ecran mobile
  const [isMobile, setIsMobile] = useState(false);

  // Historique
  const [openHistorique, setOpenHistorique] = useState(false);

  // Admin Users
  const [openAdminUsers, setOpenAdminUsers] = useState(false);

  // STATES : Pour gestion de la connexion
  // const [isConnected, setIsConnected] = useState(false);
  // const [pseudo, setPseudo] = useState<null | string>(null);
  const [error, setError] = useState<null | string>(null);

  
  // Lancement de la production
// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
useEffect(() => {
 
  if (timerId!==0) {
   fetchData(timerId? timerId : 0);
  }
}, [ timerId]);

  
  // Mise à jours mot de passe-------------------------------------------------------
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const openPasswordModal = () => setIsPasswordModalOpen(true);
  const closePasswordModal = () => setIsPasswordModalOpen(false);
  const handleSavePassword = async (newPassword: string) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const csrfToken = localStorage.getItem('csrfToken');

      await axios.patch(
        `${apiUrl}/update-password`,
        { password: newPassword },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'x-csrf-token': csrfToken,
            'Content-Type': 'application/json',
          },
        }
      );

      alert('Mot de passe mis à jour avec succès.');
      closePasswordModal();
    } catch (err) {
      console.error('Erreur lors de la mise à jour du mot de passe :', err);
      alert('Erreur lors de la mise à jour du mot de passe. Veuillez réessayer.');
    }
  };
  // Fin Mise à jours mot de passe-------------------------------------------------------------
 

   // Fonction pour se déconnecter
const handleLogout = async () => {
  try {
    // const accessToken = localStorage.getItem('accessToken');
    // const csrfToken = localStorage.getItem('csrfToken');
    const refreshToken = localStorage.getItem('refreshToken');
    const csrfToken = localStorage.getItem('csrfToken');

    // Appeler le backend pour supprimer le refreshToken
    await axios.post(`${apiUrl}/logout`, 
    { refreshToken },
    {
      headers: {
        'x-csrf-token': csrfToken,
      },
    }
    );
    // ss
    // Supprimer les tokens du localStorage
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("csrfToken");
    localStorage.removeItem("loginTime");
    localStorage.removeItem("start");
    localStorage.removeItem("timerId");
    localStorage.removeItem("timeBegin");
    localStorage.removeItem("formattedTime");
    localStorage.removeItem("loginTime");
    localStorage.removeItem("stop");
    

    // Rediriger vers la page de connexion
    navigate("/");
  } catch (error) {
    console.error("Erreur lors de la déconnexion :", error);
    alert("Erreur lors de la déconnexion. Veuillez réessayer.");
  }
};
 // Fetch machines D'EN HAUT -------------------------------------------------------------


 // Fetch de toutes les machines-------------------------------------------------------------
 const fetchMachines = async (): Promise<Machine[] | null> => {
  try {
    const accessToken = localStorage.getItem('accessToken');
    const csrfToken = localStorage.getItem('csrfToken');

    const response = await axios.get(`${apiUrl}/machines`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'x-csrf-token': csrfToken,
        'Content-Type': 'application/json',
      },
    });

    // console.log('Liste des machines récupérées----------------------------------- :', response.data);
    return response.data; // Retourne un tableau d'objets de machine
  } catch (err) {
    console.error('Erreur lors de la récupération des machines :', err);
    // alert('Erreur lors de la récupération des machines. Veuillez réessayer.');
    return null; // Retourne null en cas d'échec
  }
};  

  // USE 2 : verif Mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);  // Taille du mobile <= 768px
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Exécutez une fois lors du montage pour vérifier la taille initiale

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
 
      <div className="app">
     
      {isMobile ? <Modale3trait 
       datas={articles}
       userRole={userRole}
      setIsMobile={setIsMobile}
      setOpenRejet={setOpenRejet} 
      setOpenProdDetail={setOpenProdDetail}
      setOpenAdminArticle={setOpenAdminArticle}
      setOpenAdminMachine={setOpenAdminMachine}
      setOpenHistorique={setOpenHistorique}
      setOpenAdminUsers={setOpenAdminUsers}
      fetchMachines={fetchMachines}  /> : 
      <SideBar
      datas={articles}
      userRole={userRole}
        setOpenRejet={setOpenRejet}
        setOpenProdDetail={setOpenProdDetail}
        setOpenAdminArticle={setOpenAdminArticle}
        setOpenAdminMachine={setOpenAdminMachine}
        setOpenHistorique={setOpenHistorique}
        setOpenAdminUsers={setOpenAdminUsers}

      /> }

      <div className="rightbar">
    
        <Header
        setFormattedTime={setFormattedTime}
        formattedTime={formattedTime}
          timeBegin={timeBegin}
          stop={stop}
          setStop={setStop}
          // start={start}
          openPasswordModal={openPasswordModal}
          handleLogout={handleLogout}
          userRole={userRole}
          userInfo={userInfo}
          loginTime={loginTime}
          error={error}
          setOpenMachineDetail={setOpenMachineDetail}
          setOpenInitialisation={setOpenInitialisation}
          machines={machines} 
        />
     
        <ModaleUpdatePassword 
        isOpen={isPasswordModalOpen}
        fetchUserInfo = {fetchUserInfo}
        onClose={closePasswordModal}
        onSave={handleSavePassword}/>
        <Prod productions = {production} />
        <ModaleInit
        user_id = {userInfo?.id}
         articles={articles}
        //  setArticles={setArticles}
         machines={machines}
    
          openInitialisation={openInitialisation}
          setOpenInitialisation={closeInitialisation}
        />
           
        <ModaleStop setStart={setStart} stop={stop} setStop={setStop} />
        
        <ProdDetail
        timerId={timerId}
          articleData={articleData}
          openProdDetail={openProdDetail}
          setOpenProdDetail={closeProdDetail}
        />
        <MachineDetail
        timerId={timerId}
          openMachineDetail={openMachineDetail}
          setOpenMachineDetail={closeMachineDetail}
        />
        <AdminArticle
            articles={articles}
            setArticles={setArticles}
            openAdminArticle={openAdminArticle} 
            setOpenAdminArticle={setOpenAdminArticle} 
          />
        <AdminMachine 
        machines={machines}
        setMachines={setMachines}
        openAdminMachine={openAdminMachine} 
        setOpenAdminMachine={setOpenAdminMachine} />
        <Rejet  timerId={timerId} openRejet={openRejet} setOpenRejet={setOpenRejet} />
        <Historique openHistorique={openHistorique}  setOpenHistorique={setOpenHistorique}/>
        <AdminUsers openAdminUsers={openAdminUsers} setOpenAdminUsers={setOpenAdminUsers} />
      </div>
    </div>
   
);
}

export default Home;
