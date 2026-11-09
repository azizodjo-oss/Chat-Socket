    import { useEffect, useRef, useState } from 'react';
    import type { Socket } from 'socket.io-client';
    import { ouvrirSocket } from '../services/socket';
    import type { MessageAffiche, Reponse } from '../types';

    // Gère toute la communication temps réel du chat.
    // Les conversations sont rangées par clé : "groupe:Classe" ou "prive:Marc".
    export function useChat(token: string, pseudo: string) {
    const socketRef = useRef<Socket | null>(null);
    const [connecte, setConnecte] = useState(false);
    const [erreur, setErreur] = useState('');
    const [utilisateurs, setUtilisateurs] = useState<string[]>([]);
    const [groupes, setGroupes] = useState<Record<string, string[]>>({}); // groupe -> membres
    const [messages, setMessages] = useState<Record<string, MessageAffiche[]>>({});

    // Ouvre le socket au chargement, le ferme au départ
    useEffect(() => {
        const socket = ouvrirSocket(token);
        socketRef.current = socket;

        // Ajoute un message dans la bonne conversation
        const ajouterMessage = (cle: string, message: Omit<MessageAffiche, 'id'>) =>
        setMessages((precedent) => ({
            ...precedent,
            [cle]: [...(precedent[cle] ?? []), { ...message, id: crypto.randomUUID() }],
        }));

        socket.on('connect', () => setConnecte(true));
        socket.on('disconnect', () => {
        setConnecte(false);
        setGroupes({}); // le serveur oublie nos groupes quand on part
        });
        socket.on('erreur_connexion', (message: string) => setErreur(message));
        socket.on('utilisateurs', (liste: string[]) => setUtilisateurs(liste));

        socket.on('membres_groupe', (donnees: { groupe: string; membres: string[] }) =>
        setGroupes((precedent) => ({ ...precedent, [donnees.groupe]: donnees.membres })),
        );

        socket.on(
        'message_groupe',
        (m: { groupe: string; auteur: string; texte: string; heure: number }) =>
            ajouterMessage(`groupe:${m.groupe}`, { auteur: m.auteur, texte: m.texte, heure: m.heure }),
        );

        socket.on('message_prive', (m: { de: string; a: string; texte: string; heure: number }) => {
        const interlocuteur = m.de === pseudo ? m.a : m.de; // l'autre personne
        ajouterMessage(`prive:${interlocuteur}`, { auteur: m.de, texte: m.texte, heure: m.heure });
        });

        return () => {
        socket.disconnect();
        };
    }, [token, pseudo]);

    // Envoie un événement et attend la réponse du serveur
    function envoyerAvecReponse(evenement: string, donnees: unknown): Promise<Reponse> {
        return new Promise((resoudre) => {
        const socket = socketRef.current;
        if (!socket) return resoudre({ succes: false, erreur: 'Non connecté' });
        socket.emit(evenement, donnees, resoudre);
        });
    }

    const rejoindreGroupe = (nom: string) => envoyerAvecReponse('rejoindre_groupe', nom);
    const envoyerMessageGroupe = (groupe: string, texte: string) =>
        envoyerAvecReponse('message_groupe', { groupe, texte });
    const envoyerMessagePrive = (destinataire: string, texte: string) =>
        envoyerAvecReponse('message_prive', { destinataire, texte });

    return {
        connecte, erreur, utilisateurs, groupes, messages,
        rejoindreGroupe, envoyerMessageGroupe, envoyerMessagePrive,
    };
    }