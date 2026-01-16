import api, { setAuthToken, setRefreshToken } from './api'
import telegramService from './telegram'

class AuthService {
    /**
     * Проверка доступа пользователя по Telegram ID
     */
    async checkAccess(telegramId) {
        try {
            console.log('API Request: check_access for', telegramId)
            const response = await api.post('/users/check_access/', {
                telegram_id: telegramId
            }, {
                skipAuth: true
            })
            console.log('API Response: check_access success')
            return response.data
        } catch (error) {
            console.error('API Error: check_access', error.message)
            throw error
        }
    }

    /**
     * Аутентификация через Telegram Mini App
     */
    async loginWithTelegram() {
        try {
            const initData = telegramService.getInitData()
            if (!initData) throw new Error('Telegram initData not available')

            alert('Начинаю финальный вход (Login)...')
            const response = await api.post('/auth/telegram/', {
                initData: initData
            }, {
                skipAuth: true // Важно: не шлем старые токены
            })

            const { access, refresh, user } = response.data
            setAuthToken(access)
            setRefreshToken(refresh)

            return {
                success: true,
                user,
                message: response.data.message
            }
        } catch (error) {
            const msg = error.response?.data?.message || error.message
            alert(`Ошибка Login: ${msg}`)
            return {
                success: false,
                message: msg
            }
        }
    }
}

export default new AuthService()