    // Un message prêt à être affiché
    export type MessageAffiche = {
    id: string;
    auteur: string;
    texte: string;
    heure: number;
    };

    // Réponse du serveur à une action
    export type Reponse = { succes: boolean; erreur?: string };