import { SocketIOEventNamespace } from 'chen/web';

export const EVENTS: SocketIOEventNamespace[] = [
  {
    namespace: '/',
    events: [
      { name: 'connection', handler: 'ConnectionHandler@connection' },
      { name: 'disconnect', handler: 'ConnectionHandler@disconnect' },
    ]
  }
];
