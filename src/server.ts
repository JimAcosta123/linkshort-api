import { createApp } from './app';
import { connectDB } from './config/db';
import { env } from './config/env';

async function main() {
  await connectDB(env.MONGO_URI);
  console.log('MongoDB conectado');

  const app = createApp();
  app.listen(env.PORT, () => {
    console.log('LinkShort API corriendo en ' + env.BASE_URL + ' (puerto ' + env.PORT + ')');
    console.log('Documentacion: ' + env.BASE_URL + '/api/docs');
  });
}

main().catch((err) => {
  console.error('Error al iniciar la aplicacion:', err);
  process.exit(1);
});
