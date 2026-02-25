import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginSignupForm.scss";

const LoginSignupForm = () => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isResetMode, setIsResetMode] = useState(false);
  const [stepReset, setStepReset] = useState(1); // 1 = saisie email + mdp, 2 = saisie code
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstname: "",
    code: "", // pour le code de validation
  });

  const [error, setError] = useState<string | null>(null);
  const [succesMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (succesMessage || error) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
        setError(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [succesMessage, error]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    try {
      if (isResetMode) {
        if (stepReset === 1) {
          // Envoie du code au mail de l'utilisateur
          await axios.post(`${apiUrl}/send-reset-code`, {
            email: formData.email,
            newPassword: formData.password,
          });
          setStepReset(2);
          setSuccessMessage("Un code de vérification a été envoyé par mail.");
        } else if (stepReset === 2) {
          // Validation du code
          await axios.post(`${apiUrl}/validate-reset-code`, {
            email: formData.email,
            code: formData.code,
          });
          setSuccessMessage(
            "Mot de passe mis à jour. Vous pouvez vous connecter.",
          );
          setIsResetMode(false);
          setIsLoginMode(true);
          setFormData({ email: "", password: "", firstname: "", code: "" });
          setStepReset(1);
        }
        return;
      }

      if (isLoginMode) {
        const response = await axios.post(`${apiUrl}/signin`, {
          email: formData.email,
          password: formData.password,
        });
        localStorage.setItem("accessToken", response.data.accessToken);
        localStorage.setItem("refreshToken", response.data.refreshToken);
        localStorage.setItem("csrfToken", response.data.csrfToken);
        navigate("/home");
      } else {
        const response = await axios.post(`${apiUrl}/signup`, {
          firstname: formData.firstname,
          email: formData.email,
          password: formData.password,
        });
        console.log(response.data.firstname);
        setSuccessMessage("Compte créé avec succès");
        setFormData({ email: "", password: "", firstname: "", code: "" });
        setIsLoginMode(true);
      }
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    } catch (err: any) {
      setError(err.response?.data?.message || "Une erreur est survenue.");
    }
  };

  return (
    <div className="container">
      <h1>
        {isResetMode
          ? stepReset === 1
            ? "Réinitialiser le mot de passe"
            : "Valider le code"
          : isLoginMode
            ? "Connexion"
            : "Créer un compte"}
      </h1>
      <form onSubmit={handleSubmit} className="form">
        {!isLoginMode && !isResetMode && (
          <input
            type="text"
            name="firstname"
            placeholder="Prénom"
            value={formData.firstname}
            onChange={handleChange}
            className="inputAuthenication"
            required
          />
        )}

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="inputAuthenication"
          required
        />

        {(!isLoginMode || isLoginMode || isResetMode) && stepReset !== 2 && (
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Mot de passe"
              value={formData.password}
              onChange={handleChange}
              className="inputAuthenication"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="toggle-password"
              aria-label={
                showPassword
                  ? "Masquer le mot de passe"
                  : "Afficher le mot de passe"
              }
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
        )}

        {isResetMode && stepReset === 2 && (
          <input
            type="text"
            name="code"
            placeholder="Code reçu par email"
            value={formData.code}
            onChange={handleChange}
            className="inputAuthenication"
            required
          />
        )}

        <button type="submit" className="Button">
          {isResetMode
            ? stepReset === 1
              ? "Envoyer le code"
              : "Valider le code"
            : isLoginMode
              ? "Se connecter"
              : "Créer un compte"}
        </button>
      </form>

      {error && <p className="error">{error}</p>}
      {succesMessage && <p className="succes">{succesMessage}</p>}

      {!isResetMode && (
        <>
          {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
          <button
            onClick={() => {
              setIsLoginMode(!isLoginMode);
              setFormData({ email: "", password: "", firstname: "", code: "" });
            }}
            className="button secondary"
          >
            {isLoginMode ? "Créer un compte" : "Se connecter"}
          </button>
          {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
          <button
            onClick={() => {
              setIsResetMode(true);
              setIsLoginMode(false);
              setFormData({ email: "", password: "", firstname: "", code: "" });
            }}
            className="Button link"
          >
            Mot de passe oublié ?
          </button>
        </>
      )}
    </div>
  );
};

export default LoginSignupForm;
