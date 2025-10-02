/**
 * Utility functions for copy functionality
 */

/**
 * Copy text to clipboard with fallback support
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} - Success status
 */
export async function copyToClipboard(text) {
  try {
    // Try modern Clipboard API first
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    } else {
      // Fallback for older browsers or non-secure contexts
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      
      const successful = document.execCommand('copy')
      document.body.removeChild(textArea)
      
      return successful
    }
  } catch (err) {
    console.error('Failed to copy text:', err)
    return false
  }
}

/**
 * Check if clipboard API is available
 * @returns {boolean}
 */
export function isClipboardSupported() {
  return !!(navigator.clipboard && window.isSecureContext)
}

/**
 * Get user-friendly error message for copy failures
 * @param {Error} error - The error object
 * @returns {string} - User-friendly error message
 */
export function getCopyErrorMessage(error) {
  if (error.name === 'NotAllowedError') {
    return 'Copy permission denied. Please allow clipboard access.'
  } else if (error.name === 'NotFoundError') {
    return 'Clipboard not found. Your browser may not support copying.'
  } else {
    return 'Failed to copy text. Please try again.'
  }
}
