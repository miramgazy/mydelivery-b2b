<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import telegramService from '@/services/telegram'

const router = useRouter()
const authStore = useAuthStore()

onMounted(async () => {
  try {
    // Инициализация Telegram без блокировки интерфейса
    telegramService.init()
    
    // Проверка доступа в фоновом режиме
    if (telegramService.isInTelegram()) {
      const tgUser = telegramService.getUser()
      if (tgUser) {
        console.log('TG User:', tgUser.id)
        if (!authStore.isAuthenticated) {
            await authStore.checkAccess()
            await authStore.login()
        }
      }
    }
  } catch (err) {
    console.warn('Init warning:', err)
  }
})
</script>

<template>
  <div class="app-container">
    <router-view></router-view>
  </div>
</template>

<style>
.app-container {
  width: 100%;
  min-height: 100vh;
  background: var(--tg-theme-bg-color, #fff);
  color: var(--tg-theme-text-color, #000);
}
</style>