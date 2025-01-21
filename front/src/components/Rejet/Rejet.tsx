import {
  Form,
  FormGroup,
  FormInput,
  Button,
  FormSelect,
  Modal,
  ModalActions,
  ModalContent,
  ModalDescription,
  ModalHeader,
} from "semantic-ui-react";
import { useTimer } from '../TimerContext/TimerContext'; 
import { Trash, Edit } from "react-feather";
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios'; // Assurez-vous d'avoir axios installé pour les requêtes HTTP
import "./Rejet.scss";

interface RejetProps {
  timerId: number|null;
  openRejet: boolean;
  setOpenRejet: React.Dispatch<React.SetStateAction<boolean>>;
}

interface Reject {
  id: number;
  created_at: string;
  quantity_reject_aff: number;
  articles: { name: string; id: number };
  machines: { name: string; id: number };
}

interface Option {
  key: number;
  value: number;
  text: string;
}

function Rejet({ setOpenRejet, openRejet }: RejetProps) {
  const [editingProduction, setEditingProduction] = useState<number | null>(null);
const [editingQuantities, setEditingQuantities] = useState<{ [key: number]: string }>({});
const [editingArticle, setEditingArticle] = useState<{ [key: number]: number | null }>({});
const [editingMachine, setEditingMachine] = useState<{ [key: number]: number | null }>({});
const {   timerId } = useTimer();

//suppression
const [deletingReject, setDeletingReject] = useState<number | null>(null); // Pour suivre quel rejet est en cours de suppression
  

const [rejects, setRejects] = useState<Reject[]>([]);
  // const [editMode, setEditMode] = useState<{ [key: number]: boolean }>({});
  const [articles, setArticles] = useState<Option[]>([]);
  const [machines, setMachines] = useState<Option[]>([]);
  const [quantity, setQuantity] = useState<number | string>("");
  const [articleId, setArticleId] = useState<number | null>(null);
  const [machineId, setMachineId] = useState<number | null>(null);
  const [error, setError] = useState<string>(""); // État pour gérer les erreurs
  const [successMessage, setSuccessMessage] = useState<string>(""); // État pour gérer le message de succès

  const apiUrl = import.meta.env.VITE_API_URL;

  const navigate = useNavigate();

  const handleClose = () => {
    setOpenRejet(false); // Ferme le modal
    navigate('/home'); // Redirige vers /home
  };

  // Charger les données des rejets, articles et machines lorsque le modal est ouvert
  useEffect(() => {
    if (openRejet) {
      axios.get(`${apiUrl}/productions/rejet/${timerId}`) // L'URL de votre API backend
        .then((response) => {
          console.log("l'Objet Rejets récupérés a ----------:", response.data);
          setRejects(response.data.rejects);

          // Charger les articles et les machines
          const articleOptions = response.data.allArticles.map((article: { id: number; name: string }) => ({
            key: article.id,
            value: article.id,
            text: article.name,
          }));

          const machineOptions = response.data.allMachines.map((machine: { id: number; name: string }) => ({
            key: machine.id,
            value: machine.id,
            text: machine.name,
          }));

          setArticles(articleOptions);
          setMachines(machineOptions);
        })
        .catch((error) => {
          console.error("Erreur lors de la récupération des rejets:", error);
        });
    }
  }, [openRejet, timerId]);

  // Géstion de l'édition d'un rejet
  // const handleEditToggle = (id: number) => {
  //   setEditMode(prevState => ({ ...prevState, [id]: !prevState[id] }));
  // };
  const handleQuantityChange = (id: number, value: string) => {
    setEditingQuantities((prev) => ({ ...prev, [id]: value }));
  };
  const handleArticleChange = (id: number, value: number) => {
    setEditingArticle((prev) => ({ ...prev, [id]: value }));
  };
  
  const handleMachineChange = (id: number, value: number) => {
    setEditingMachine((prev) => ({ ...prev, [id]: value }));
  };
  
  // Gerer la modification d'un rejet
  type Payload =
  | { actionType: 'updateQuantity'; newQuantity: number }
  | { actionType: 'updateArticle'; articleId: number; }
  | { actionType: 'updateMachine'; machineId: number };

  const handleSaveEdit = async (id: number, payload: Payload) => {
  try {
    let requestBody: Record<string, unknown> = { rejectId: id, timer_id: timerId };

    if (payload.actionType === 'updateArticle') {
      const reject = rejects.find((r) => r.id === id);
      if (reject) {
        requestBody = {
          ...requestBody,
          actionType: 'updateArticle',
          articleId: payload.articleId,
          quantity_reject_aff: reject.quantity_reject_aff,
          machine_id: reject.machines.id,
        };
      }
    } else if (payload.actionType === 'updateMachine') {
      const reject = rejects.find((r) => r.id === id);
      if (reject) {
        requestBody = {
          ...requestBody,
          actionType: 'updateMachine',
          machineId: payload.machineId,
          quantity_reject_aff: reject.quantity_reject_aff,
          article_id: reject.articles.id,
        };
      }
    } else if (payload.actionType === 'updateQuantity') {
      requestBody = {
        ...requestBody,
        actionType: 'updateQuantity',
        newQuantity: payload.newQuantity,
      };
    }

    console.log("requestBody envoyé est -------------------", requestBody);
    const response = await axios.patch(`${apiUrl}/productions/rejet`, requestBody);

    if (response.status === 204) {
      setError("Aucune modification apportée, vérifiez les règles.");
      setTimeout(() => setError(""), 3000);
      return;
    }

    if (response.status === 404) {
      setError("Erreur lors de la modification, rejet non trouvé.");
      setTimeout(() => setError(""), 3000);
      return;
    }

    console.log(`Modification réussie pour l'action ${payload.actionType} sur le rejet ${id}:`, response.data);

    // Mise à jour des rejets après modification
    setRejects((prevRejects) =>
      prevRejects.map((reject) =>
        reject.id === id
          ? {
              ...reject,
              ...(payload.actionType === 'updateQuantity' && { quantity_reject_aff: payload.newQuantity }),
              ...(payload.actionType === 'updateArticle' && {
                articles: {
                  id: payload.articleId,
                  name: articles.find((a) => a.key === payload.articleId)?.text || "Article inconnu",
                },
              }),
              ...(payload.actionType === 'updateMachine' && {
                machines: {
                  id: payload.machineId,
                  name: machines.find((m) => m.key === payload.machineId)?.text || "Machine inconnue",
                },
              }),
            }
          : reject
      )
    );

    // Réinitialiser uniquement l'état lié au champ modifié
    if (payload.actionType === 'updateArticle') {
      setEditingArticle((prev) => ({ ...prev, [id]: null }));
    } else if (payload.actionType === 'updateMachine') {
      setEditingMachine((prev) => ({ ...prev, [id]: null }));
    } else if (payload.actionType === 'updateQuantity') {
      setEditingQuantities((prev) => ({ ...prev, [id]: "" }));
    }

    setEditingProduction(null);
    setSuccessMessage("Modification réussie.");
    setTimeout(() => setSuccessMessage(""), 3000);
  } catch (err) {
    // Gestion des erreurs
    setError("Erreur lors de la modification.");
    setTimeout(() => setError(""), 3000);

    // Réinitialiser les champs d'édition en cas d'erreur
    setEditingProduction(null);
    setEditingArticle((prev) => ({ ...prev, [id]: null }));
    setEditingMachine((prev) => ({ ...prev, [id]: null }));
  }
};



// Supresssion d'un rejet
const confirmDelete = async () => {
  if (deletingReject === null) return; // Aucun rejet sélectionné

  try {
    // Envoi de l'ID dans le corps de la requête
    const response = await axios.delete(`${apiUrl}/productions/rejet`, {
      data: { id: deletingReject }, // Transmettre l'ID dans req.body
    });

    if (response.status === 204) {
      setError("Aucun rejet trouvé à supprimer.");
      setTimeout(() => setError(""), 3000);
      return;
    }

    // Mise à jour de la liste des rejets après suppression
    setRejects((prevRejects) => prevRejects.filter((reject) => reject.id !== deletingReject));

    setSuccessMessage("Rejet supprimé avec succès.");
    setTimeout(() => setSuccessMessage(""), 3000);
  } catch (error) {
    setError("Erreur lors de la suppression du rejet. Veuillez réessayer.");
    setTimeout(() => setError(""), 3000);
  } finally {
    setDeletingReject(null); // Réinitialiser la modal de suppression
  }
};
// Annuler la suppression
const cancelDelete = () => {
  setDeletingReject(null); // Fermer la modal de suppression
};

// Fonction pour enregistrer un nouveau rejet
  const handleSaveReject = async (event: React.FormEvent) => {
    event.preventDefault();
  
    console.log("machineId est -------------", machineId);
    console.log("articleId est -------------", articleId);
    console.log("quantity est -------------", quantity);
  
    // Vérification des champs requis
    if (!quantity || !articleId || !machineId) {
      setError("Tous les champs doivent être remplis");
      setTimeout(() => setError(""), 3000);
      return;
    }
  
    try {
      // Requête POST pour enregistrer le rejet
      const response = await axios.post(`${apiUrl}/productions/rejet`, {
        machine_id: machineId,
        article_id: articleId,
        quantity_reject_aff: quantity,
        timer_id: timerId,
      });
  
      console.log("Rejet enregistré avec succès:", response.data);
  
      const createdProduction = response.data;
  
      // Trouver les détails de l'article sélectionné
      const selectedArticleDetails = articles.find((option) => option.key === articleId);
  
      // Trouver les détails de la machine sélectionnée
      const selectedMachineDetails = machines.find((option) => option.key === machineId);
  
      // Ajouter les détails de l'article et de la machine dans le rejet créé
      const rejetWithMachineArticle = {
        ...createdProduction,
        machines: {
          id: machineId,
          name: selectedMachineDetails?.text || "Machine Non spécifiée", // Ajout du nom
        },
        articles: {
          id: articleId,
          name: selectedArticleDetails?.text || "Article Non spécifié", // Ajout du nom
        },
      };
  
      // Mettre à jour la liste des rejets
      setRejects((prevRejects) => {
        const updatedRejects = [...prevRejects, rejetWithMachineArticle];
        return updatedRejects.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      });
  
      // Réinitialiser les champs du formulaire
      setError(""); // Réinitialiser l'erreur
      setQuantity(""); // Réinitialiser la quantité
      setArticleId(null); // Réinitialiser l'article sélectionné
      setMachineId(null); // Réinitialiser la machine sélectionnée
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const errorMessage = err.response?.data?.error || "Erreur";
        setError(errorMessage);
      } else {
        setError("Une erreur inattendue est survenue.");
      }
      setTimeout(() => setError(""), 3000);
    }
  };
  
  
;

  if (!openRejet) {
    return null;
  }

  return (
    <Modal
      onClose={handleClose}
      onOpen={() => setOpenRejet(true)}
      open={openRejet}
    >
      <ModalHeader>Rejet / Article</ModalHeader>
      <ModalContent image>
        <ModalDescription>
          <div className="rejet-details">
            <h1>AJOUT D'UN REJET</h1>

            {/* Affichage des erreurs de formulaire */}
            {successMessage && <div className="success-message">{successMessage}</div>}
            {error && <div className="error-message">{error}</div>}

            <div className="list1
            ">
              <Form onSubmit={handleSaveReject}>
                <FormGroup widths={"equal"}>
                  <FormInput
                    label="Quantité rejetée"
                    placeholder="Quantité rejetée"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                  
                  <FormSelect
                    fluid
                    label="Article"
                    placeholder="Sélectionner un article"
                    options={articles}
                    value={articleId ?? ""}
                    onChange={(_e, { value }) => setArticleId(value as number)}
                  />

                  <FormSelect
                    fluid
                    label="Machine"
                    placeholder="Sélectionner une machine"
                    options={machines}
                    value={machineId ?? ""}
                    onChange={(_e, { value }) => setMachineId(value as number)}
                  />

                  <Button type="submit" className="margin-top">Valider</Button>
                </FormGroup>
              </Form>

              {/* Liste des rejets */}
              <ul>
  {rejects.map((reject) => (
    <li key={reject.id} className="item">
      <span>{new Date(reject.created_at).toLocaleTimeString()}</span>

      {/* Quantité */}
{editingProduction === reject.id ? (
  // Mode édition (champ de saisie pour la quantité)
  <form
    onSubmit={(e) => {
      e.preventDefault();
      handleSaveEdit(reject.id, {
        actionType: "updateQuantity",
        newQuantity: Number.parseInt(editingQuantities[reject.id]),
      }).then(() => {
        // Réinitialisation après validation réussie
        setEditingQuantities((prev) => {
          const updated = { ...prev };
          delete updated[reject.id];
          return updated;
        });
        setEditingProduction(null); // Sortir du mode édition
      });
    }}
  >
    <input
      type="number"
      value={editingQuantities[reject.id] || ""}
      onChange={(e) => handleQuantityChange(reject.id, e.target.value)}
    />
    <button type="submit">Valider</button>
  </form>
) : (
  // Affichage normal (quantité sous forme de texte)
  <span>
    {reject.quantity_reject_aff}{" "}
    {/* Bouton pour passer en mode édition */}
    {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
    <button
      className="item-delete"
      onClick={() => setEditingProduction(reject.id)}
    >
      <Edit />
    </button>
  </span>
)}


      {/* Article */}
{editingArticle[reject.id] !== undefined ? (
  <FormSelect
    options={articles}
    value={editingArticle[reject.id] ?? undefined}
    onChange={(_e, { value }) => handleArticleChange(reject.id, value as number)}
  />
) : (
  <span>{reject.articles?.name || "Article inconnu"}</span>
)}
{/* biome-ignore lint/a11y/useButtonType: <explanation> */}
<button
  className="item-delete"
  onClick={() => {
    if (editingArticle[reject.id] !== undefined) {
      // Si on clique sur "Valider", on sauvegarde la modification
      handleSaveEdit(reject.id, {
        actionType: "updateArticle",
        articleId: editingArticle[reject.id] as number,
      }).then(() => {
        // Réinitialiser après sauvegarde réussie
        setEditingArticle((prev) => {
          const updated = { ...prev };
          delete updated[reject.id];
          return updated;
        });
      });
    } else {
      // Si on clique sur "Edit", activer le mode édition
      setEditingArticle((prev) => ({ ...prev, [reject.id]: reject.articles.id }));
    }
  }}
>
  {editingArticle[reject.id] !== undefined ? "Valider" : <Edit />}
</button>


      {/* Machine */}
{editingMachine[reject.id] !== undefined ? (
  <FormSelect
    options={machines}
    value={editingMachine[reject.id] ?? undefined}
    onChange={(_e, { value }) => handleMachineChange(reject.id, value as number)}
  />
) : (
  <span>{reject.machines?.name || "Machine inconnue"}</span>
)}
{/* biome-ignore lint/a11y/useButtonType: <explanation> */}
<button
  className="item-delete"
  onClick={() => {
    if (editingMachine[reject.id] !== undefined) {
      // Sauvegarde
      handleSaveEdit(reject.id, {
        actionType: "updateMachine",
        machineId: editingMachine[reject.id] as number,
      }).then(() => {
        // Réinitialiser
        setEditingMachine((prev) => {
          const updated = { ...prev };
          delete updated[reject.id];
          return updated;
        });
      });
    } else {
      setEditingMachine((prev) => ({ ...prev, [reject.id]: reject.machines.id }));
    }
  }}
>
  {editingMachine[reject.id] !== undefined ? "Valider" : <Edit />}
</button>


     
{/* Bouton pour demander confirmation avant suppression */}

{/* biome-ignore lint/a11y/useButtonType: <explanation> */}
<button
  className="item-delete"
  onClick={() => setDeletingReject(reject.id)} // Ouvrir la modal de suppression
>
  <Trash />
</button>

    </li>
  ))}
</ul>



            </div>
          </div>
        </ModalDescription>
      </ModalContent>

      <ModalActions>
        <Button onClick={handleClose}>Retour</Button>
      </ModalActions>


{/* Modal de suppression */}
      {deletingReject !== null && (
  <Modal
    open={true}
    size="tiny"
    onClose={cancelDelete}
  >
    <ModalHeader>Confirmer la suppression</ModalHeader>
    <ModalContent>
      <p>Êtes-vous sûr de vouloir supprimer ce rejet ? Cette action est irréversible.</p>
    </ModalContent>
    <ModalActions>
      <Button negative onClick={cancelDelete}>
        Annuler
      </Button>
      <Button positive onClick={confirmDelete}>
        Confirmer
      </Button>
    </ModalActions>
  </Modal>
)}

    </Modal>

    


  
);
}

export default Rejet;

