/// <reference types="vite/client" />
interface ImportMetaEnv {
  VITE_BASE_URL: string;
  // Ajoutez ici d'autres variables d'environnement que vous utilisez
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
