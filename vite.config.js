import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    host: "0.0.0.0",  //配置可访问该项目的 ip 地址
    port: 8080  //配置启动端口
  }
})
