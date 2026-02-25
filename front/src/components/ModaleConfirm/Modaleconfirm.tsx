import type React from "react";
import {
  Button,
  Form,
  FormGroup,
  Modal,
  ModalDescription,
  ModalHeader,
} from "semantic-ui-react";
import { useTimer } from "../TimerContext/TimerContext";
import "./ModaleConfirm.scss";

interface ModaleConfirmProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  // handleStopTimer: () => void; // Prop pour passer la fonction d'arrêt du timer
}

function ModaleConfirm({ open, setOpen }: ModaleConfirmProps) {
  const { handleStopTimer } = useTimer();

  // Fonction pour gérer la soumission du formulaire (confirmation)
  const handleConfirmStop = () => {
    handleStopTimer(); // Appelle la fonction pour arrêter le timer
    setOpen(false); // Ferme la modale
  };

  return (
    <Modal
      size={"small"}
      open={open}
      onClose={() => setOpen(false)} // Ferme la modale sans effectuer d'action
    >
      <ModalHeader>Confirmation</ModalHeader>
      <ModalDescription>
        <p>Êtes-vous sûr de vouloir arrêter la production ?</p>
      </ModalDescription>

      <Form>
        <FormGroup>
          <Button type="button" onClick={handleConfirmStop}>
            Confirmer
          </Button>
          <Button type="button" onClick={() => setOpen(false)}>
            Annuler
          </Button>
        </FormGroup>
      </Form>
    </Modal>
  );
}

export default ModaleConfirm;
