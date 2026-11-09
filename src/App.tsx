import { useState } from 'react';
import Connexion from './pages/Connexion';
import type { Session } from './services/api';

// Sans session : page de connexion. Avec session : le chat (étape suivante).
export default function App() {
  const [session, setSession] = useState<Session | null>(null); // la valeur est soit une session, soit null avant la connexion

  if (!session) return <Connexion onConnecte={setSession} />;

  return <p className="p-6">Connecté en tant que {session.pseudo}</p>;
}