import { Progress, Segment } from "semantic-ui-react";
import type { ArticleProduction } from "../@types";
import { useTimer } from "../TimerContext/TimerContext";
import "./Prod.scss";

interface ProdProps {
  productions: ArticleProduction[] | null; // Liste des productions
  // starts: boolean;
}

function Prod({  productions }: ProdProps) {

  const { start, production, hours, minutes, seconds} = useTimer();
  
  const starts = start;

  // Commutateur pour définir les productions
  const prod = production?production:productions;



// Définir les capacités de production par machine
const machineCapacities: Record<string, number> = {
  Jensen: 300, // Machine Jensen peut produire 300 articles B par heure
  Kannegieser: 200, // Machine Kannegieser peut produire 200 articles D par heure
  'Plieuse 1': 300, // Machine Plieuse1 peut produire 100 articles F par heure
  Plieuse2: 200, // Machine Plieuse2 peut produire 100 articles H par heure
};

  // Calculer le temps restant global en secondes
  const timeRemainingInSeconds = hours * 3600 + minutes * 60 + seconds;

  // Fonction pour calculer la probabilité
  const calculateProbability = (article : ArticleProduction) => {
    const { objective, total_quantity_valid, machines } = article;

    // console.log("OBJECTIVE------------", objective);
    // console.log("Quantité valid est ------------", total_quantity_valid);

    // Quantité restante à produire
    const quantityRemaining = objective - total_quantity_valid;

    if (quantityRemaining <= 0) {
      return 100; // Objectif atteint ou dépassé
    }

  // Capacité totale de production dans le temps restant
  const totalCapacityInTimeRemaining = machines.reduce((total, machine) => {
    const machineName = machine.name; // Extraire le nom de la machine

        // Vérifier si la machine a une capacité définie
        if (!(machineName in machineCapacities)) {
          console.warn(`La machine "${machineName}" n'a pas de capacité définie dans machineCapacities.`);
          return total; // Ignorer cette machine
        }

    // Calculer la capacité par seconde
    const capacityPerSecond = machineCapacities[machineName] / 3600; // Capacité par seconde
    return total + capacityPerSecond * timeRemainingInSeconds;
  }, 0);

  //  console.log("Quantité restant à produire est ------------", quantityRemaining);
  // Probabilité d'atteindre l'objectif
  const probability = Math.min(
    Math.round((totalCapacityInTimeRemaining / quantityRemaining) * 100),
    100
  );

    return probability;
  };
   
  //  {console.log("PRODUCTION A ------------------------------------:", prod)}
  return (
    <div className="display-grid">
     
      {prod?.map((article) => {
        // Calculer le pourcentage de progression par rapport à l'objectif
        const percentage = article.objective > 0 ? Math.min(Math.round((article.total_quantity_valid / article.objective) * 100),100): 0; // Si l'objectif est 0, le pourcentage reste 0
              // console.log("OBJECTIF est :----", article.objective)
            // Calculer la probabilité d'atteindre l'objectif
        const probability =article.objective > 0 ? calculateProbability(article) : 0;


        // Calculer les articles restants
        const articlesRemaining = Math.max(0, article.objective - (article.total_quantity_valid/2))
        return (
          <div className="card" key={article.id}>
            <div className="card-article">
              <h3>
                <span className="title-span">{article.name.toUpperCase()}</span>
              </h3>
              <div className="remaining-span">
                <span className="label">Articles Restants :</span>
                <span className="remaining-value">{articlesRemaining*2}</span>
              </div>
              <span className="colored-span">
                {(article.objective)*2} pièces
              </span>
            </div>
            <Segment color="red" className="progressbar-segment">
         
              <Progress
                value={percentage/2}
                total={100}
                progress="percent"
                size="big"
                className={
                  starts
                    ? "progressbar-progress-start"
                    : "progressbar-progress"
                }
                active={starts}
              />
            </Segment>
            <p className="probability">
              À ce rythme, nous estimons à {" "}<span>{probability}</span>{" "}%, la chance d'atteindre l'objectif à l'heure
            </p>
          </div>
        );
      })}
    </div>
  );
}

export default Prod;
