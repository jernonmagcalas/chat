import { LanguageProvider, ViewProvider } from 'chen/core';
import { ConnectionProvider } from 'chen/sql';
import { bootstrap } from 'chen/console';

bootstrap(__dirname, [
    LanguageProvider,
    ConnectionProvider,
    ViewProvider
  ])
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
