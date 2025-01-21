import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './LoginSignupForm.scss'; // Import des styles SCSS



const LoginSignupForm = () => {

      //telechargement des images dans assets
      // const images: Record<string, { default: string }> = import.meta.glob("../../assets/*.jpg", { eager: true });
      // console.log("Images chargées :", images);

      // const getImageForArticle = (machineName: string): string | null => {
        
      //   const imageKey = `../../assets/${machineName}.png`;
      //   if (!images[imageKey]) {
      //     console.error(`Image introuvable pour la clé : ${imageKey}`);
      //   }
      //   return images[imageKey]?.default || null;
      // };

  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstname: '',
  });
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const apiUrl = import.meta.env.VITE_API_URL;

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
      if (isLoginMode) {
        const response = await axios.post(`${apiUrl}/signin`, {
          email: formData.email,
          password: formData.password,
        });

        // console.log('Connexion réussie:', response.data);
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        localStorage.setItem('csrfToken', response.data.csrfToken);
        navigate('/home');
      } else {
        const response = await axios.post(`${apiUrl}/signup`, {
          firstname: formData.firstname,
          email: formData.email,
          password: formData.password,
        });

        console.log('Compte créé avec succès:', response.data);
        setIsLoginMode(true);
      }
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    } catch (err: any) {
      setError(err.response?.data?.message || 'Une erreur est survenue.');
    }
  };

  // const loginImage =  getImageForArticle('loginImage') ? getImageForArticle('loginImage') : null;
  
  return (
    <div className="container">
      <h1>{isLoginMode ? 'Connexion' : 'Créer un compte'}</h1>
      <form onSubmit={handleSubmit} className="form">
        {!isLoginMode && (
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
        <input
          type="password"
          name="password"
          placeholder="Mot de passe"
          value={formData.password}
          onChange={handleChange}
          className="inputAuthenication"
          required
        />
        <button type="submit" className="button">
          {isLoginMode ? 'Se connecter' : 'Créer un compte'}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
      <button
        onClick={() => setIsLoginMode(!isLoginMode)}
        className="button secondary"
      >
        {isLoginMode ? 'Créer un compte' : 'Se connecter'}
      </button>
    </div>
  );
};

export default LoginSignupForm;
