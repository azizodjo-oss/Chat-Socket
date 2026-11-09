
    const URL_API = 'http://localhost:3000';

    // Ce que le serveur renvoie après une connexion réussie
    export type Session = { token: string; pseudo: string };

    // Envoie un POST en JSON ; lance une erreur lisible si le serveur refuse.
    // <T> = le type de la réponse attendue, précisé à chaque appel.
    async function envoyer<T>(chemin: string, donnees: object): Promise<T> {
    let reponse: Response;
    try {
        reponse = await fetch(`${URL_API}${chemin}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(donnees),
        });
    } catch {
        throw new Error('server injoinables verifie si il est est lancer ou contacter le services clients ');
    }

    const resultat = await reponse.json();
    if (!reponse.ok) throw new Error(resultat.message || 'Erreur serveur');
    return resultat as T;
    }

    // Crée un compte
    export const inscrire = (pseudo: string, motDePasse: string) =>
    envoyer<{ pseudo: string }>('/auth/inscription', { pseudo, motDePasse });

    // Se connecte : renvoie { token, pseudo }
    export const connecter = (pseudo: string, motDePasse: string) =>
    envoyer<Session>('/auth/connexion', { pseudo, motDePasse });