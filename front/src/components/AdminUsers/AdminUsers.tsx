import {
  Button,
  Modal,
  ModalActions,
  ModalContent,
  ModalDescription,
  ModalHeader,
} from "semantic-ui-react";
import { useState, useEffect } from "react";
import { Trash } from "react-feather";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AdminUsers.scss";

interface UserAttributes {
  id: number;
  firstname: string;
  email: string;
  password: string;
  role_id: number;
  refresh_token?: string;
  refresh_token_expires_at?: Date;
}

interface AdminUsersProps {
  openAdminUsers: boolean;
  setOpenAdminUsers: React.Dispatch<React.SetStateAction<boolean>>;
}

function AdminUsers({
  openAdminUsers,
  setOpenAdminUsers,
}: AdminUsersProps) {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserAttributes[] | null>(null); // Liste des utilisateurs
  const [error, setError] = useState<string>(""); 
  const [successMessage, setSuccessMessage] = useState<string>(""); // Message de succès

  // SUPPRESSION D'UN UTILISATEUR
  const [confirmDeleteModalOpen, setConfirmDeleteModalOpen] = useState(false); // Modal de confirmation de suppression
  const [userToDelete, setUserToDelete] = useState<number | null>(null); // Utilisateur à supprimer

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
 fetchUsers();
  }, []);
  
  const fetchUsers = async () => {
    try {
      // console.log("Chargement des utilisateurs...----------------------------------------");
      const response = await fetch(`${apiUrl}/users/admin`); // Remplacez l'URL par celle correspondant à votre API.
      const data = await response.json();
  
      if (data && Array.isArray(data)) {
        // console.log("Données des utilisateurs récupérées :", data);
        setUsers(data); // Mettez à jour l'état avec les utilisateurs récupérés.
      } else {
        console.error("Format de réponse inattendu :", data);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des utilisateurs :", error);
    }
  };
  

  // Fonction pour gérer la suppression d'un utilisateur
  const handleDeleteUser = async () => {
    if (userToDelete === null) {
      setError("ID de l'utilisateur non défini !");
      setTimeout(() => setError(""), 3000); // Effacer après 3 secondes
      return;
    }

    try {
      await axios.delete(`${apiUrl}/users/admin`, {
        data: { id: userToDelete },
      });

      setUsers((prevUsers) =>
        prevUsers?.filter((user) => user.id !== userToDelete) || []
      );

      setConfirmDeleteModalOpen(false);
      setSuccessMessage("Utilisateur supprimé avec succès !");
      setTimeout(() => setSuccessMessage(""), 3000); // Effacer après 3 secondes
    } catch (error) {
      setError("Erreur lors de la suppression de l'utilisateur.");
      setTimeout(() => setError(""), 3000); // Effacer après 3 secondes
    }
  };

  // Ouvrir le modal de confirmation de suppression
  const openDeleteModal = (id: number) => {
    setUserToDelete(id);
    setConfirmDeleteModalOpen(true);
  };

  // Fermer le modal de confirmation de suppression
  const closeDeleteModal = () => {
    setConfirmDeleteModalOpen(false);
  };

  // Fonction pr fermer le modal
  const handleClose = () => {
    setOpenAdminUsers(false);
    navigate("/home"); // Redirige vers la page d'accueil
  };

  if (!openAdminUsers) {
    return null;
  }

  return (
    <Modal
      onClose={handleClose}
      onOpen={() => setOpenAdminUsers(true)}
      open={openAdminUsers}
    >
      <ModalHeader>Admin / Utilisateurs</ModalHeader>
      <ModalContent>
        <ModalDescription className="description">
          <div className="produit-details">
            <h1>LISTE DES UTILISATEURS</h1>

            {error && <p style={{ color: "red" }}>{error}</p>}
            {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}

            {/* Liste dynamique des utilisateurs */}
            <ul>
              {/* biome-ignore lint/complexity/useOptionalChain: <explanation> */}
              {users &&
                users.map((user) => (
                  <li className="item" key={user.id}>
                    <label className={"item-label item-label--done"} htmlFor={`user-${user.id}`}>
                      <span>{user.firstname}</span>
                      <p>{user.email}</p>
                    </label>

                    {/* Bouton Supprimer */}
                    <button
                      type="button"
                      className="item-delete"
                      onClick={() => openDeleteModal(user.id)}
                    >
                      <Trash size={20} />
                    </button>

               
                  </li>
                ))}
            </ul>
          </div>
        </ModalDescription>
      </ModalContent>

      <ModalActions>
        <Button onClick={handleClose}>Retour</Button>
      </ModalActions>

      {/* Modal de confirmation de suppression */}
      <Modal
        open={confirmDeleteModalOpen}
        onClose={closeDeleteModal}
        size="small"
      >
        <Modal.Header>Confirmer la suppression</Modal.Header>
        <Modal.Content>
          <p>Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.</p>
        </Modal.Content>
        <Modal.Actions>
          <Button onClick={closeDeleteModal}>Annuler</Button>
          <Button color="red" onClick={handleDeleteUser}>
            Supprimer
          </Button>
        </Modal.Actions>
      </Modal>
    </Modal>
  );
}

export default AdminUsers;
