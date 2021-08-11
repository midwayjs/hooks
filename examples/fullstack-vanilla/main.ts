import api from './server/api';
import './style.css';

async function bootstrap() {
  const response = await api();

  document.querySelector('#app').innerHTML = `
    <h1>Hello Vite!</h1>
    <h2>Backend message: ${response.message}!</h2>
    <a href="https://vitejs.dev/guide/features.html" target="_blank">Documentation</a>
  `;
}

bootstrap();
