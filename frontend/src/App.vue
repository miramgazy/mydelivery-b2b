<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import telegramService from '@/services/telegram'

const router = useRouter()
const authStore = useAuthStore()

const isCheckingAccess = ref(true)

// Глобальный перехватчик ошибок
window.onerror = function(message, source, lineno) {
  alert(`JS ERROR: ${message} at ${lineno}`);
};

const isAdminPath = computed(() => router.currentRoute.value.path.startsWith('/admin'))

onMounted(async () => {
  alert('ВЕРСИЯ 1.0.8: Старт [Без компонентов]')
  
  try {
    telegramService.init()
    
    if (!telegramService.isInTelegram()) {
      isCheckingAccess.value = false
      return
    }

    const tgUser = telegramService.getUser()
    const telegramId = tgUser?.id
    alert(`Шаг 2: ID получен - ${telegramId}`)

    // Проверяем доступ
    alert('Шаг 3: Запрос к API...')
    await authStore.checkAccess()
    alert(`Шаг 3: Ответ получен. hasAccess=${authStore.hasAccess}`)

    if (!authStore.hasAccess) {
      alert('ДОСТУП ЗАПРЕЩЕН');
      isCheckingAccess.value = false
      return
    }

    // Входим
    alert('Шаг 4: Логин...')
    const loginResult = await authStore.login()
    alert(`Шаг 4: Результат: ${loginResult.success ? 'УСПЕХ' : 'ОШИБКА'}`)
    
    if (loginResult.success) {
      await authStore.fetchCurrentUser()
      router.push('/')
    }

  } catch (err) {
    alert(`КРИТИЧЕСКАЯ ОШИБКА: ${err.message}`)
  } finally {
    isCheckingAccess.value = false
  }
})
</script>

<template>
  <div class="app-container">
    <router-view v-if="!isCheckingAccess"></router-view>
    <div v-else class="checking-screen">
      <div class="loader"></div>
      <p>Загрузка v1.0.8...</p>
    </div>
  </div>
</template>

<style>
.checking-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: #000;
  color: #3498db;
}
.loader {
  border: 4px solid #111;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>