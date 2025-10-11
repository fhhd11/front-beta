import { supabase } from '../config/supabase.js'
import { apiClient } from './client.js'

/**
 * API для генерации изображений через Gemini и загрузки в Supabase Storage
 */
export const imageGenerationApi = {
  /**
   * Генерация изображения через Gemini chat completions с modalities
   * @param {string} prompt - Промпт для генерации изображения
   * @param {Object} options - Дополнительные опции для модели
   * @returns {Promise<Object>} - Ответ с сгенерированным изображением
   */
  async generateImage(prompt, options = {}) {
    try {
      const litellmBaseUrl = import.meta.env.VITE_LITELLM_BASE_URL
      const model = 'gemini/gemini-2.5-flash-image'
      
      console.log('Image generation environment check:', {
        litellmBaseUrl,
        model,
        allEnvVars: import.meta.env
      })
      
      if (!litellmBaseUrl) {
        throw new Error('VITE_LITELLM_BASE_URL is not configured')
      }

      // Get litellm_key from user profile
      const { data: userData } = await apiClient.get('/api/v1/me')
      const litellmKey = userData?.litellm_key
      
      if (!litellmKey) {
        throw new Error('LiteLLM key not found in user profile')
      }

      // Make request to LiteLLM using chat completions with modalities
      const response = await fetch(`${litellmBaseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${litellmKey}`
        },
        body: JSON.stringify({
          model,
          messages: [{
            role: 'user',
            content: prompt
          }],
          modalities: ['text', 'image'],
          response_format: { type: 'image' },
          ...options
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`LiteLLM API error: ${response.status} ${errorText}`)
      }

      const data = await response.json()
      
      return data
    } catch (error) {
      console.error('Error generating image:', error)
      throw new Error(`Failed to generate image: ${error.message}`)
    }
  },
  
  /**
   * Загрузка изображения в Supabase Storage
   * @param {Blob} imageBlob - Blob с изображением
   * @param {string} userId - ID пользователя
   * @param {string} chatId - ID чата
   * @returns {Promise<{path: string, url: string}>} - Путь и URL изображения
   */
  async uploadToStorage(imageBlob, userId, chatId) {
    try {
      // Создаем уникальное имя файла с timestamp
      const timestamp = Date.now()
      const fileName = `${userId}/${chatId}/${timestamp}.png`
      
      
      const { data, error } = await supabase.storage
        .from('llm-generated-images')
        .upload(fileName, imageBlob, {
          contentType: 'image/png',
          upsert: false // Не перезаписывать существующие файлы
        })
      
      if (error) {
        console.error('Storage upload error:', error)
        throw new Error(`Failed to upload image: ${error.message}`)
      }
      
      // Получаем публичный URL
      const { data: { publicUrl } } = supabase.storage
        .from('llm-generated-images')
        .getPublicUrl(fileName)
      
      return { 
        path: fileName, 
        url: publicUrl,
        fileName: `${timestamp}.png`
      }
    } catch (error) {
      console.error('Error in uploadToStorage:', error)
      throw error
    }
  },

  /**
   * Удаление изображения из Storage
   * @param {string} imagePath - Путь к изображению в storage
   * @returns {Promise<boolean>} - Успешность удаления
   */
  async deleteFromStorage(imagePath) {
    try {
      const { error } = await supabase.storage
        .from('llm-generated-images')
        .remove([imagePath])
      
      if (error) {
        console.error('Error deleting from storage:', error)
        return false
      }
      
      return true
    } catch (error) {
      console.error('Error in deleteFromStorage:', error)
      return false
    }
  },

  /**
   * Преобразование base64 строки в Blob
   * @param {string} base64String - Base64 строка изображения
   * @param {string} mimeType - MIME тип (по умолчанию image/png)
   * @returns {Blob} - Blob объект
   */
  base64ToBlob(base64String, mimeType = 'image/png') {
    try {
      // Удаляем префикс data:image/...;base64, если есть
      let base64Data = base64String.replace(/^data:image\/[a-z]+;base64,/, '')
      
      // Удаляем все пробелы и переносы строк
      base64Data = base64Data.replace(/\s/g, '')
      
      // Проверяем, что строка содержит только валидные base64 символы
      if (!/^[A-Za-z0-9+/]*={0,2}$/.test(base64Data)) {
        throw new Error('Invalid base64 string format')
      }
      
      // Декодируем base64
      const byteCharacters = atob(base64Data)
      const byteNumbers = new Array(byteCharacters.length)
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      
      const byteArray = new Uint8Array(byteNumbers)
      return new Blob([byteArray], { type: mimeType })
    } catch (error) {
      console.error('Error converting base64 to blob:', error)
      console.error('Base64 string length:', base64String?.length)
      console.error('Base64 string preview:', base64String?.substring(0, 100))
      throw new Error(`Failed to convert base64 to blob: ${error.message}`)
    }
  },

  /**
   * Полный процесс генерации и загрузки изображения
   * @param {string} prompt - Промпт для генерации
   * @param {string} userId - ID пользователя
   * @param {string} chatId - ID чата
   * @returns {Promise<{url: string, path: string, fileName: string}>}
   */
  async generateAndUploadImage(prompt, userId, chatId) {
    try {
      // 1. Генерируем изображение через chat completions
      const response = await this.generateImage(prompt)
      
      // 2. Извлекаем изображение из ответа
      // Проверяем разные возможные форматы ответа
      let base64Image = null
      
      // Формат 1: choices[0].message.images[0] (data URL или объект)
      if (response.choices?.[0]?.message?.images?.[0]) {
        const imageData = response.choices[0].message.images[0]
        
        // Может быть строка (data URL) или объект
        if (typeof imageData === 'string') {
          if (imageData.startsWith('data:')) {
            base64Image = imageData.split(',')[1]
          } else {
            base64Image = imageData
          }
        } else if (typeof imageData === 'object') {
          // Проверяем разные возможные поля
          if (imageData.image_url?.url) {
            const url = imageData.image_url.url
            base64Image = url.startsWith('data:') ? url.split(',')[1] : url
          } else if (imageData.url) {
            const url = imageData.url
            base64Image = url.startsWith('data:') ? url.split(',')[1] : url
          } else if (imageData.b64_json) {
            base64Image = imageData.b64_json
          } else if (imageData.data) {
            base64Image = imageData.data
          }
        }
      }
      // Формат 2: choices[0].message.image (старый формат)
      else if (response.choices?.[0]?.message?.image) {
        const image = response.choices[0].message.image
        console.log('Found image in choices[0].message.image')
        if (typeof image === 'string') {
          if (image.startsWith('data:')) {
            base64Image = image.split(',')[1]
          } else {
            base64Image = image
          }
        }
      }
      // Формат 3: choices[0].message.content (может содержать изображение)
      else if (response.choices?.[0]?.message?.content) {
        const content = response.choices[0].message.content
        console.log('Checking choices[0].message.content:', typeof content)
        
        // Может быть массивом с разными частями
        if (Array.isArray(content)) {
          const imagePart = content.find(part => part.type === 'image' || part.type === 'image_url')
          if (imagePart) {
            if (imagePart.image_url?.url) {
              const url = imagePart.image_url.url
              base64Image = url.startsWith('data:') ? url.split(',')[1] : url
            } else if (imagePart.image) {
              base64Image = imagePart.image.startsWith('data:') ? imagePart.image.split(',')[1] : imagePart.image
            }
          }
        }
      }
      
      if (!base64Image) {
        console.error('Could not find image in response structure')
        throw new Error('Could not extract image from API response')
      }
      
      // 3. Преобразуем base64 в Blob
      const imageBlob = this.base64ToBlob(base64Image)
      
      // 4. Загружаем в storage
      const uploadResult = await this.uploadToStorage(imageBlob, userId, chatId)
      
      return {
        url: uploadResult.url,
        path: uploadResult.path,
        fileName: uploadResult.fileName
      }
    } catch (error) {
      console.error('Error in generateAndUploadImage:', error)
      throw error
    }
  }
}
