import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LoginSignupForm from "./components/LoginSignupForm/LoginSignupForm";
import { TimerProvider } from "./components//TimerContext/TimerContext";
import Home from "./components/Home/Home";

import "./App.scss";

function App() {
  // const basename = "/Kalhyge-prod"; // Chemin de base pour le déploiement

  return (
    <Router>
      <TimerProvider>
        <Routes>
          <Route path="/" element={<LoginSignupForm />} />{" "}
          {/* Page de connexion par défaut */}
          <Route path="/home" element={<Home />} />
          <Route path="/home/article" element={<Home />} />
          <Route path="/home/machine" element={<Home />} />
          <Route path="/home/rejet" element={<Home />} />
          <Route path="/home/historique" element={<Home />} />
          <Route path="/home/users/admin" element={<Home />} />
          <Route path="/home/initialisation" element={<Home />} />
          <Route path="/home/:articleId" element={<Home />} />
          <Route path="/home/machines/:machineId" element={<Home />} />
        </Routes>
      </TimerProvider>
    </Router>
  );
}

export default App;
