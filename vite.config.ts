import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: true, // Mở mạng LAN cho điện thoại cùng Wi-Fi truy cập
    port: 3000,
    open: false
  },
  build: {
    target: 'esnext'
  }
});
