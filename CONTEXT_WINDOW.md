# 🧠 Управление контекстным окном

## Обзор

Система автоматического управления контекстным окном (Context Window Management) отвечает за мониторинг и оптимизацию использования памяти AI-агента.

## Основные компоненты

### 1. Мониторинг контекста (`useContextWindow.js`)

Composable, который отслеживает:
- **Текущее использование контекста** (в токенах)
- **Максимальный размер контекста**
- **Процент заполнения**
- **Количество сообщений в памяти**
- **Статистику памяти агента**

### 2. Автоматическая суммаризация

Система автоматически суммаризирует историю сообщений, когда:
- Контекст заполнен на **80% или более**
- В истории есть **минимум 15 сообщений**

## Параметры суммаризации

### Минимальное количество сообщений
```javascript
const MIN_MESSAGES_FOR_SUMMARIZATION = 15
```

**Почему 15?**
- Letta требует достаточное количество сообщений для корректной суммаризации
- При меньшем количестве может возникнуть ошибка `ValueError: No assistant message found`
- 15 сообщений обеспечивают достаточный контекст для суммаризации

### Количество сохраняемых сообщений
```javascript
const MAX_MESSAGE_LENGTH = 10
```

После суммаризации в контексте остаются **последние 10 сообщений**, а более старые сообщения сжимаются в summary.

### Порог автоматической суммаризации
```javascript
const AUTO_SUMMARIZE_THRESHOLD = 80 // процентов
```

Суммаризация срабатывает автоматически при 80%+ заполнении контекста.

## Как это работает

### 1. Проверка перед отправкой сообщения

```javascript
// ChatPage.vue - handleSendMessage
const wasSummarized = await checkAndSummarize()
if (wasSummarized) {
  await loadMessages() // Обновляем сообщения после суммаризации
}
```

### 2. Логика проверки

```javascript
// useContextWindow.js - checkAndSummarize
const checkAndSummarize = async () => {
  // Проверка 1: Есть ли данные о контексте?
  if (!contextUsage.value) return false
  
  // Проверка 2: Достаточно ли сообщений?
  if (memoryStats.value.messages < 15) {
    console.log('Skipping: only X messages (need at least 15)')
    return false
  }
  
  // Проверка 3: Контекст заполнен на 80%+?
  if (contextUsage.value.percentage >= 80) {
    const success = await summarizeConversation(10)
    return success
  }
  
  return false
}
```

### 3. Выполнение суммаризации

```javascript
// useContextWindow.js - summarizeConversation
const summarizeConversation = async (maxMessageLength = 10) => {
  // Двойная проверка количества сообщений
  if (memoryStats.value.messages < 15) {
    console.warn('Not enough messages to summarize')
    return false
  }
  
  try {
    // POST запрос к API
    const endpoint = `/api/v1/letta/agents/${lettaAgentId}/summarize?max_message_length=${maxMessageLength}`
    await apiClient.post(endpoint, {})
    
    // Обновляем данные контекста
    await fetchContextData()
    
    return true
  } catch (err) {
    // Graceful degradation - не прерываем работу
    console.error('Summarization failed:', err)
    return false
  }
}
```

## Обработка ошибок

### Ошибка: "No assistant message found"

**Причина:**
Letta не может найти сообщение ассистента в указанном диапазоне (обычно при недостаточном количестве сообщений).

**Защита:**
1. Проверка количества сообщений перед суммаризацией (минимум 15)
2. Специальная обработка этой ошибки - не выбрасываем исключение, просто пропускаем суммаризацию
3. Логирование предупреждения в консоль

```javascript
if (apiError.message?.includes('No assistant message found')) {
  console.warn('Summarization skipped: not enough assistant messages')
  return false // Gracefully skip
}
```

### Graceful Degradation

Если суммаризация не удалась:
- ❌ **НЕ блокируем** отправку сообщения пользователя
- ✅ **Логируем** ошибку для отладки
- ✅ **Продолжаем** работу в обычном режиме
- ✅ **Повторим попытку** при следующей отправке

## Индикатор контекста в UI

### Компонент: `ContextWindowIndicator.vue`

Отображает:
- **Текущее использование** / **Максимальный размер** (в токенах)
- **Прогресс-бар** с процентом заполнения
- **Цветовая индикация:**
  - 🟢 Зеленый: 0-79% (нормально)
  - 🟡 Желтый: 80-94% (предупреждение)
  - 🔴 Красный: 95-100% (критично)

### Статистика памяти

```javascript
memoryStats = {
  messages: 12,        // Количество сообщений
  archival: 0,         // Архивная память
  recall: 0,           // Recall память
  summary: 1500,       // Токенов в summary
  core: 800,           // Токенов в core memory
  system: 500          // Токенов в system промптах
}
```

## API эндпоинты

### Получение данных о контексте
```
GET /api/v1/letta/agents/{agent_id}/context
```

**Ответ:**
```json
{
  "context_window_size_current": 15000,
  "context_window_size_max": 100000,
  "num_messages": 12,
  "num_archival_memory": 0,
  "num_recall_memory": 0,
  "num_tokens_summary_memory": 1500,
  "num_tokens_core_memory": 800,
  "num_tokens_system": 500
}
```

### Суммаризация контекста
```
POST /api/v1/letta/agents/{agent_id}/summarize?max_message_length=10
```

**Параметры:**
- `max_message_length` - количество сообщений для сохранения после суммаризации

## Автообновление данных

### Периодическое обновление

```javascript
// Запускается при монтировании ChatPage
const cleanup = startAutoRefresh(30000) // Каждые 30 секунд
```

### Обновление после событий

Контекст обновляется автоматически после:
- ✅ Отправки сообщения (с задержкой 1 сек)
- ✅ Успешной суммаризации
- ✅ Сброса сообщений

## Отладка

### Консольные логи

```javascript
// Проверка суммаризации (пропущена из-за малого кол-ва сообщений)
"Skipping summarization check: only 4 messages (need at least 15)"

// Проверка суммаризации (недостаточно сообщений)
"Not enough messages to summarize (4 < 15). Skipping summarization."

// Суммаризация пропущена (ошибка от Letta)
"Summarization skipped: not enough assistant messages in range"

// Суммаризация не нужна (контекст не заполнен)
// (нет лога - функция возвращает false молча)
```

### Проверка в браузере

```javascript
// В консоли разработчика
const { contextUsage, memoryStats } = useContextWindow()
console.log('Usage:', contextUsage.value.percentage + '%')
console.log('Messages:', memoryStats.value.messages)
console.log('Current/Max:', contextUsage.value.current, '/', contextUsage.value.max)
```

## Best Practices

### ✅ Рекомендации

1. **Не отключайте автосуммаризацию** - она защищает от переполнения контекста
2. **Мониторьте индикатор контекста** - следите за процентом заполнения
3. **При желтом/красном индикаторе** - контекст будет автоматически очищен
4. **Не паникуйте при ошибках суммаризации** - система работает в режиме graceful degradation

### ⚠️ Потенциальные проблемы

1. **Частые суммаризации** - если контекст быстро заполняется:
   - Возможно, слишком большие сообщения
   - Возможно, нужно увеличить `max_message_length`
   
2. **Суммаризация всегда пропускается** - если сообщений < 15:
   - Это нормально для новых чатов
   - Просто продолжайте общаться
   
3. **Ошибки от Letta** - если видите частые ошибки:
   - Проверьте логи бекенда
   - Возможно, проблема в конфигурации Letta

## История изменений

### v1.1.0 (2025-10-09)
- ✅ Добавлена защита от суммаризации при недостаточном количестве сообщений
- ✅ Минимальный порог: 15 сообщений
- ✅ Улучшена обработка ошибки "No assistant message found"
- ✅ Добавлено подробное логирование

### v1.0.0 (Начальная версия)
- ✅ Базовая функциональность мониторинга контекста
- ✅ Автоматическая суммаризация при 80%+ заполнении
- ✅ Индикатор контекста в UI

## Связанные файлы

- `src/composables/useContextWindow.js` - основная логика
- `src/components/ContextWindowIndicator.vue` - UI компонент
- `src/views/ChatPage.vue` - интеграция в страницу чата
- `TROUBLESHOOTING.md` - решение проблем


