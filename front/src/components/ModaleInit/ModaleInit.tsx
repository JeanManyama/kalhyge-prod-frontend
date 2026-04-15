import axios from "axios";
import { useEffect, useState } from "react";
import { FaChartLine, FaCheck, FaClock, FaTimes } from "react-icons/fa";
import {
  Button,
  Form,
  FormGroup,
  FormInput,
  FormSelect,
  Modal,
  ModalActions,
  ModalContent,
  ModalDescription,
  ModalHeader,
} from "semantic-ui-react";
import io from "socket.io-client";
import type { Article, Machine, Timer } from "../@types";
import { useTimer } from "../TimerContext/TimerContext"; // Importer le hook pour accéder au contexte
import "./Modale.scss";

// Connexion au serveur WebSocket
const socket = io(import.meta.env.VITE_API_URL);

// Définition de l'interface pour le type des objets dans le tableau de production
interface ProductionData {
  articleId: number;
  machine_id: number;
  quantity_product_aff: number;
  objective: number;
}

interface ModaleInitProps {
  user_id: number | undefined;
  articles: Article[] | null;
  machines: Machine[] | null;
  openInitialisation: boolean;
  setOpenInitialisation: React.Dispatch<React.SetStateAction<boolean>>;
}

function capitalizeFirstLetter(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

function ModaleInit({
  articles,
  // setArticles,
  machines,
  // setStart,
  openInitialisation,
  setOpenInitialisation,
  user_id,
}: ModaleInitProps) {
  const {
    setHours,
    setMinutes,
    setSeconds,
    setFormattedTime,
    setTimerId,
    setStart,
    setTimeBegin,
  } = useTimer();

  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false); // État pour distinguer succès et erreur
  const [messageModal, setMessageModal] = useState<string | null>(null); // Message dynamique
  let [timeInSeconds] = useState<number>(0);
  // const [productionData, setProductionData] = useState<ProductionData[]>([]);
  const apiUrl = import.meta.env.VITE_API_URL;

  let [newTimer] = useState<Timer | null>(null);

  useEffect(() => {
    if (articles && machines) {
      const initialInputs: Record<string, string> = {};

      // biome-ignore lint/complexity/noForEach: <explanation>
      articles.forEach((article) => {
        // biome-ignore lint/complexity/noForEach: <explanation>
        machines.forEach((machine) => {
          initialInputs[`${article.id}-${machine.id}-initial`] = "0";
          initialInputs[`${article.id}-${machine.id}-objectif`] = "0";
        });
      });

      initialInputs["production-hour"] = "0";
      initialInputs["production-minute"] = "0";

      setInputs(initialInputs);
    }
  }, [articles, machines]);

  if (!openInitialisation) {
    return null;
  }

  const handleInputChange = (key: string, value: string) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
    setShowErrorModal(false);
  };
  // Validation des données du formulaire
  const validateForm = () => {
    const expectedFields: string[] = [];

    // biome-ignore lint/complexity/noForEach: <explanation>
    articles?.forEach((article) => {
      // biome-ignore lint/complexity/noForEach: <explanation>
      machines?.forEach((machine) => {
        expectedFields.push(`${article.id}-${machine.id}-initial`);
        expectedFields.push(`${article.id}-${machine.id}-objectif`);
      });
    });

    expectedFields.push("production-hour", "production-minute");

    for (const field of expectedFields) {
      if (
        inputs[field] === undefined ||
        inputs[field] === null ||
        inputs[field].trim() === ""
      ) {
        return false;
      }
    }

    return true;
  };

  // Lancement du minuteur

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    // console.log("ON EST LAAAAAA--------------------------------------- : ", );
    if (!validateForm()) {
      setMessageModal(
        "Erreur sur le formulaire. Veuillez remplir tous les champs correctement.",
      );
      setIsSuccess(false);
      setShowErrorModal(true);
      return;
    }

    const productionHour = Number.parseInt(
      inputs["production-hour"] || "0",
      10,
    );
    const productionMinute = Number.parseInt(
      inputs["production-minute"] || "0",
      10,
    );

    // Calcul du temps total en secondes
    timeInSeconds = productionHour * 3600 + productionMinute * 60;

    // console.log("Le temps en secondes est-------------------------------------------------------------------- : ", timeInSeconds);

    // Conversion en heures, minutes, secondes
    const calculatedHours = Math.floor(timeInSeconds / 3600);
    const calculatedMinutes = Math.floor((timeInSeconds % 3600) / 60);
    const calculatedSeconds = timeInSeconds % 60;

    if (productionHour === 0 && productionMinute === 0) {
      setMessageModal("Erreur : le temps ne peut pas être nul.");
      setIsSuccess(false);
      setShowErrorModal(true);
      return;
    }

    // Formater le temps
    const formattedTime = `${calculatedHours.toString().padStart(2, "0")}:${calculatedMinutes
      .toString()
      .padStart(2, "0")}:${calculatedSeconds.toString().padStart(2, "0")}`;

    setFormattedTime(formattedTime);

    const hasZeroObjective = articles?.some((article) => {
      const articleObjective = inputs[`${article.id}-objectif`];
      return Number.parseInt(articleObjective || "0", 10) === 0;
    });

    if (hasZeroObjective) {
      setMessageModal(
        "Erreur : Il y a au moins un champ objectif qui est à 0.",
      );
      setIsSuccess(false);
      setShowErrorModal(true);
      return;
    }

    let newProductionData: ProductionData[] = [];
    // biome-ignore lint/complexity/noForEach: <explanation>
    articles?.forEach((article) => {
      const articleObjective = inputs[`${article.id}-objectif`];
      // biome-ignore lint/complexity/noForEach: <explanation>
      machines?.forEach((machine) => {
        const initialQuantity = inputs[`${article.id}-${machine.id}-initial`];
        if (initialQuantity && articleObjective) {
          newProductionData.push({
            articleId: article.id,
            machine_id: machine.id,
            quantity_product_aff: Number.parseInt(initialQuantity),
            objective: Number.parseInt(articleObjective),
          });
        }
      });
    });

    // console.log(   "Le Tableau avant tri: --------------------------------",newProductionData);

    let filteredProductionData = Object.values(
      newProductionData.reduce<Record<number, ProductionData[]>>(
        (acc, current) => {
          // Regrouper par `articleId`
          if (!acc[current.articleId]) {
            acc[current.articleId] = [];
          }
          acc[current.articleId].push(current);
          return acc;
        },
        {},
      ),
    ).flatMap((group) => {
      // Pour chaque groupe (`articleId`), filtrer les objets
      const withPositiveQuantity = group.filter(
        (item) => item.quantity_product_aff > 0,
      );
      return withPositiveQuantity.length > 0
        ? withPositiveQuantity // Garder tous ceux avec `quantity_product_aff > 0`
        : [group[0]]; // Si tous sont `0`, garder un seul (par exemple, le premier)
    });

    const isAnyInitialQuantityGreaterThanOrEqualToObjective =
      newProductionData.some(
        (item) => item.quantity_product_aff >= item.objective,
      );

    if (isAnyInitialQuantityGreaterThanOrEqualToObjective) {
      setMessageModal(
        "Erreur : Une quantité initiale est supérieure ou égale à l'objectif.",
      );
      setIsSuccess(false);
      setShowErrorModal(true);
      return;
    }

    try {
      //----------------------------------------------------------------------
      // Iserer le timer
      newTimer = await createTimer(user_id);
      if (!newTimer) {
        setMessageModal("Erreur : Le timer n'a pas pu être créé.");
        setIsSuccess(false);
        setShowErrorModal(true);
        return;
      }

      // Mettre à jour les états du contexte Timer
      setHours(calculatedHours);
      setMinutes(calculatedMinutes);
      setSeconds(calculatedSeconds);

      const formattedTime = `${calculatedHours.toString().padStart(2, "0")}:${calculatedMinutes.toString().padStart(2, "0")}:${calculatedSeconds.toString().padStart(2, "0")}`;
      setFormattedTime(formattedTime);

      setTimeBegin(new Date(newTimer.time_begin));
      setTimerId(newTimer.id);
      setStart(true); // Démarre directement le timer

      socket.emit("startTimer", {
        timerId: newTimer.id,
        timeBegin: newTimer.time_begin,
      });
      //----------------------------------------------------------------------

      // Iserer les objectifs des articles
      //  console.log("NOUS SOMMES AVANT OBJECTIFS--------------------------------------------- :", filteredProductionData);
      await Promise.all(
        filteredProductionData.map((item) =>
          handleUpdateObjective(item.articleId, item.objective),
        ),
      );

      handleSuccess(); // Appelle la gestion du succès
      // sTableau filtré ---------------------------etOpenInitialisation(false)
      // console.log(" :", filteredProductionData);
      // Insertion des données de production avant reinitialisation

      // ICI INSERER LES DONNEES DE PRODUCTION QUI ONT LES QUANTITES SUPPERIEURES A 0  !!!
      // Nouveau tri : garder uniquement ceux avec `quantity_product_aff > 0`
      let finalFilteredProductionData = filteredProductionData.filter(
        (item) => item.quantity_product_aff > 0,
      );

      // Insertion des données de production après le nouveau tri
      // console.log("Tableau final filtré --------------------------------------------- :", finalFilteredProductionData);
      await Promise.all(
        finalFilteredProductionData.map((item) =>
          handleUpdateProduction(
            item.articleId,
            item.machine_id,
            item.quantity_product_aff,
            newTimer?.id || 0,
          ),
        ),
      );

      // Réinitialisation des variables
      newProductionData = [];
      filteredProductionData = [];
      finalFilteredProductionData = [];
      // console.log("Variables réinitialisées :", newProductionData, filteredProductionData, finalFilteredProductionData);
    } catch (error) {
      setMessageModal("Erreur inconnue lors de la création du timer.");
      setIsSuccess(false);
      setShowErrorModal(true);
    }
  };

  // Insertion des données initiales de production
  const handleUpdateProduction = async (
    articleId: number,
    machineId: number,
    quantity: number,
    timerId: number,
  ) => {
    if (!quantity || !machineId || !articleId || !timerId) {
      setMessageModal(
        "Erreur sur le formulaire. Veuillez remplir tous les champs correctement.",
      );
      setIsSuccess(false);
      setShowErrorModal(true);
      return;
    }
    try {
      const response = await axios.post(
        `${apiUrl}/productions/articles/${articleId}`,
        {
          machine_id: machineId,
          quantity_product_aff: quantity,
          timer_id: timerId,
        },
      );

      const initProd = response.data;

      if (!initProd) {
        setMessageModal("Erreur lors de l'initialisation des données.");
        setIsSuccess(false);
        setShowErrorModal(true);
        return;
      }
      // setArticles(response.data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 500) {
        const serverMessage =
          error.response.data?.message || "Erreur inconnue sur le serveur.";
        setMessageModal(serverMessage);
      }
      return null;
    }
  };
  //insertion des objectifs des articles
  const handleUpdateObjective = async (id: number, objective: number) => {
    if (!objective || !id) {
      setMessageModal("L'objectif ne peut pas être vide ou nul.");
      setIsSuccess(false);
      setShowErrorModal(true);
      return;
    }
    // console.log("VALEUR DE L'OBJECTIF EST ---------------: ", objective);
    // Diviser l'objectif par 2 et arrondir à l'entier le plus proche(objectif pour une équipe)
    const objectiveEquipe = Math.round(objective / 2);
    // console.log("VALEUR DES OBJECTIFS POUR LES EQUIPES --------------: ", objectiveEquipe);
    try {
      const response = await axios.patch(`${apiUrl}/articles/objective`, {
        id,
        objective: objectiveEquipe,
      });

      const updatedArticle = response.data;

      if (!updatedArticle) {
        setMessageModal("Erreur lors de la modification de l'objectif.");
        setIsSuccess(false);
        setShowErrorModal(true);
        return;
      }
      // console.log("L'OBJECTIF MODIFIER AVEC SUCCES ------------------- :", updatedArticle);
      // setArticles(response.data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 500) {
        const serverMessage =
          error.response.data?.message || "Erreur inconnue sur le serveur.";
        setMessageModal(serverMessage);
      }
      return null;
    }
  };

  // Quand tout se passe bien
  const handleSuccess = () => {
    // if (newTimer) {
    //   setTimeBegin(new Date(newTimer.time_begin)); // Conversion explicite
    //   setTimerId(newTimer.id);
    // } else {
    //   setTimeBegin(null);
    //   setTimerId(null);
    // }
    // setStart(true);
    setMessageModal("La production est lancée avec succès.");
    setIsSuccess(true);
    setShowErrorModal(true);
    setTimeout(() => {
      setShowErrorModal(false);
      setOpenInitialisation(false);
    }, 2000);
  };

  // Insertion deu Timer
  const createTimer = async (
    userId: number | undefined,
  ): Promise<Timer | null> => {
    try {
      if (!userId) {
        return null;
      }
      const accessToken = localStorage.getItem("accessToken");
      const csrfToken = localStorage.getItem("csrfToken");
      const response = await axios.post(
        `${apiUrl}/timers`,
        {
          user_id: userId,
          durationTimer: timeInSeconds,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "x-csrf-token": csrfToken,
            "Content-Type": "application/json",
          },
        },
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 500) {
        const serverMessage =
          error.response.data?.message || "Erreur inconnue sur le serveur.";
        setMessageModal(serverMessage);
      }
      return null;
    }
  };

  return (
    <>
      <Modal
        onClose={() => setOpenInitialisation(false)}
        open={openInitialisation}
      >
        <ModalHeader>Admin / Initialisation</ModalHeader>
        <ModalContent image>
          <ModalDescription>
            <div className="modaleInitCard">
              <h4 className="text-2xl font-bold text-center mb-6">
                <FaChartLine className="inline-block text-blue-500 mr-2" />
                Initialisation
              </h4>
              <div className="modaleInitCard-form">
                <Form
                  className="modaleInitCard-form-form"
                  onSubmit={handleSubmit}
                >
                  {articles?.map((article) => (
                    <div
                      key={article.id}
                      className="border-b border-gray-300 pb-4 mb-6"
                    >
                      <h4 className="text-xl font-semibold text-gray-800 mb-4">
                        {article.name.toUpperCase()}
                      </h4>
                      <div className="grid grid-cols-1 gap-4">
                        {machines?.map((machine) => (
                          <FormGroup
                            widths={3}
                            key={machine.id}
                            className=" items-center"
                          >
                            <p className="">
                              {capitalizeFirstLetter(machine.name)}
                            </p>
                            <FormInput
                              placeholder="Initiale"
                              value={
                                inputs[`${article.id}-${machine.id}-initial`] ||
                                ""
                              }
                              onChange={(e) =>
                                handleInputChange(
                                  `${article.id}-${machine.id}-initial`,
                                  e.target.value,
                                )
                              }
                              style={{
                                height: "20px",
                                width: "100%",
                                padding: "0px", // Réduire le padding à un minimum (ou mets 0 si nécessaire)
                                margin: "0", // Supprimer les marges
                                fontSize: "12px", // Diminue la taille de la police pour économiser de l'espace

                                boxSizing: "border-box",
                                border: "none",
                              }}
                            />
                          </FormGroup>
                        ))}
                      </div>
                      <FormGroup
                        widths={3}
                        key={`objective-${article.id}`}
                        className="centered-field mt-4"
                      >
                        <FormInput
                          placeholder="Objectif de la journée"
                          value={inputs[`${article.id}-objectif`] || ""}
                          onChange={(e) =>
                            handleInputChange(
                              `${article.id}-objectif`,
                              e.target.value,
                            )
                          }
                          className="rounded-lg border-gray-300 shadow-sm focus:ring focus:ring-blue-300"
                        />
                      </FormGroup>
                    </div>
                  ))}

                  <h4 className="text-xl font-semibold text-gray-800 mb-4">
                    <FaClock className="inline-block text-yellow-500 mr-2" />
                    Temps de production
                  </h4>
                  <FormGroup widths={2} className="grid grid-cols-2 gap-4">
                    <FormSelect
                      fluid
                      label="Heure"
                      placeholder="1h"
                      options={[
                        { key: "0", text: "0", value: "0" },
                        { key: "1", text: "1", value: "1" },
                        { key: "2", text: "1", value: "2" },
                        { key: "3", text: "3", value: "3" },
                        { key: "4", text: "4", value: "4" },
                        { key: "5", text: "5", value: "5" },
                        { key: "6", text: "6", value: "6" },
                        { key: "7", text: "7", value: "7" },
                        { key: "8", text: "8", value: "8" },
                      ]}
                      value={inputs["production-hour"] || ""}
                      onChange={(_e, { value }) =>
                        handleInputChange("production-hour", value as string)
                      }
                      className="rounded-lg border-gray-300 shadow-sm focus:ring focus:ring-blue-300"
                    />
                    <FormSelect
                      fluid
                      label="Minute"
                      placeholder="30 min"
                      options={[
                        { key: "0", text: "0", value: "0" },
                        { key: "5", text: "5", value: "5" },
                        { key: "10", text: "10", value: "10" },
                        { key: "15", text: "15", value: "15" },
                        { key: "20", text: "20", value: "20" },
                        { key: "25", text: "25", value: "25" },
                        { key: "30", text: "30", value: "30" },
                        { key: "35", text: "35", value: "35" },
                        { key: "40", text: "40", value: "40" },
                        { key: "45", text: "45", value: "45" },
                        { key: "50", text: "50", value: "50" },
                        { key: "55", text: "55", value: "55" },
                      ]}
                      value={inputs["production-minute"] || ""}
                      onChange={(_e, { value }) =>
                        handleInputChange("production-minute", value as string)
                      }
                      className="rounded-lg border-gray-300 shadow-sm focus:ring focus:ring-blue-300"
                    />
                  </FormGroup>

                  <div className="flex justify-end space-x-4 mt-6">
                    <Button
                      color="red"
                      onClick={() => setOpenInitialisation(false)}
                      className="flex items-center px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-300"
                    >
                      <FaTimes className="mr-2" />
                      Fermer
                    </Button>
                    <Button
                      type="submit"
                      className="flex items-center px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                    >
                      <FaCheck className="mr-2" />
                      Créer Production
                    </Button>
                  </div>
                </Form>
              </div>
            </div>
          </ModalDescription>
        </ModalContent>
      </Modal>

      {/* Modal dynamique */}
      <Modal
        size="small"
        open={showErrorModal}
        onClose={() => {
          setMessageModal(null);
          setShowErrorModal(false);
        }}
      >
        <ModalHeader>{isSuccess ? "Succès" : "Erreur"}</ModalHeader>
        <ModalContent
          className={
            isSuccess ? "success-modal-content" : "error-modal-content"
          }
        >
          <p>{messageModal}</p>
        </ModalContent>
        <ModalActions>
          <Button
            onClick={() => setShowErrorModal(false)}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition duration-300"
          >
            OK
          </Button>
        </ModalActions>
      </Modal>
    </>
  );
}

export default ModaleInit;
