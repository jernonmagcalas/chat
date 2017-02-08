import { LanguageProvider, ViewProvider } from 'chen/core';
import { ArtisanProvider } from 'chen/console';
import { ConnectionProvider } from 'chen/sql';
import {
  SettingsProvider,
  ContextProvider,
  LogProvider,
  AssetsProvider,
  RequestProvider,
  SessionProvider,
  RouteProvider,
  ExceptionProvider,
  SocketIOProvider,
  bootstrap
} from 'chen/web';

bootstrap(__dirname, [
    SettingsProvider,
    LanguageProvider,
    ConnectionProvider,
    ContextProvider,
    LogProvider,
    ArtisanProvider,
    AssetsProvider,
    RequestProvider,
    SessionProvider,
    ViewProvider,
    RouteProvider,
    ExceptionProvider,
    SocketIOProvider
  ])
  .catch(err => console.error(err));
