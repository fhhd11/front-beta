// Utility functions for Markdown processing and text cleaning

/**
 * Clean text from unwanted characters that appear during SSE streaming
 * @param {string} text - The text to clean
 * @returns {string} - Cleaned text
 */
export function cleanStreamingText(text) {
  if (!text) return ''
  
  // Replace literal \n\n with actual line breaks, but only if they appear as literal characters
  // This handles cases where \n\n appears as text during streaming but should be line breaks
  let cleaned = text.replace(/\\n\\n/g, '\n\n')
  
  // Remove any remaining literal backslash-n sequences that shouldn't be there
  cleaned = cleaned.replace(/\\n/g, '\n')
  
  return cleaned
}

/**
 * Convert basic Markdown to HTML for display
 * @param {string} markdown - The markdown text to convert
 * @returns {string} - HTML string
 */
export function markdownToHtml(markdown) {
  if (!markdown) return ''
  
  let html = markdown
  
  // Convert code blocks (```...```) to <pre><code> blocks
  html = html.replace(/```([\s\S]*?)```/g, (match, code) => {
    const trimmedCode = code.trim()
    return `<pre class="code-block"><code>${trimmedCode}</code></pre>`
  })
  
  // Convert **bold** to <strong>bold</strong>
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  
  // Convert *italic* to <em>italic</em> (but not if it's part of **bold**)
  html = html.replace(/(?<!\*)\*(?!\*)([^*]+?)\*(?!\*)/g, '<em>$1</em>')
  
  // Convert `code` to <code>code</code> (but not if it's already inside a code block)
  html = html.replace(/`([^`]+?)`/g, '<code class="inline-code">$1</code>')
  
  // Convert line breaks to <br> tags (but not inside code blocks)
  html = html.replace(/\n/g, '<br>')
  
  return html
}

/**
 * Process text for display: clean streaming artifacts and convert markdown
 * @param {string} text - The text to process
 * @returns {string} - Processed HTML string
 */
export function processMessageText(text) {
  if (!text) return ''
  
  // First clean the text from streaming artifacts
  const cleaned = cleanStreamingText(text)
  
  // Then convert markdown to HTML
  const html = markdownToHtml(cleaned)
  
  return html
}
