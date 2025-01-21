
import './Modal.scss';

interface ModalProps {
  message: string;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ message, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <p>{message}</p>
        {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
        <button onClick={onClose} className="modal-close-button">
          Fermer
        </button>
      </div>
    </div>
  );
};

export default Modal;
