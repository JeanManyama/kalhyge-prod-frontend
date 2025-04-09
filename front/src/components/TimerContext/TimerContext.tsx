import axios from 'axios';

import  { createContext, useState, useContext, type ReactNode, useEffect, useCallback  } from "react";
import type { Machine, Article, ArticleProduction } from '../@types';
import { io } from 'socket.io-client';
const socket = io(import.meta.env.VITE_API_URL, {
  withCredentials: true,
}); 
// Définir le type du contexte
interface TimerContextType {
  hours : number,
  minutes : number,
  seconds :number,
  // isRunning : boolean,
  formattedTime: string;
  start: boolean;
  timeBegin: Date | null;
  stop: boolean;  // Ajout de stop
  timerId: number | null;
  articles: Article[] | null;
  machines: Machine[] | null;
  production: ArticleProduction[] | null;
  setFormattedTime: (time: string) => void;
  setStart: React.Dispatch<React.SetStateAction<boolean>>;
  setTimeBegin:  (date: Date | null) => void;
  setStop: React.Dispatch<React.SetStateAction<boolean>>; // Ajout de setStop

   setTimerId: React.Dispatch<React.SetStateAction<number | null>>;
  setHours: React.Dispatch<React.SetStateAction<number>>;
 setMinutes: React.Dispatch<React.SetStateAction<number>>;
setSeconds: React.Dispatch<React.SetStateAction<number>>;
handleStopTimer :  () => void;
}
interface Timer {
  time_elapsed: number ;
  duration: number ;
  time_begin: Date ;
  // status: boolean ;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

// Créer le Provider pour envelopper l'application
interface TimerProviderProps {
  children: ReactNode; // Typage de 'children' comme ReactNode
}

// TimerProvider pour fournir le contexte aux composants enfants
export const TimerProvider: React.FC<TimerProviderProps> = ({ children }) => {
  const [hours, setHours] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(0);
  const [seconds, setSeconds] = useState<number>(0);
  const [formattedTime, setFormattedTime] = useState<string>("00:00:00");
  const [start, setStart] = useState<boolean>(false);
  const [timeBegin, setTimeBegin] = useState<Date | null>(null);
  const [stop, setStop] = useState<boolean>(false); // Ajout de stop
  const [timerId, setTimerId] = useState<number | null>(null);

  const apiUrl = import.meta.env.VITE_API_URL;

  //-----------------TIMER--------------------------------------------------------------                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       
  useEffect(() => {
    const fetchTimerStateFromBackend = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        const csrfToken = localStorage.getItem('csrfToken');
        const response = await axios.get(`${apiUrl}/timers/active` , {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'x-csrf-token': csrfToken,
            'Content-Type': 'application/json',
          },
        });
        const timer = response.data;

        if (timer?.time_begin && timer?.duration) {
          const now = new Date().getTime();
          const startTime = new Date(timer.time_begin).getTime();
          const elapsedTime = Math.floor((now - startTime) / 1000);
          const remainingTime = timer.duration - elapsedTime;

          if (remainingTime > 0) {
            const hours = Math.floor(remainingTime / 3600);
            const minutes = Math.floor((remainingTime % 3600) / 60);
            const seconds = remainingTime % 60;

            setFormattedTime(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
          } else {
            handleStopTimer();
            setFormattedTime('00:00:00');
            setStart(false);
            setStop(true);
          }

          setStart(timer.status);
          setTimeBegin(new Date(timer.time_begin));
          setTimerId(timer.id);

          // Sauvegarder l'état dans localStorage après l'avoir récupéré du backenddddd
          localStorage.setItem('formattedTime', formattedTime);
          localStorage.setItem('start', JSON.stringify(timer.status));
          localStorage.setItem('timeBegin', timer.time_begin ? new Date(timer.time_begin).toISOString() : '');
          localStorage.setItem('stop', JSON.stringify(false)); // ou true si le timer est supposé être stoppé
          localStorage.setItem('timerId', JSON.stringify(timer.id));
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du timer actif :', error);
      }
    };

    fetchTimerStateFromBackend();
  }, [formattedTime]);

   // Mettre à jour les données en localStorage quand le timer est mis à jourrrr
   useEffect(() => {
    const saveTimerStateToLocalStorage = () => {
      localStorage.setItem('formattedTime', formattedTime);
      localStorage.setItem('start', JSON.stringify(start));
      localStorage.setItem('timeBegin', timeBegin ? timeBegin.toISOString() : '');
      localStorage.setItem('stop', JSON.stringify(stop));
      localStorage.setItem('timerId', JSON.stringify(timerId));
    };

    saveTimerStateToLocalStorage();
  }, [formattedTime, start, timeBegin, stop, timerId]);
  
// Écouter les mises à jour du timer via WebSocket
useEffect(() => {
  socket.on('timerUpdated', (data: { action: string, timer: Timer }) => {
    if (data.action === 'start') {
      setStop(false);
      setStart(true);
      setTimeBegin(new Date(data.timer.time_begin));
    } else if (data.action === 'stop') {
      setStop(true); 
      setStart(false);
      setFormattedTime('00:00:00');
    } else if (data.action === 'update') {
      const totalSeconds = data.timer.time_elapsed;
      const remainingTime = data.timer.duration - totalSeconds;

      if (remainingTime > 0) {
        const hours = Math.floor(remainingTime / 3600);
        const minutes = Math.floor((remainingTime % 3600) / 60);
        const seconds = remainingTime % 60;

        setFormattedTime(
          `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
        );
        setHours(hours);
        setMinutes(minutes);
        setSeconds(seconds);
      } else {
        handleStopTimer();
        setFormattedTime('00:00:00');
        setStart(false);
        setStop(true);
      }
    }
  });

  return () => {
    socket.off('timerUpdated');
  };
}, []);
  // Fonction pour arrêter le timer
  const handleStopTimer = async () => {
    try {
      const response = await axios.patch(`${apiUrl}/timers/update-and-stop`);
      console.log(response.status);
      // setStop(true);           // Arrêter le timer localement
      // setStart(false);         // Mettre à jour l'état de démarrage
      setFormattedTime("00:00:00"); // Réinitialiser le timer
      setStart(false); // Arrêter le timer
      setStop(true); // Arrêter le timer
    } catch (error) {
      console.error('Erreur lors de l\'arrêt du timer', error);
    }
  };
 
//-----------------FIN TIMER--------------------------------------------------------------




//-------------PRODUCTION--------------------------------------------------------------
 // Fecth Data pour la production
  const [articles, setArticles] = useState<Article[] | null>(null);
  const [ machines, setMachines] = useState<Machine[] | null>([]);
  const [production, setProduction]= useState<ArticleProduction[] | null>(null);

    // Lire le timerId depuis le localStorage lors du chargement initial
    useEffect(() => {
      const storedTimerId = localStorage.getItem("timerId");
      if (storedTimerId) {
        setTimerId(Number(storedTimerId)); // Convertir la chaîne en nombreeeeee
      }
    }, []);
      // Synchroniser le timerId dans le localStorage lorsqu'il change
  useEffect(() => {
    if (timerId !== null && timerId !== 0) {
      localStorage.setItem("timerId", timerId.toString());
    }
  }, [timerId]);
  // FETCH DATA Centre, SideBar et Header

    const fetchData = useCallback(async (timerId: number) => {
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
      // console.log("ARTICLES DANS CONTEXT A -----------------------------",articles);
      setMachines(data.data.machines);
      // console.log("MACHINES DANS CONTEXT A -----------------------------",machines);
    
      setProduction(data.data.productions);
      // console.log("LA PRODUCTION DANS CONTEXT A  -----------------------------",production);
    } catch (error) {
      console.error("Erreur lors du chargement des données :", error);
    }
  }, []);
  // console.log("LA PRODUCTION DANS CONTEXT A  -----------------------------",production);
 // Exécuter fetchData à chaque changement de timerId( Initial)
  useEffect(() => {
    if (timerId !== null && !Number.isNaN(timerId)) {
      fetchData(timerId);
    }else{
      fetchTodayTimer();
      const storedTimerId = localStorage.getItem("timerId");
      fetchData(Number(storedTimerId));
    }
  }, [timerId, fetchData]);
  
  // Écouter les événements de mise à jour de la production
  useEffect(() => {
    // Écouter les événements de mise à jour de la production
    socket.on('productionUpdated', (data: { timerId?: number } = {}) => {
      // Utilisation de timerId par défaut si data.timerId est indéfini
      const effectiveTimerId = data.timerId ?? timerId;
    
      // La condition passe directement si effectiveTimerId est égal à timerId
      if (effectiveTimerId != null && effectiveTimerId === timerId) {
        fetchData(effectiveTimerId);
      }
    });
    
    
  
    return () => {
      // Nettoyer les écouteurs Socket.IO
      socket.off('productionUpdated');
    };
  }, [timerId, fetchData]);

  const fetchTodayTimer = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const csrfToken = localStorage.getItem('csrfToken');
      const response = await axios.get(`${apiUrl}/timers/today`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'x-csrf-token': csrfToken,
          'Content-Type': 'application/json',
        },
      });
      // console.log("TIMER D'AUJOURD'HUI ---------------------------",response.data.timerId);
      // Mise à jours de la valeur du timer d'aujourd'hui
      setTimerId(response.data.timerId);
      const localStorageIdTimer = response.data.timerId
      localStorage.setItem('timerId', JSON.stringify(localStorageIdTimer));
      // console.log("La nouvelle valeur du Timer d'aujourd'hui est ---------------------------",timerId);
    } catch (error) {
      console.error("Erreur lors du chargement du timer d'aujourd'hui :", error);
    }
  };

 
//-----------------FIN PRODUCTION--------------------------------------------------------


  return (
    <TimerContext.Provider
      value={{
        hours,
        minutes,
        seconds,
        // isRunning,
        formattedTime,
        start,
        timeBegin,
        timerId,
        stop,
        articles,
        machines,
        production,
        // handleStartTimer,
        // handleStopTimer,
        setFormattedTime,
        setStart,
        setTimeBegin,
        setStop,
        setTimerId,
        setHours,
        setMinutes,
        setSeconds,
        handleStopTimer,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
};

// Le hook useTimer pour utiliser le contexte
export const useTimer = () => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error("useTimer must be used within a TimerProvider");
  }
  return context;
};
