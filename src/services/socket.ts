    import { io, type Socket } from 'socket.io-client';

    // Ouvre la connexion temps réel en envoyant le jeton
    export function ouvrirSocket(token: string): Socket {
    return io('http://localhost:3000', { auth: { token } });
    }