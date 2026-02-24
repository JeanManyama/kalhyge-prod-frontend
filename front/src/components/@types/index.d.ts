// objet qui correspond à une recette

// /@types/index.d.ts
export interface Machine {
  id: number;
  name: string;
}

export interface Article {
  id: number;
  name: string;
  initial_quantity: number;
  objective: number;
}

// Interface de données pour la production recuperée
//---------------------------------------------------
interface ArticleNameAndId {
  id: number;
  name: string;
}

interface MachinesProd {
  id: number;
  name: string;
}
interface MachineProduct {
  name: string;
}
interface ProductionData {
  id: number;
  created_at: Date;
  quantity_product_aff: number;
  machines: MachinesProd | null;
}

interface MachineData {
  id: number;
  name: string;
}

export interface ProductionResponse {
  status: string; //: "success"
  nameArticle: ArticleNameAndId; //: {name: "Draps Cliniques"}v nom de l'article
  machinesProduct: MachineProduct[]; // Liste des machines qui produisent l'article
  productions: ProductionData[]; // Liste des productions avec des heures
  machinesForSelec: MachineData[]; // Liste des machines disponibles
}
//---------------------------------------------------

// Interface de la grande production AU CENTRE-----------------------------------

// interface ProductionDetails {
//   total_quantity: number[]; // Tableau de quantités produites
//   total_quantity_reject: number[]; // Tableau de quantités rejetées
// }

interface Machine {
  id: number;
  name: string;
  total_quantity: number[];
  total_quantity_reject: number[];
}

export interface ArticleProduction {
  id: number;
  machines: Machine[];
  name: string;
  objective: number;
  total_quantity_all: number;
  total_quantity_reject_all: number;
  total_quantity_valid: number;
}
//---------------------------------------------------
// Interface pour UserInfo
interface UserInfo {
  firstname: string;
  connectedAt: string;
  id: number;
}

// Interface pour le Timer
interface Timer {
  id: number; // Identifiant
  time_begin: Date; // Heure de début, au format "HH:mm:ss"
  time_end?: string;
  date: string; // Date au format "YYYY-MM-DD", par défaut la date actuelle
  user_id: number;
}
