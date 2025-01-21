import { useEffect, useState } from "react";
import {
  Form,
  FormGroup,
  FormInput,
  Button,
  FormSelect,
  Modal,
  ModalContent,
  ModalDescription,
  ModalHeader,
  ModalActions,

} from "semantic-ui-react";
import type { DropdownProps } from "semantic-ui-react";
import { Trash, Edit } from "react-feather";
import "./ProdDetail.scss";
import type { ProductionResponse } from "../@types";
import axios from "axios";
// import type { AxiosError } from "axios";

interface ProdDetailProps {
  timerId: number | null,
  articleData: ProductionResponse | null;
  openProdDetail: boolean;
  setOpenProdDetail: () => void;
}

function ProdDetail({
  timerId,
  articleData,
  setOpenProdDetail,
  openProdDetail,
}: ProdDetailProps) {
  // console.log("TIMER ID RECUS DANS PRODDETAIL EST--------------- :", timerId);

  // États pour la Modale de suppression
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // Ouverture/fermeture de la modale
const [productionToDelete, setProductionToDelete] = useState<number | null>(null); // ID de la production à supprimer

  
// États pour la modification de la machine
const [editingMachineId, setEditingMachineId] = useState<number | null>(null); // ID de la machine à éditer
const [editingMachineName, setEditingMachineName] = useState<string | null>(null); // Nom de la nouvelle machine éditée
const [editingMachineNewId, setEditingMachineNewId] = useState<number | null>(null); // ID de la nouvelle machine éditée


  // Etats pour l'édition de la quantité
  const [editingQuantities, setEditingQuantities] = useState<{ [key: number]: string }>({});
  
// États pour la nouvelle production
const [selectedNewMachine, setSelectedNewMachine] = useState<string | null>(null);
const [selectedNewMachineId, setSelectedNewMachineId] = useState<number | null>(null);

  const [newQuantity, setNewQuantity] = useState<string>("");

  const [editingProduction, setEditingProduction] = useState<number | null>(null);
  const [productionss, setProductionss] = useState<ProductionResponse["productions"]>([]);

  const [error, setError] = useState<string>(""); // État pour gérer les erreurs
  const [successMessage, setSuccessMessage] = useState<string>(""); // État pour gérer le message de succès

  const apiUrl = import.meta.env.VITE_API_URL;
    //telechargement des images dans assets
    const images: Record<string, { default: string }> = import.meta.glob("../../assets/*.jpg", { eager: true });
    // console.log("Images chargées :", images);

    const getImageForArticle = (machineName: string): string | null => {
      const normalizedMachineName = machineName.toLowerCase();
      // console.log("Nom de la machine normalisé :", normalizedMachineName);
      const imageKey = `../../assets/${normalizedMachineName}.jpg`;
      if (!images[imageKey]) {
        console.error(`Image introuvable pour la clé : ${imageKey}`);
      }
      return images[imageKey]?.default || null;
    };

  useEffect(() => {
    if (articleData?.productions) {
      const sortedProductions = [...articleData.productions].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setProductionss(sortedProductions);
    }
  }, [articleData]);

  if (!articleData) {
    return (
      <div className="loading-container">
        {/* <Loader active inline="centered" /> */}
        {/* <p>Chargement des données...</p> */}
      </div>
    );
  }
  

  const { nameArticle, machinesProduct, machinesForSelec } = articleData;

  // Générer les options pour le select des machines
  const machineOptions = machinesForSelec.map((machine) => ({
    key: machine.id,
    value: machine.name,
    text: machine.name,
  }));

  // Gérer la modification de la machine sélectionnée pour la nouvelle production
  const handleMachineSelect = (
    _: React.SyntheticEvent,
    data: DropdownProps
  ) => {
    setSelectedNewMachine(data.value as string | null); // Machine sélectionnée pour la nouvelle production
    const selectedOption = machineOptions.find(option => option.value === data.value);
    setSelectedNewMachineId(selectedOption ? selectedOption.key as number : null); // ID de la machine sélectionnée
  };
  

  // Gérer l'édition de la machine pour une production existante
  const handleMachineSelectModif = (
    _: React.SyntheticEvent,
    data: DropdownProps
  ) => {
    setEditingMachineName(data.value as string | null); // Nom de la machine modifiée
    const selectedOption = machineOptions.find(option => option.value === data.value);
    setEditingMachineNewId(selectedOption ? selectedOption.key as number : null); // ID de la nouvelle machine modifiée
  };
  

// Gestion des champs de la nouvelle entrée
  const handleNewEntry = async(e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    if (!selectedNewMachine || !newQuantity || !selectedNewMachineId || !nameArticle.id) {
      setError("Veuillez sélectionner une machine et entrer une quantité.");
      return;
    }

    try {
      await createProduction(e, Number.parseInt(newQuantity), selectedNewMachineId, nameArticle.id);

      setNewQuantity("");
      setSelectedNewMachine(null);
      setSelectedNewMachineId(null);
      setError("");
      setSuccessMessage("Opération réussie !");

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
      
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        console.error("Erreur lors de la création de la production :", error);
      } else {
        setError("Une erreur est survenue lors de l'enregistrement de la production.");
      }
    }
  };

// CREATION DE LA PRODUCTION
  const createProduction = async (
    e: React.FormEvent<HTMLFormElement>, 
    quantity: number,
    machineId: number,
    articleId: number
  ) : Promise<void> => {
    e.preventDefault();
    setError("");
    // ATTENTION : TIMER POUR LA PRODUCTION A DYNAMISER /|\
    // const timer_id = 1;

    if (!quantity || !machineId || !articleId) {
      setError("Veuillez vérifier les informations de production (quantité, machine, article).");
      return;
    }

    // biome-ignore lint/suspicious/noGlobalIsNan: <explanation>
    if (!newQuantity || isNaN(Number(newQuantity)) || Number(newQuantity) <= 0) {
      setError("Veuillez entrer une quantité valide.");
      return;
    }

    try {
      const response = await axios.post(
        `${apiUrl}/productions/articles/${articleId}`,
        {
          machine_id: machineId,
          quantity_product_aff: quantity,
          timer_id: timerId,
        }
      );

      // console.log("Production créée avec succès:", response.data);
      const createdProduction = response.data;
          // Trouver les détails de la machine sélectionnée
    const selectedMachineDetails = machineOptions.find(
      (option) => option.key === machineId
    );
     // Ajouter les détails de la machine dans la production créée
     const productionWithMachine = {
      ...createdProduction,
      machines: {
        id: machineId,
        name: selectedMachineDetails?.text || "Non spécifiée", // Ajout du nom
      },
    };

      // Mettre à jour la liste des productions
    setProductionss((prevProductions) => {
      const updatedProductions = [...prevProductions, productionWithMachine];
      return updatedProductions.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const errorMessage = err.response?.data?.error || "Erreur inconnue du serveur";
        throw new Error(errorMessage);
      }
      throw new Error("Une erreur inattendue est survenue.");
    }
  };

// UPDATE DE LA QUANTITÉ DE LA PRODUCTION
// Gestion de l'édition de la quantité avec validation pour un champ vide
const handleQuantityChange = (
  productionId: number,
  value: string
) => {
  setEditingQuantities((prevQuantities) => ({
    ...prevQuantities,
    [productionId]: value, // Mettre à jour la quantité avec la valeur (vide ou non)
  }));
};
const updateQuantity = async (
  productionId: number,
  newQuantity: number,
  articleId: number
): Promise<void> => {
  setError(""); 
  setSuccessMessage(""); 

  

  // Trouver l'ancienne quantité pour comparaison
  const productionToUpdate = productionss.find((prod) => prod.id === productionId);
  if (!productionToUpdate) {
    setError("Production introuvable.");
    return;
  }

  // Comparer la nouvelle quantité avec l'ancienne
  if (Number(newQuantity) === productionToUpdate.quantity_product_aff) {
    setError("Aucune modification apportée, vérifiez les règles.");
    return;
  }

  // biome-ignore lint/suspicious/noGlobalIsNan: <explanation>
  if (!newQuantity || isNaN(newQuantity) || newQuantity <= 0) {
    setError("Veuillez entrer une quantité valide.");
    return;
  }

  try {
    const response = await axios.patch(
      `${apiUrl}/productions/articles/${articleId}/article`,
      {
        prodId: productionId,
        quantity_product_aff: newQuantity,
      }
    );

    if (response.status === 201 && response.data === " aucune modification") {
      setError("Aucune modification apportée, vérifiez les règles.");
      return;
    }

    // console.log("Quantité mise à jour avec succès :", response.data);

    setProductionss((prevProductions) =>
      prevProductions.map((prod) =>
        prod.id === productionId
          ? { ...prod, quantity_product_aff: newQuantity }
          : prod
      )
    );

    setSuccessMessage("Quantité modifiée avec succès.");
    setTimeout(() => {
      setSuccessMessage("");
      setEditingProduction(null); 
    }, 3000);
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const errorMessage =
        err.response?.data?.error || "Erreur inconnue du serveur.";
      setError(errorMessage);
      console.error("Erreur lors de la mise à jour de la quantité :", err);
    } else {
      setError("Une erreur inattendue est survenue.");
    }
  }
};

// UPDATE DE LA MACHINE DANS LA PRODUCTION
const updateMachine = async (
  productionId: number,
  newMachineId: number,
  articleId: number
): Promise<void> => {
  setError("");
  setSuccessMessage("");
     // ATTENTION : TIMER POUR LA PRODUCTION A DYNAMISER /|\
    //  const timer_id = 1;

   // Vérifier si newMachineId est valide
  //  console.log("newMachineId a ---------------------------------------------", newMachineId);
   if (!newMachineId) {
    setError("Veuillez sélectionner une machine valide.");
    return;
  }

  const productionToUpdate = productionss.find((prod) => prod.id === productionId);
  if (!productionToUpdate) {
    setError("Production introuvable.");
    return;
  }

  // Vérifier si la machine sélectionnée est différente de l'ancienne
  if (productionToUpdate.machines?.id === newMachineId) {
    setError("Aucune modification apportée.");
    return;
  }

  try {
    const response = await axios.patch(
      `${apiUrl}/productions/articles/${articleId}/machine`,
      {
        prodId: productionId,
        machineId: newMachineId,
        timerId: timerId,
      }
    );

    console.log("Machine mise à jour avec succès :", response.data);

  // Une fois la mise à jour effectuée, mettez à jour la productionss
    // Mettez à jour l'état local avec la nouvelle machine
    setProductionss((prevProductions) =>
      prevProductions.map((prod) =>
        prod.id === productionId
          ? {
              ...prod,
              machines: { id: newMachineId, name: editingMachineName || "Non spécifiée" },
            }
          : prod
      )
    );

  


    setSuccessMessage("Machine modifiée avec succès.");
    setTimeout(() => {
      setSuccessMessage("");
      setEditingMachineId(null);
      setEditingMachineName(null);
      setEditingMachineNewId(null);
   
    }, 3000);
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const errorMessage =
        err.response?.data?.error || "Erreur inconnue du serveur.";
      setError(errorMessage);
      console.error("Erreur lors de la mise à jour de la machine :", err);
    } else {
      setError("Une erreur inattendue est survenue.");
    }
  }
};

// SUPPRESSION DE LA MACHINE DANS LA PRODUCTION
const deleteProduction = async (productionId: number) => {
  setError(""); // Réinitialiser les erreurs
  try {
    // Envoie de la requête DELETE à l'API
    const response = await axios.delete(
      `${apiUrl}/productions/articles/${productionId}`
    );
    
    // Vérification du succès de la suppression
    if (response.status === 204) {
      console.log("Production supprimée avec succès.");
      
      // Mettre à jour la liste des productions pour exclure la production supprimée
      setProductionss((prevProductions) =>
        prevProductions.filter((prod) => prod.id !== productionId) // Filtrer l'élément supprimé
      );
      
      setSuccessMessage("Production supprimée avec succès.");
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    }
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const errorMessage =
        err.response?.data?.error || "Erreur inconnue du serveur.";
      setError(errorMessage);
      console.error("Erreur lors de la suppression de la production :", err);
    } else {
      setError("Une erreur inattendue est survenue.");
    }
  }
};

const articleImage = articleData ? getImageForArticle(articleData.nameArticle.name.replace(/\s+/g, '-')) : null;
  return (
    <Modal onClose={setOpenProdDetail} open={openProdDetail}>
      <ModalHeader>Article / Détails de la Production</ModalHeader>
      <ModalContent>
        <ModalDescription>
          <div className="produit-details">
            <div className="background-image-prod">


              {/* Image dynamique de l'article */}
              {articleImage ? (
                <img src={articleImage} alt={nameArticle.name} className="article-image" />
              ) : (
                <div className="placeholder-image">Image non disponible</div>)}



              <div className="text-overlay">
                <h1>{nameArticle.name}</h1>
                <p>{machinesProduct.map((machine) => machine.name).join(" ")}</p>
              </div>
            </div>

            <div className="list1">
              <Form onSubmit={handleNewEntry} unstackable>
                <FormGroup widths="equal">
                  <FormInput
                    label="Nouvelle entrée"
                    placeholder="Nouvelle entrée"
                    value={newQuantity}
                    onChange={(e) => setNewQuantity(e.target.value)}
                  />
                  <FormSelect
                    fluid
                    label="Machine"
                    placeholder="Machine"
                    options={machineOptions}
                    value={selectedNewMachine ?? ""}
                    onChange={handleMachineSelect}
                  />
                  <Button
                    type="submit"
                    className="margin-top"
                  >
                    Valider
                  </Button>
                </FormGroup>

                {successMessage && (
                  <div style={{ color: "green", marginTop: "10px" }} >
                    {successMessage}
                  </div>
                )}

                {error && (
                  <div style={{ color: "red", marginTop: "10px" }}>
                    {error}
                  </div>
                )}
              </Form>


              <ul>
                {productionss.map((production, index) => (
                  <li className="item" key={production.id || `production-${index}`}>
                    <label className="item-label">
                      <span>
                        {new Date(production.created_at).toLocaleTimeString()}
                      </span>

                      <form
                        className="item-form"
                        onSubmit={(e) => {
                          e.preventDefault();
                          // console.log("Mise à jour quantité", production.id, editingQuantities[production.id] ?? newQuantity);
                          // setEditingProduction(production.id);
                          const currentQuantity = production.quantity_product_aff; // Quantité actuelle
                          const quantityToUpdate = Number.parseInt(
                            editingQuantities[production.id] ?? currentQuantity.toString()
                          );
                      
                          if (quantityToUpdate === currentQuantity) {
                            setError("Aucune modification apportée.");
                            return;
                          }
                           updateQuantity(
                              production.id,
                              quantityToUpdate,
                              nameArticle.id
                            );
                        }}
                       >
                       
                       

                       <input
                            type="text"
                            value={
                              editingProduction === production.id
                                ? editingQuantities[production.id] || "" // Permettre un champ vide
                                : production.quantity_product_aff
                            }
                            onChange={(e) => handleQuantityChange(production.id, e.target.value)} // Appeler la fonction de changement de quantité
                            disabled={editingProduction !== production.id}
                          />
                        {editingProduction === production.id ? (
                          <button type="submit" className="item-delete">
                            Valider
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="item-delete"
                            onClick={() => {
                              setEditingProduction(production.id);
                              setEditingQuantities((prev) => ({
                                ...prev,
                                [production.id]: production.quantity_product_aff.toString(), // Remplir avec la valeur actuelle
                              }));
                            }}


                          >
                            <Edit size={20} />
                          </button>
                        )}

                      </form>
                        


                        {/* Gestion de l'édition de la machine */}
                    <form className="item-form" 
                        onSubmit={(e) => { 
                        e.preventDefault(); 
                        console.log("Mise à jour quantité", production.id, editingQuantities[production.id] ?? newQuantity);
                        if (editingMachineNewId) {
                          updateMachine(production.id, editingMachineNewId, nameArticle.id);
                        } else {
                          setError("Veuillez sélectionner une machine.");
                        }
                          }}>
                        {editingMachineId  === production.id ? (
                            <FormSelect
                              fluid
                              options={machineOptions}
                              value={editingMachineName  ?? production.machines?.name?? ""}
                              onChange={handleMachineSelectModif}
                              style={{ maxWidth: "12.5rem" }}
                            />
                          ) : (
                            <input
                              type="text"
                              value={production.machines?.name || "Non spécifiée"}
                              disabled
                            />
                          )}


                              {editingMachineId === production.id ? (
                                  <button type="submit" className="item-delete">
                                    Valider
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    className="item-delete"
                                    onClick={() => {
                                      setEditingMachineId(production.id);
                                      setEditingMachineName(production.machines?.name || null);
                                      setEditingMachineNewId(production.machines?.id || null);
                                    }}
                                  >
                                    <Edit size={20} />
                                  </button>
                                )}
                      </form>
                    </label>

                    <button
                      type="button"
                      className="item-delete"
                      onClick={() => {
                        setProductionToDelete(production.id); // Stocke l'ID de la production à supprimer
                        setIsDeleteModalOpen(true); // Ouvre la modale
                      }}
                    >
                      <Trash size={20} />
                  </button>

                  </li>
                ))}
              </ul>
            </div>
          </div>
        </ModalDescription>
        <Modal open={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
  <ModalHeader>Confirmer la suppression</ModalHeader>
  <ModalContent>
    <p>Êtes-vous sûr de vouloir supprimer cette production ?</p>
  </ModalContent>
  <ModalActions>
    <Button
      negative
      onClick={() => {
        if (productionToDelete !== null) {
          deleteProduction(productionToDelete);
        }
        setIsDeleteModalOpen(false); // Ferme la modale
      }}
    >
      Supprimer
    </Button>
    <Button onClick={() => setIsDeleteModalOpen(false)}>Annuler</Button>
  </ModalActions>
</Modal>

      </ModalContent>

      <ModalActions>
        <Button onClick={setOpenProdDetail}>Fermer</Button>
      </ModalActions>
    </Modal>
  );
}

export default ProdDetail;
