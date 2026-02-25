import axios from "axios";
import { useState } from "react";
import { Edit, Trash } from "react-feather";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Form,
  FormGroup,
  FormInput,
  Modal,
  ModalActions,
  ModalContent,
  ModalDescription,
  ModalHeader,
} from "semantic-ui-react";
import type { Article } from "../@types";
import "./AdminArticle.scss";

interface AdminArticleProps {
  articles: Article[] | null;
  setArticles: React.Dispatch<React.SetStateAction<Article[] | null>>;
  openAdminArticle: boolean;
  setOpenAdminArticle: React.Dispatch<React.SetStateAction<boolean>>;
}

function AdminArticle({
  articles,
  setArticles,
  setOpenAdminArticle,
  openAdminArticle,
}: AdminArticleProps) {
  const navigate = useNavigate();
  const [newArticle, setNewArticle] = useState(""); // Pour ajouter un nouvel article
  const [editingArticleId, setEditingArticleId] = useState<number | null>(null); // Article en cours d'édition
  const [editedArticleName, setEditedArticleName] = useState<string>(""); // Nom modifié de l'article

  // gestion des erreurs sur le formulaire
  const [error, setError] = useState<string>(""); // État pour gérer les erreurs
  const [successMessage, setSuccessMessage] = useState<string>(""); // État pour gérer le message de succ

  // SUPPRESSION D'UN ARTICLE
  const [confirmDeleteModalOpen, setConfirmDeleteModalOpen] = useState(false); // Etat pour ouvrir/fermer le modal de confirmation
  const [articleToDelete, setArticleToDelete] = useState<number | null>(null); // ID de l'article à supprimer

  const apiUrl = import.meta.env.VITE_API_URL;

  // Fonction pour gérer la suppression d'un article
  const handleDeleteArticle = async () => {
    if (articleToDelete === null) {
      setError("ID de l'article non défini !");
      setTimeout(() => setError(""), 3000); // Efface le message d'erreur après 3 secondes
      return;
    }

    try {
      await axios.delete(`${apiUrl}/articles`, {
        data: { id: articleToDelete },
      });

      setArticles(
        (prevArticles) =>
          prevArticles?.filter((article) => article.id !== articleToDelete) ||
          [],
      );

      setConfirmDeleteModalOpen(false);
      setSuccessMessage("Article supprimé avec succès !");
      setTimeout(() => setSuccessMessage(""), 3000); // Efface le message de succès après 3 secondes
    } catch (error) {
      setError("Erreur lors de la suppression de l'article.");
      setTimeout(() => setError(""), 3000); // Efface le message d'erreur après 3 secondes
    }
  };

  // Code pour afficher/fermer le modal de confirmation de suppression
  const openDeleteModal = (id: number) => {
    setArticleToDelete(id); // Enregistre l'ID de l'article à supprimer
    setConfirmDeleteModalOpen(true); // Ouvre le modal de confirmation
  };

  const closeDeleteModal = () => {
    setConfirmDeleteModalOpen(false); // Ferme le modal de confirmation
  };

  // Fonction pour fermer le modal
  const handleClose = () => {
    setOpenAdminArticle(false); // Ferme le modal
    navigate("/home"); // Redirige vers /home
  };

  // Fonction pour ajouter un nouvel article
  const handleAddArticle = async () => {
    setError("");
    setSuccessMessage("");

    if (newArticle.trim() === "") {
      setError("Veuillez saisir un nom d'article valide.");
      setTimeout(() => setError(""), 3000); // Efface le message d'erreur après 3 secondes
      return;
    }

    try {
      const response = await axios.post(`${apiUrl}/articles`, {
        name: newArticle.trim(), // Utilisez "name" pour correspondre au backend
      });

      const createdArticle = response.data;

      setArticles((prevArticles) => [...(prevArticles || []), createdArticle]);

      setSuccessMessage("Article ajouté avec succès !");
      setNewArticle("");

      setTimeout(() => setSuccessMessage(""), 3000); // Efface le message de succès après 3 secondes
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.error || "Erreur lors de l'ajout de l'article.",
        );
      } else {
        setError("Une erreur inattendue s'est produite.");
      }
      setTimeout(() => setError(""), 3000); // Efface le message d'erreur après 3 secondes
    }
  };

  // Fonction pour gérer le changement du nom de l'article
  const handleEditArticleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedArticleName(e.target.value);
  };

  // Fonction pour sauvegarder la modification du nom de l'article
  const handleUpdateArticle = async (id: number) => {
    setError("");
    setSuccessMessage("");

    if (!editedArticleName.trim()) {
      setError("Le nom de l'article ne peut pas être vide.");
      setTimeout(() => setError(""), 3000); // Efface le message d'erreur après 3 secondes
      return;
    }

    try {
      const response = await axios.patch(`${apiUrl}/articles`, {
        id,
        name: editedArticleName.trim(),
      });

      const updatedArticle = response.data;

      setArticles(
        (prevArticles) =>
          prevArticles?.map((article) =>
            article.id === id ? updatedArticle : article,
          ) || [],
      );

      setSuccessMessage("Article modifié avec succès !");
      setTimeout(() => setSuccessMessage(""), 3000); // Efface le message de succès après 3 secondes

      setEditingArticleId(null);
      setEditedArticleName("");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.error ||
            "Erreur lors de la modification de l'article.",
        );
      } else {
        setError("Une erreur inattendue s'est produite.");
      }
      setTimeout(() => setError(""), 3000); // Efface le message d'erreur après 3 secondes
    }
  };

  // Si le modal n'est pas ouvert, on ne retourne rien
  if (!openAdminArticle) {
    return null;
  }

  return (
    <Modal
      onClose={handleClose}
      onOpen={() => setOpenAdminArticle(true)}
      open={openAdminArticle}
    >
      <ModalHeader>Admin / Article</ModalHeader>
      <ModalContent>
        <ModalDescription className="description">
          <div className="produit-details">
            <h1>AJOUT D'UN ARTICLE</h1>

            {/* Formulaire pour ajouter un nouvel article */}
            <div className="list1">
              <Form
                onSubmit={(e) => {
                  e.preventDefault(); // Empêche le rafraîchissement de la page
                  handleAddArticle(); // Appelle la fonction pour envoyer les données au backend
                }}
              >
                <FormGroup className="flexe">
                  <FormInput
                    label="Nouvel article"
                    placeholder="Nom de l'article"
                    value={newArticle}
                    onChange={(e) => setNewArticle(e.target.value)} // Met à jour l'état avec l'entrée utilisateur
                  />
                  <Button type="submit" className="margin-top">
                    Ajouter
                  </Button>
                </FormGroup>
              </Form>

              {error && <p style={{ color: "red" }}>{error}</p>}
              {successMessage && (
                <p style={{ color: "green" }}>{successMessage}</p>
              )}

              {/* Liste dynamique des articles */}
              <Modal
                open={confirmDeleteModalOpen}
                onClose={closeDeleteModal}
                size="small"
              >
                <Modal.Header>Confirmer la suppression</Modal.Header>
                <Modal.Content>
                  <p>
                    Êtes-vous sûr de vouloir supprimer cet article ? Cette
                    action est irréversible.
                  </p>
                </Modal.Content>
                <Modal.Actions>
                  <Button onClick={closeDeleteModal}>Annuler</Button>
                  <Button color="red" onClick={handleDeleteArticle}>
                    Supprimer
                  </Button>
                </Modal.Actions>
              </Modal>

              <ul>
                {/* biome-ignore lint/complexity/useOptionalChain: <explanation> */}
                {articles &&
                  articles.map((article, index) => (
                    <li className="item" key={article.id}>
                      <label
                        className={"item-label item-label--done"}
                        htmlFor={`article-${article.id}`}
                      >
                        {/* Affiche le numéro basé sur l'index */}
                        <span>{index + 1}</span>
                        {editingArticleId === article.id ? (
                          <form
                            className="item-form"
                            onSubmit={(e) => {
                              e.preventDefault();
                              handleUpdateArticle(article.id); // Appelle la fonction de mise à jour
                            }}
                          >
                            <input
                              type="text"
                              value={editedArticleName}
                              onChange={handleEditArticleChange}
                              style={{ width: "auto", marginRight: "0" }}
                            />
                            <button type="submit" className="item-delete">
                              Valider
                            </button>
                          </form>
                        ) : (
                          // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
                          <p
                            onClick={() => {
                              setEditingArticleId(article.id); // Met l'article en mode édition
                              setEditedArticleName(article.name); // Prend la valeur actuelle de l'article
                            }}
                          >
                            {article.name}
                          </p>
                        )}
                      </label>

                      {/* Bouton Éditer */}
                      <button
                        type="button"
                        className="item-delete"
                        onClick={() => {
                          setEditingArticleId(article.id); // Met l'article en mode édition
                          setEditedArticleName(article.name); // Prend la valeur actuelle de l'article
                        }}
                      >
                        <Edit size={20} />
                      </button>

                      {/* Bouton Supprimer */}
                      <button
                        type="button"
                        className="item-delete"
                        onClick={() => openDeleteModal(article.id)}
                      >
                        <Trash size={20} />
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
    </Modal>
  );
}

export default AdminArticle;
