import { useState } from 'react';
import {
  Modal,
  ModalHeader,
  ModalContent,
  ModalActions,
  Button,
  Input,
} from 'semantic-ui-react';
import  type { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import './Historique.scss';

interface HistoriqueArticle {
  name: string;
  objective_historical : number;
  total_quantity_all: number;
  total_quantity_all_reject: number;
  total_quantity_valid: number;
  date: string;
}

interface HistoriqueMachine {
  name: string;
  total_quantity_all: number;
  total_quantity_all_reject: number;
  total_quantity_valid: number;
  date: string;
}

interface HistoriqueProps {
  openHistorique: boolean;
  setOpenHistorique: React.Dispatch<React.SetStateAction<boolean>>;
}

function Historique ({
  setOpenHistorique,
  openHistorique,
}: HistoriqueProps) {
  const [searchDate, setSearchDate] = useState<string>('');
  const [filteredArticles, setFilteredArticles] = useState<HistoriqueArticle[]>(
    []
  );
  const [filteredMachines, setFilteredMachines] = useState<
    HistoriqueMachine[]
  >([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [deleting, setDeleting] = useState<boolean>(false);
  const [openConfirmModal, setOpenConfirmModal] = useState<boolean>(false);
  const [period, setPeriod] = useState('production'); // Valeur par défaut
  const [productionTime, setProductionTime] = useState<string | null>(null);


  const navigate = useNavigate();

  const apiUrl = import.meta.env.VITE_API_URL;

  const handleClose = () => {
    setOpenHistorique(false);
    navigate('/home');
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchDate(e.target.value);
  };

  const fetchData = async () => {
    if (!searchDate) {
      setError('Veuillez sélectionner une date.');
      return;
    }
    if (!period) {
      setError('Veuillez sélectionner une période.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await axios.post(
        `${apiUrl}/productions/historique`,
        {
          date: searchDate,
          period: period, 
        }
      );
      // console.log("les articles sont------------------:",response.data.data.articles);
     
      if (response.data.status === 'success') {
        setFilteredArticles(response.data.data.articles);
        setFilteredMachines(response.data.data.machines);
        setProductionTime(response.data.data.productionTime || null);
        console.log("lEMPS DE PROD------------------:",response.data.data.productionTime);
      } else {
        setError('Erreur lors de la récupération des données.');
      }
    } catch {
      setError('Erreur de connexion au serveur.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!searchDate) {
      setError('Veuillez sélectionner une date.');
      return;
    }
    if (!period) {
      setError('Veuillez sélectionner une période.');
      return;
    }
  
    try {
      setDeleting(true);
      setError('');
      const response = await axios.delete(
        `${apiUrl}/productions/historique`,
        {
          data: { date: searchDate, period: period, },
        }
      );
  
      if (response.data.status === 'success') {
        setFilteredArticles([]);
        setFilteredMachines([]);
        setError('Historique supprimé avec succès.');
      } else {
        setError('Erreur lors de la suppression des données.');
      }
    } catch (error: unknown) {
      // Vérifiez si l'erreur est une instance d'AxiosError
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ message?: string }>;
        setError(axiosError.response?.data.message || 'Erreur inconnue.');
      } else {
        // Une autre erreur, non liée à Axios
        setError('Une erreur s’est produite. Veuillez réessayer.');
      }
    } finally {
      setDeleting(false);
      setOpenConfirmModal(false);
    }
  };
  

  const handleOpenConfirmModal = () => {
    if (!searchDate) {
      setError('Veuillez sélectionner une date.');
      return;
    }
    setOpenConfirmModal(true);
  };

  if (!openHistorique) {
    return null;
  }

  return (
    <>
      <Modal open={openHistorique} onClose={handleClose}>
        <ModalHeader>Statistiques</ModalHeader>
        <ModalContent>
          <div className="historique-content">
            <div className="search-date">
              {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
              <label>Date: {"  "}  </label>
              <Input
                type="date"
                value={searchDate}
                onChange={handleDateChange}
                placeholder="Sélectionnez une date"
              />
              {/* Sélecteur de période */}
            {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
            <label style={{ marginLeft: '10px' }}>Période:</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)} // Fonction pour gérer la sélection
              style={{ marginLeft: '10px' }}
            >
              <option value="matin">Matin</option>
              <option value="aprem">Après-midi</option>
              <option value="production">Production</option>
            </select>
              <Button
                onClick={fetchData}
                disabled={loading}
                style={{ marginLeft: '10px' }}
              >
                Rechercher
              </Button>
              {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
              <button
                className="red-button"
                onClick={handleOpenConfirmModal} // Appel de la vérification avant d'ouvrir la modale
                disabled={deleting}
                style={{ marginLeft: '10px' }}
              >
                {deleting ? 'Suppression en cours...' : "Supprimer l'historique"}
              </button>
            </div>

            {loading && <p>Chargement des données...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <div className="group">
  <h3>Articles</h3>
  {productionTime && (
    <p style={{ fontWeight: "bold" }}>
      Temps de production : {productionTime}
    </p>
  )}
  <table>
    <thead>
      <tr>
        <th>Nom</th>
        <th>Objectif</th>
        <th>Volume</th>
        <th>Rejet</th>
        <th>Production</th>
      </tr>
    </thead>
    <tbody>
      {filteredArticles.length > 0 ? (
        filteredArticles.map((article) => (
          <tr key={article.name}>
            <td>{article.name}</td>
            <td>{article.objective_historical || 'N/A'}</td>
            <td>{article.total_quantity_all}</td>
            <td>{article.total_quantity_all_reject}</td>
            <td>{article.total_quantity_valid}</td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan={5}>Aucun résultat pour cette date</td>
        </tr>
      )}
    </tbody>
  </table>
</div>




            <div className="group">
              <h3>Machines</h3>
              <table>
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Volume</th>
                    <th>Rejet</th>
                    <th>Production</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMachines.length > 0 ? (
                    filteredMachines.map((machine) => (
                      <tr key={machine.name}>
                        <td>{machine.name}</td>
                        <td>{machine.total_quantity_all}</td>
                        <td>{machine.total_quantity_all_reject}</td>
                        <td>{machine.total_quantity_valid}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4}>Aucun résultat pour cette date</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </ModalContent>
        <ModalActions>
          <Button onClick={handleClose}>Retour</Button>
        </ModalActions>
      </Modal>

      <Modal open={openConfirmModal} onClose={() => setOpenConfirmModal(false)}>
        <ModalHeader>Confirmation</ModalHeader>
        <ModalContent>
          <p>
            Êtes-vous sûr de vouloir supprimer toutes les données pour cette
            date ?
          </p>
        </ModalContent>
        <ModalActions>
          <Button onClick={() => setOpenConfirmModal(false)}>Annuler</Button>
          <Button color="red" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Suppression en cours...' : 'Confirmer'}
          </Button>
        </ModalActions>
      </Modal>
    </>
  );
};

export default Historique;
