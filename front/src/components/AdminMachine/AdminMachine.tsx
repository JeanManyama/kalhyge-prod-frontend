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
import type { Machine } from "../@types";
import "./AdminMachine.scss";

interface AdminMachineProps {
  machines: Machine[] | null;
  setMachines: React.Dispatch<React.SetStateAction<Machine[] | null>>;
  openAdminMachine: boolean;
  setOpenAdminMachine: React.Dispatch<React.SetStateAction<boolean>>;
}

function AdminMachine({
  machines,
  setMachines,
  setOpenAdminMachine,
  openAdminMachine,
}: AdminMachineProps) {
  const navigate = useNavigate();
  const [newMachine, setNewMachine] = useState(""); // Pour ajouter une nouvelle machine
  const [editingMachineId, setEditingMachineId] = useState<number | null>(null); // Machine en cours d'édition
  const [editedMachineName, setEditedMachineName] = useState<string>(""); // Nom modifié de la machine

  const [error, setError] = useState<string>(""); // Gestion des erreurs
  const [successMessage, setSuccessMessage] = useState<string>(""); // Gestion des messages de succès

  // SUPPRESSION D'UNE MACHINE
  const [confirmDeleteModalOpen, setConfirmDeleteModalOpen] = useState(false); // État pour ouvrir/fermer le modal de confirmation
  const [machineToDelete, setMachineToDelete] = useState<number | null>(null); // ID de la machine à supprimer

  const apiUrl = import.meta.env.VITE_API_URL;

  const handleDeleteMachine = async () => {
    if (machineToDelete === null) {
      setError("ID de la machine non défini !");
      setTimeout(() => setError(""), 3000);
      return;
    }

    try {
      await axios.delete(`${apiUrl}/machines`, {
        data: { id: machineToDelete },
      });

      setMachines(
        (prevMachines) =>
          prevMachines?.filter((machine) => machine.id !== machineToDelete) ||
          [],
      );

      setConfirmDeleteModalOpen(false);
      setSuccessMessage("Machine supprimée avec succès !");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setError("Erreur lors de la suppression de la machine.");
      setTimeout(() => setError(""), 3000);
    }
  };

  const openDeleteModal = (id: number) => {
    setMachineToDelete(id);
    setConfirmDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setConfirmDeleteModalOpen(false);
  };

  const handleClose = () => {
    setOpenAdminMachine(false);
    navigate("/home");
  };

  const handleAddMachine = async () => {
    setError("");
    setSuccessMessage("");

    if (newMachine.trim() === "") {
      setError("Veuillez saisir un nom de machine valide.");
      setTimeout(() => setError(""), 3000);
      return;
    }

    try {
      const response = await axios.post(`${apiUrl}/machines`, {
        name: newMachine.trim(),
      });

      const createdMachine = response.data;

      setMachines((prevMachines) => [...(prevMachines || []), createdMachine]);

      setSuccessMessage("Machine ajoutée avec succès !");
      setNewMachine("");

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.error ||
            "Erreur lors de l'ajout de la machine.",
        );
      } else {
        setError("Une erreur inattendue s'est produite.");
      }
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleEditMachineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedMachineName(e.target.value);
  };

  const handleUpdateMachine = async (id: number) => {
    setError("");
    setSuccessMessage("");

    if (!editedMachineName.trim()) {
      setError("Le nom de la machine ne peut pas être vide.");
      setTimeout(() => setError(""), 3000);
      return;
    }

    try {
      const response = await axios.patch(`${apiUrl}/machines`, {
        id,
        name: editedMachineName.trim(),
      });

      const updatedMachine = response.data;

      setMachines(
        (prevMachines) =>
          prevMachines?.map((machine) =>
            machine.id === id ? updatedMachine : machine,
          ) || [],
      );

      setSuccessMessage("Machine modifiée avec succès !");
      setTimeout(() => setSuccessMessage(""), 3000);

      setEditingMachineId(null);
      setEditedMachineName("");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.error ||
            "Erreur lors de la modification de la machine.",
        );
      } else {
        setError("Une erreur inattendue s'est produite.");
      }
      setTimeout(() => setError(""), 3000);
    }
  };

  if (!openAdminMachine) {
    return null;
  }

  return (
    <Modal
      onClose={handleClose}
      onOpen={() => setOpenAdminMachine(true)}
      open={openAdminMachine}
    >
      <ModalHeader>Admin / Machine</ModalHeader>
      <ModalContent>
        <ModalDescription className="description">
          <div className="produit-details">
            <h1>AJOUT D'UNE MACHINE</h1>
            <div className="list1">
              <Form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAddMachine();
                }}
              >
                <FormGroup className="flexe">
                  <FormInput
                    label="Nouvelle machine"
                    placeholder="Nom de la machine"
                    value={newMachine}
                    onChange={(e) => setNewMachine(e.target.value)}
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

              <Modal
                open={confirmDeleteModalOpen}
                onClose={closeDeleteModal}
                size="small"
              >
                <Modal.Header>Confirmer la suppression</Modal.Header>
                <Modal.Content>
                  <p>
                    Êtes-vous sûr de vouloir supprimer cette machine ? Cette
                    action est irréversible.
                  </p>
                </Modal.Content>
                <Modal.Actions>
                  <Button onClick={closeDeleteModal}>Annuler</Button>
                  <Button color="red" onClick={handleDeleteMachine}>
                    Supprimer
                  </Button>
                </Modal.Actions>
              </Modal>

              <ul>
                {/* biome-ignore lint/complexity/useOptionalChain: <explanation> */}
                {machines &&
                  machines.map((machine, index) => (
                    <li className="item" key={machine.id}>
                      <label
                        className={"item-label item-label--done"}
                        htmlFor={`machine-${machine.id}`}
                      >
                        <span>{index + 1}</span>
                        {editingMachineId === machine.id ? (
                          <form
                            className="item-form"
                            onSubmit={(e) => {
                              e.preventDefault();
                              handleUpdateMachine(machine.id);
                            }}
                          >
                            <input
                              type="text"
                              value={editedMachineName}
                              onChange={handleEditMachineChange}
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
                              setEditingMachineId(machine.id);
                              setEditedMachineName(machine.name);
                            }}
                          >
                            {machine.name}
                          </p>
                        )}
                      </label>
                      {/* Bouton Edit */}
                      <button
                        type="button"
                        className="item-delete"
                        onClick={() => {
                          setEditingMachineId(machine.id);
                          setEditedMachineName(machine.name);
                        }}
                      >
                        <Edit size={20} />
                      </button>
                      <button
                        type="button"
                        className="item-delete"
                        onClick={() => openDeleteModal(machine.id)}
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

export default AdminMachine;
