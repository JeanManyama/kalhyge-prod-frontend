import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Modal,
  Button,
  ModalHeader,
  ModalContent,
  ModalDescription,
  ModalActions,
} from "semantic-ui-react";
import { useTimer } from "../TimerContext/TimerContext";
import { useParams } from "react-router-dom";
import "./MachineDetail.scss";

interface MachineDetailProps {
  timerId: number | null;
  openMachineDetail: boolean;
  setOpenMachineDetail: React.Dispatch<React.SetStateAction<boolean>>;
}

interface Article {
  id: number;
  name: string;
  total_quantity: number[];
  total_quantity_reject: number[];
}

interface Inventory {
  id: number;
  name: string;
  articles: Article[];
}

const MachineDetail = ({
  openMachineDetail,
  setOpenMachineDetail,
}: MachineDetailProps) => {
  const { machineId } = useParams<{ machineId: string }>();
  const [machineData, setMachineData] = useState<Inventory | null>(null);
  const [, setLoading] = useState<boolean>(false);
  const [, setError] = useState<string | null>(null);

  const { timerId } = useTimer();
  const apiUrl = import.meta.env.VITE_API_URL;

  //telechargement des images dans assets
  const images: Record<string, { default: string }> = import.meta.glob(
    "../../assets/*.png",
    { eager: true },
  );
  // console.log("Images chargées :", images);

  const getImageForMachine = (machineName: string): string | null => {
    const normalizedMachineName = machineName.toLowerCase();
    // console.log("Nom de la machine normalisé :", normalizedMachineName);
    const imageKey = `../../assets/${normalizedMachineName}.png`;
    if (!images[imageKey]) {
      console.error(`Image introuvable pour la clé : ${imageKey}`);
    }
    return images[imageKey]?.default || null;
  };

  const fetchMachineData = useCallback(
    async (timerId: number) => {
      if (!machineId || !timerId) return;
      // console.log("timerId  AU FRONT -------------------------", timerId);
      try {
        setLoading(true);
        setError(null);

        // Envoi de la requête POST avec machineId et timerId dans le corps de la requête
        const response = await axios.post(
          `${apiUrl}/productions/machines/${machineId}`,
          {
            timer_id: timerId, // Ajoutez le timerId ici
          },
        );
        // console.log("Réponse du serveurr :", response.data);
        // Vous pouvez également récupérer les données envoyées ou la confirmation du serveur
        setMachineData(response.data);
      } catch (err) {
        setError("Erreur lors du chargement des données de la machine.");
      } finally {
        setLoading(false);
      }
    },
    [machineId],
  );

  useEffect(() => {
    if (openMachineDetail && timerId) {
      fetchMachineData(timerId);
    }
  }, [openMachineDetail, timerId, fetchMachineData]);

  if (!openMachineDetail) return null;

  const machineImage = machineData
    ? getImageForMachine(machineData.name.replace(/\s+/g, "-"))
    : null;

  return (
    <Modal
      onClose={() => setOpenMachineDetail(false)}
      onOpen={() => setOpenMachineDetail(true)}
      open={openMachineDetail}
    >
      <ModalHeader>Machine / Détails de la production</ModalHeader>
      <ModalContent image>
        <ModalDescription>
          <div className="machinedetailCard">
            {/* Dynamic Machine Image */}
            <div className="background-image-machine">
              {machineImage ? (
                <img
                  src={machineImage}
                  alt={machineData?.name}
                  className="machine-image"
                />
              ) : (
                <div className="placeholder-image">Image non disponible</div>
              )}
              <div className="text-overlay">
                <h1>{machineData?.name}</h1>
              </div>
            </div>

            {/* Dynamic Articles */}
            <div className="machinedetailCard-form">
              {machineData?.articles.map((article) => {
                // Le plus grand nombre de production
                const totalProduction =
                  article.total_quantity.length > 0
                    ? Math.max(...article.total_quantity)
                    : 0;
                // Le plus grand nombre du rejet
                const totalRejection =
                  article.total_quantity_reject.length > 0
                    ? Math.max(...article.total_quantity_reject)
                    : 0;
                return (
                  <div className="machinedetailCard-form-form" key={article.id}>
                    <div className="machinedetailCard-form-form-title">
                      <h1>{article.name}</h1>
                    </div>
                    <div className="inline">
                      <p>Volume</p>
                      <p>
                        <span>{totalProduction}</span>
                      </p>
                    </div>
                    <div className="inline">
                      <p>Rejet</p>
                      <p>
                        <span>{totalRejection}</span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </ModalDescription>
      </ModalContent>

      <ModalActions>
        <Button onClick={() => setOpenMachineDetail(false)}>Retour</Button>
      </ModalActions>
    </Modal>
  );
};

export default MachineDetail;
