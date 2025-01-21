import type React from 'react';
import { useState } from 'react';
import './ModaleUpdatePassword.scss';

interface ModaleUpdatePasswordProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newPassword: string) => void;
}

const ModaleUpdatePassword: React.FC<ModaleUpdatePasswordProps> = ({ isOpen, onClose, onSave }) => {
  const [newPassword, setNewPassword] = useState('');

  if (!isOpen) {
    return null; // Ne rien afficher si la modale n'est pas ouverte
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Modifier le mot de passe</h3>
        <input
          type="password"
          value={newPassword}
          placeholder="Nouveau mot de passe"
          onChange={(e) => setNewPassword(e.target.value)}
          className="modal-input"
        />
        <div className="modal-actions">
          {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
          <button className="modal-button" onClick={onClose}>
            Annuler
          </button>
          {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
          <button
            className="modal-button save-button"
            onClick={() => {
              onSave(newPassword);
              setNewPassword(''); // Réinitialiser le champ après la sauvegarde
            }}
          >
            Sauvegarder
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModaleUpdatePassword;
