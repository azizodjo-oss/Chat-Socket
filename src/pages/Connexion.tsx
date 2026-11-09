import { useState, type FormEvent } from 'react';
import { inscrire, connecter, type Session } from '../services/api';
import { Eye, EyeOff } from 'lucide-react';

    // Ce que la page attend de son parent : une fonction à appeler une fois connecté
    type PropsConnexion = { onConnecte: (session: Session) => void };

    // Page d'accueil : inscription ou connexion
    export default function Connexion({ onConnecte }: PropsConnexion) {
    const [modeInscription, setModeInscription] = useState(false);
    const [motDePasseVisible, setMotDePasseVisible] = useState(false);
    const [pseudo, setPseudo] = useState('');
    const [motDePasse, setMotDePasse] = useState('');
    const [erreur, setErreur] = useState('');
    const [chargement, setChargement] = useState(false);

    // Envoie le formulaire : inscription puis connexion, ou connexion directe
    async function soumettre(evenement: FormEvent<HTMLFormElement>) {
        evenement.preventDefault(); // empêche le rechargement de la page
        setErreur('');
        setChargement(true);
        try {
        if (modeInscription) await inscrire(pseudo, motDePasse);
        const session = await connecter(pseudo, motDePasse);
        onConnecte(session);
        } catch (e) {
        setErreur(e instanceof Error ? e.message : 'Erreur inconnue');
        } finally {
        setChargement(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <form onSubmit={soumettre} className="w-80 bg-white p-6 rounded-xl shadow space-y-4">
            <h1 className="text-xl font-bold text-center">
            {modeInscription ? 'Créer un compte' : 'Connexion'}
            </h1>

            <input
            className="w-full border rounded px-3 py-2"
            placeholder="Pseudo"
            maxLength={20}
            value={pseudo}
            onChange={(e) => setPseudo(e.target.value)}
            />
            <div className="relative">
                <input
                    className="w-full border rounded px-3 py-2 pr-10"
                    type={motDePasseVisible ? 'text' : 'password'}
                    placeholder="Mot de passe (6 caractères min.)"
                    value={motDePasse}
                    onChange={(e) => setMotDePasse(e.target.value)}
                />
                <button
                    type="button"
                    onClick={() => setMotDePasseVisible(!motDePasseVisible)}
                    aria-label={motDePasseVisible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 hover:text-slate-700"
                    >
                    {motDePasseVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>

            {erreur && <p className="text-red-600 text-sm">{erreur}</p>}

            <button
            type="submit"
            disabled={chargement}
            className="w-full bg-blue-600 text-white rounded py-2 disabled:opacity-50"
            >
            {chargement ? 'Patientez…' : modeInscription ? "S'inscrire" : 'Se connecter'}
            </button>

            <button
            type="button"
            onClick={() => setModeInscription(!modeInscription)}
            className="w-full text-sm text-blue-600"
            >
            {modeInscription ? 'Déjà un compte ? Se connecter' : "Pas de compte ? S'inscrire"}
            </button>
        </form>
        </div>
    );
    }