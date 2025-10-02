# Интеграция с бэкендом etrnl.chat

## 🚀 Обзор интеграции

Приложение теперь интегрировано с вашим бэкендом и автоматически получает информацию о пользователе, включая `letta_agent_id` для взаимодействия с AI-агентом.

## 🔧 Настройка

### 1. Переменные окружения

Создайте файл `.env.local` в корне проекта:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Backend API Configuration
VITE_API_BASE_URL=http://localhost:8000
```

### 2. Структура API

Ваш бэкенд должен предоставлять следующие эндпоинты:

#### GET /api/v1/me
Возвращает информацию о текущем пользователе:

```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "name": "Имя пользователя",
  "letta_agent_id": "agent-uuid",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

#### GET /api/v1/agent
Возвращает информацию об агенте пользователя:

```json
{
  "id": "agent-uuid",
  "name": "Мой AI-ассистент",
  "status": "active",
  "created_at": "2024-01-01T00:00:00Z"
}
```

## 🔐 Аутентификация

### JWT токены
- Приложение использует JWT токены из Supabase
- Токены автоматически добавляются в заголовки запросов
- Автоматическое обновление токенов
- Обработка истечения сессий

### Заголовки запросов
```javascript
{
  'Authorization': 'Bearer <supabase-jwt-token>',
  'Content-Type': 'application/json'
}
```

## 📱 Функциональность

### Автоматическая загрузка профиля
- ✅ При входе в систему автоматически загружается профиль пользователя
- ✅ Сохраняется `letta_agent_id` для последующих запросов
- ✅ Отображается информация об агенте в UI

### Состояние аутентификации
```javascript
import { useAuth } from '@/composables/useAuth.js'

const {
  user,           // Supabase user object
  userProfile,    // Extended user info from backend
  lettaAgentId,   // User's Letta agent ID
  isAuthenticated, // Auth status
  hasAgent,       // Whether user has an agent
  userName,       // Display name
  userEmail       // User email
} = useAuth()
```

### Работа с агентом
```javascript
import { useAgent } from '@/composables/useAgent.js'

const {
  agentInfo,      // Agent information
  agentId,        // Agent ID
  agentName,      // Agent display name
  agentStatus,    // Agent status (active, inactive, training)
  isAgentReady,   // Whether agent is ready for interaction
  loadAgentInfo   // Function to load agent info
} = useAgent()
```

## 🎨 UI обновления

### Информация о пользователе
В правом верхнем углу чата отображается:
- ✅ Имя пользователя
- ✅ Email
- ✅ Статус агента (с цветовым индикатором)
- ✅ Имя агента
- ✅ Сокращенный Agent ID

### Индикаторы статуса агента
- 🟢 **Зеленый** - агент активен и готов к работе
- 🟡 **Желтый** - агент в процессе обучения
- 🔴 **Красный** - агент неактивен
- ⚪ **Серый** - статус неизвестен

## 🔄 Поток данных

### 1. Вход в систему
```
Supabase Auth → Получение JWT → Запрос /api/v1/me → Сохранение letta_agent_id
```

### 2. Загрузка информации об агенте
```
Проверка letta_agent_id → Запрос /api/v1/agent → Отображение в UI
```

### 3. Обновление состояния
```
Auth state change → Автоматическая перезагрузка профиля → Обновление UI
```

## 🛠️ API клиент

### Базовый класс
```javascript
import { apiClient } from '@/api/client.js'

// GET запрос
const { data, error } = await apiClient.get('/api/v1/me')

// POST запрос
const { data, error } = await apiClient.post('/api/v1/chat/message', {
  message: 'Hello',
  agent_id: lettaAgentId.value
})
```

### Обработка ошибок
```javascript
import { ApiError } from '@/api/client.js'

try {
  const { data, error } = await apiClient.get('/api/v1/me')
} catch (error) {
  if (error instanceof ApiError) {
    if (error.isAuthError()) {
      // Обработка ошибок аутентификации
    } else if (error.isNetworkError()) {
      // Обработка сетевых ошибок
    }
  }
}
```

## 📊 Логирование

Все API запросы логируются в консоль для отладки:
- ✅ Успешные запросы
- ✅ Ошибки API
- ✅ Состояние аутентификации
- ✅ Загрузка профиля пользователя

## 🚨 Обработка ошибок

### Типы ошибок
- **401 Unauthorized** - сессия истекла
- **403 Forbidden** - нет прав доступа
- **404 Not Found** - ресурс не найден
- **422 Validation Error** - ошибка валидации
- **5xx Server Error** - ошибка сервера
- **Network Error** - проблемы с сетью

### Пользовательские сообщения
Все ошибки отображаются пользователю на русском языке с понятными сообщениями.

## 🔮 Следующие шаги

### Готово к реализации:
1. **Отправка сообщений** через `/api/v1/chat/message`
2. **Получение истории** через `/api/v1/chat/messages`
3. **Управление памятью** агента
4. **Настройки агента**

### Пример использования letta_agent_id:
```javascript
// Отправка сообщения агенту
const sendMessage = async (message) => {
  const { data, error } = await apiClient.post('/api/v1/chat/message', {
    message,
    agent_id: lettaAgentId.value
  })
}
```

## 📚 Дополнительные ресурсы

- [API Client Documentation](./src/api/client.js)
- [Auth Composable](./src/composables/useAuth.js)
- [Agent Composable](./src/composables/useAgent.js)
- [API Configuration](./src/config/api.js)
