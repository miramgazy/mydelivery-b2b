<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import telegramService from '@/services/telegram'

const router = useRouter()
const authStore = useAuthStore()

const isCheckingAccess = ref(true)
const statusMessage = ref('СИСТЕМА v1.3.0 ЗАГРУЖЕНА...')

onMounted(async () => {
  try {
    telegramService.init()
    if (!telegramService.isInTelegram()) {
      isCheckingAccess.value = false
      return
    }

    const tgUser = telegramService.getUser()
    statusMessage.value = `ID: ${tgUser?.id}. Выполняю запрос...`

    // Прямой fetch с защитой от "зависания"
    const response = await fetch('/api/users/check_access/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegram_id: tgUser.id })
    });
    
    statusMessage.value = `Статус: ${response.status}. Читаю данные...`;
    
    if (response.ok) {
        const result = await response.json();
        if (result.has_access) {
            statusMessage.value = 'ДОСТУП ЕСТЬ. Начинаю логин...';
            const logRes = await authStore.login();
            if (logRes.success) {
                statusMessage.value = 'УСПЕХ. Вход...';
                router.push('/');
                isCheckingAccess.value = false;
            } else {
                statusMessage.value = `ОШИБКА ЛОГИНА: ${logRes.message}`;
            }
        } else {
            statusMessage.value = 'ОТКАЗАНО: Пользователь не найден в базе.';
        }
    } else {
        statusMessage.value = `ОШИБКА API: ${response.status}`;
    }

  } catch (err) {
    statusMessage.value = `FATAL ERROR: ${err.message}`;
  }
})
</script>

<template>
  <div class="app-container">
    <router-view v-if="!isCheckingAccess"></router-view>
    <div v-else class="checking-screen">
      <div class="matrix-loader"></div>
      <p class="matrix-text">{{ statusMessage }}</p>
      <div style="font-size: 8px; color: #555; margin-top: 50px;">DEBUG VERSION 1.3.0</div>
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
  color: #0f0; /* Зеленый "матричный" текст */
  text-align: center;
  padding: 20px;
  font-family: monospace;
}
.matrix-loader {
  border: 2px solid #030;
  border-top: 2px solid #0f0;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 0.8s linear infinite;
  margin-bottom: 20px;
}
.matrix-text {
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 1px;
}
@keyframes spin { 100% { transform: rotate(360deg); } }
</style>