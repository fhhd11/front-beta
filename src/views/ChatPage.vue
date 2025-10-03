<template>
  <div class="min-h-screen w-full bg-[#141414] overflow-hidden relative flex items-center justify-center">
    <!-- Gradient Background Effects positioned at TOP -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden">
      <!-- Blurred gradient block behind chat - positioned at TOP with negative offset -->
      <div class="absolute left-1/2 -translate-x-1/2 w-full max-w-[1482px] h-[837px] rounded-[19.465px] backdrop-blur-[77.2px] shadow-[0px_0px_37.189px_-13.318px_rgba(0,0,0,0.67)] blur-[66.284px] will-change-transform" style="top: -687px;"></div>
      
      <!-- SVG Gradient Ellipses - 4 ellipses with soft glow and animations -->
      <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[1920px] h-full opacity-58 will-change-transform" style="pointer-events: none;">
        <svg class="absolute w-full h-full" viewBox="0 0 1920 1080" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
          <!-- Ellipse 1 (Green) - top center -->
          <g filter="url(#filter0_f_gradient)" class="animate-float-1">
            <ellipse cx="1132.28" cy="387.058" rx="357.863" ry="286.058" fill="#B8F3BF" fill-opacity="0.8" class="animate-pulse-slow"/>
          </g>
          
          <!-- Ellipse 2 (Blue) - left bottom -->
          <g filter="url(#filter1_f_gradient)" class="animate-float-2">
            <ellipse cx="521.762" cy="693.872" rx="189.54" ry="264.353" fill="#81BBF2" fill-opacity="0.8" class="animate-pulse-slow"/>
          </g>
          
          <!-- Ellipse 3 (Pink) - left top -->
          <g filter="url(#filter2_f_gradient)" class="animate-float-3">
            <ellipse cx="654.654" cy="386.583" rx="418.654" ry="264.353" fill="#E9B1E5" fill-opacity="0.8" class="animate-pulse-slow"/>
          </g>
          
          <!-- Ellipse 4 (Purple) - right center -->
          <g filter="url(#filter3_f_gradient)" class="animate-float-4">
            <ellipse cx="1356.83" cy="681.594" rx="326.175" ry="369.405" fill="#7E90D9" fill-opacity="0.8" class="animate-pulse-slow"/>
          </g>
          
          <defs>
            <!-- Gaussian blur filters for soft glow effect -->
            <filter id="filter0_f_gradient" x="395.972" y="-277.444" width="1472.61" height="1329.01" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
              <feFlood flood-opacity="0" result="BackgroundImageFix"/>
              <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
              <feGaussianBlur stdDeviation="189.222" result="effect1_foregroundBlur"/>
            </filter>
            
            <filter id="filter1_f_gradient" x="-46.2213" y="51.0756" width="1135.97" height="1285.59" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
              <feFlood flood-opacity="0" result="BackgroundImageFix"/>
              <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
              <feGaussianBlur stdDeviation="189.222" result="effect1_foregroundBlur"/>
            </filter>
            
            <filter id="filter2_f_gradient" x="-142.444" y="-256.214" width="1594.2" height="1285.59" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
              <feFlood flood-opacity="0" result="BackgroundImageFix"/>
              <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
              <feGaussianBlur stdDeviation="189.222" result="effect1_foregroundBlur"/>
            </filter>
            
            <filter id="filter3_f_gradient" x="652.206" y="-66.2545" width="1409.24" height="1495.7" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
              <feFlood flood-opacity="0" result="BackgroundImageFix"/>
              <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
              <feGaussianBlur stdDeviation="189.222" result="effect1_foregroundBlur"/>
            </filter>
          </defs>
        </svg>
      </div>
    </div>

    <!-- Main Content Container -->
    <div class="main-content-container relative w-full max-w-[1920px] h-screen flex flex-col items-center justify-end gap-2 sm:gap-3 md:gap-4 lg:gap-5 xl:gap-6 px-2 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 pb-[10px] pt-20 sm:pt-24 md:pt-0">
      <!-- Chat Container -->
      <div class="chat-container-glow rounded-[12px] sm:rounded-[15px] md:rounded-[17px] lg:rounded-[19px] backdrop-blur-[77.2px] shadow-[0px_0px_36.3px_-13px_rgba(0,0,0,0.67)] relative overflow-hidden w-full h-[calc(100vh-180px)] sm:h-[calc(100vh-200px)] md:h-[78vh] lg:h-[85vh] xl:h-[82vh] 2xl:h-[80vh] will-change-auto" style="background: linear-gradient(128deg, rgba(0, 0, 0, 0.67) 17.72%, rgba(0, 0, 0, 0.67) 96.51%); max-width: 1447px;">
        <!-- Top gradient fade overlay -->
        <div class="absolute top-0 left-0 right-0 h-24 pointer-events-none z-10 fade-gradient-top"></div>
        
        <!-- Messages Container with scroll -->
        <div ref="messagesContainer" class="h-full overflow-y-auto scrollbar-hidden p-3 sm:p-4 md:p-5 lg:p-6 xl:p-8 2xl:p-10">
          <div class="flex flex-col gap-3 sm:gap-4 md:gap-5 lg:gap-6 xl:gap-7 2xl:gap-8">
            <!-- Messages -->
            <div v-for="message in messages" :key="message.id || message.reasoning?.id" :class="{ 'flex justify-end': message.role === 'user' }">
              <!-- User message -->
              <ChatMessage v-if="message.role === 'user'" :message="message" :is-user="true" />
              
              <!-- Grouped message from history (with reasoning + assistant) -->
              <div v-else-if="message.messageType === 'grouped'" class="flex flex-col gap-4 w-full history-message-appear">
                <!-- Agent Avatar -->
                <div class="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 xl:w-[29px] xl:h-[29.275px] flex-shrink-0">
                  <svg viewBox="0 0 29 30" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
                    <path d="M18.8662 0.28418C19.0924 -0.163482 19.7599 -0.0594699 19.8398 0.435547L20.96 7.41602C21.0015 7.67502 21.2922 7.80964 21.5166 7.67383L28.2129 3.61426C28.633 3.3596 29.1382 3.77935 28.9658 4.23926L24.9316 14.9873C24.8666 15.1605 24.9398 15.3557 25.1025 15.4434L28.0957 17.0479C28.5464 17.2894 28.4111 17.9681 27.9023 18.0186L24.7803 18.3271C24.5153 18.3535 24.3642 18.6436 24.4941 18.876L27.1396 23.5928C27.3459 23.9604 27.0498 24.4071 26.6309 24.3604L19.4297 23.5566C19.3143 23.5439 19.1987 23.5864 19.1191 23.6709L14.0078 29.1123C13.7512 29.385 13.2984 29.3033 13.1533 28.958L10.3262 22.2314C10.2641 22.0843 10.1143 21.9928 9.95508 22.0059L6.38965 22.2988C5.93036 22.3362 5.65419 21.7998 5.95215 21.4482L8.00293 19.0312C8.15668 18.8496 8.10152 18.5715 7.88965 18.4629L0.28125 14.5693C-0.163676 14.3409 -0.0575712 13.6754 0.436523 13.5967L7.71484 12.4414C7.98322 12.3988 8.11564 12.0911 7.96191 11.8672L0.835938 1.5166C0.527945 1.06823 1.03181 0.508808 1.50977 0.768555L13.0205 7.03809C13.2323 7.15322 13.4962 7.03837 13.5557 6.80469L13.7783 5.9248C13.8854 5.50446 14.4317 5.39441 14.6934 5.74023L15.1865 6.39355C15.3515 6.61195 15.6882 6.58127 15.8115 6.33691L18.8662 0.28418ZM13.0039 14.1426C12.5957 14.1428 12.2531 14.4834 12.3867 14.8691C12.4956 15.1834 12.6754 15.4723 12.915 15.7119C13.331 16.1277 13.8952 16.3613 14.4834 16.3613C15.0716 16.3613 15.6358 16.1278 16.0518 15.7119C16.2913 15.4724 16.4703 15.1833 16.5791 14.8691C16.7127 14.4832 16.3703 14.1426 15.9619 14.1426H13.0039ZM19.4424 14.1426C19.0342 14.1428 18.6916 14.4834 18.8252 14.8691C18.934 15.1833 19.113 15.4723 19.3525 15.7119C19.7685 16.1279 20.3336 16.3613 20.9219 16.3613C21.51 16.3613 22.0743 16.1278 22.4902 15.7119C22.7298 15.4723 22.9087 15.1833 23.0176 14.8691C23.1512 14.4832 22.8088 14.1426 22.4004 14.1426H19.4424Z" fill="#F5F5F5"/>
                  </svg>
                </div>
                
                <!-- Reasoning block (for historical messages) -->
                <div v-if="message.reasoning && message.reasoning.reasoning" class="relative w-full mb-3 sm:mb-4 md:mb-6 cursor-pointer group ml-6 sm:ml-7 md:ml-8 lg:ml-9 xl:ml-3 sm:ml-4 md:ml-5 lg:ml-6 xl:ml-8 reasoning-block">
                  <div class="w-[2px] sm:w-[2.5px] md:w-[3.337px] bg-white absolute left-[-10px] sm:left-[-14px] md:left-[-18px] lg:left-[-22px] xl:left-[-30px] top-[2px] sm:top-[2.5px] md:top-[3.121px] bottom-0 transition-opacity group-hover:opacity-80"></div>
                  <div 
                    class="text-white/70 font-['Roboto_Mono'] font-light text-xs sm:text-sm md:text-[15px] leading-[1.3] sm:leading-[1.4] md:leading-[16.871px] tracking-[1px] sm:tracking-[1.2px] md:tracking-[1.5px] overflow-hidden pr-2 transition-all duration-300 ease-in-out"
                    :class="expandedReasoning[message.reasoning.id || message.id] ? 'max-h-[400px] sm:max-h-[450px] md:max-h-[500px] overflow-y-auto scrollbar-hidden' : 'max-h-[30px] sm:max-h-[35px] md:max-h-[40px]'"
                    @click="toggleReasoning(message.reasoning.id || message.id)"
                  >
                    <p v-for="(line, index) in message.reasoning.reasoning.split('\n')" :key="index" :class="{ 'mb-0': index === message.reasoning.reasoning.split('\n').length - 1 }">
                      {{ line }}
                    </p>
                  </div>
                  <!-- Expand/Collapse indicator -->
                  <div 
                    class="mt-1 sm:mt-1.5 md:mt-2 text-white/50 text-[10px] sm:text-xs font-['Roboto_Mono'] hover:text-white/80 transition-colors"
                    @click="toggleReasoning(message.reasoning.id || message.id)"
                  >
                    {{ expandedReasoning[message.reasoning.id || message.id] ? '▲ Свернуть' : '▼ Развернуть рассуждения' }}
                  </div>
                </div>
                
                <!-- Assistant message (from history) -->
                <div v-if="message.assistant" class="ml-3 sm:ml-4 md:ml-5 lg:ml-6 xl:ml-8 response-block">
                  <ChatMessage 
                    :message="message.assistant" 
                    :is-user="false" 
                  />
                </div>
              </div>
              
              <!-- Streaming agent message (real-time) -->
              <div v-else-if="message.role === 'agent'" class="flex flex-col gap-4 w-full">
                <!-- Agent Avatar -->
                <div class="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 xl:w-[29px] xl:h-[29.275px] flex-shrink-0 agent-avatar-animation">
                  <svg viewBox="0 0 29 30" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
                    <path d="M18.8662 0.28418C19.0924 -0.163482 19.7599 -0.0594699 19.8398 0.435547L20.96 7.41602C21.0015 7.67502 21.2922 7.80964 21.5166 7.67383L28.2129 3.61426C28.633 3.3596 29.1382 3.77935 28.9658 4.23926L24.9316 14.9873C24.8666 15.1605 24.9398 15.3557 25.1025 15.4434L28.0957 17.0479C28.5464 17.2894 28.4111 17.9681 27.9023 18.0186L24.7803 18.3271C24.5153 18.3535 24.3642 18.6436 24.4941 18.876L27.1396 23.5928C27.3459 23.9604 27.0498 24.4071 26.6309 24.3604L19.4297 23.5566C19.3143 23.5439 19.1987 23.5864 19.1191 23.6709L14.0078 29.1123C13.7512 29.385 13.2984 29.3033 13.1533 28.958L10.3262 22.2314C10.2641 22.0843 10.1143 21.9928 9.95508 22.0059L6.38965 22.2988C5.93036 22.3362 5.65419 21.7998 5.95215 21.4482L8.00293 19.0312C8.15668 18.8496 8.10152 18.5715 7.88965 18.4629L0.28125 14.5693C-0.163676 14.3409 -0.0575712 13.6754 0.436523 13.5967L7.71484 12.4414C7.98322 12.3988 8.11564 12.0911 7.96191 11.8672L0.835938 1.5166C0.527945 1.06823 1.03181 0.508808 1.50977 0.768555L13.0205 7.03809C13.2323 7.15322 13.4962 7.03837 13.5557 6.80469L13.7783 5.9248C13.8854 5.50446 14.4317 5.39441 14.6934 5.74023L15.1865 6.39355C15.3515 6.61195 15.6882 6.58127 15.8115 6.33691L18.8662 0.28418ZM13.0039 14.1426C12.5957 14.1428 12.2531 14.4834 12.3867 14.8691C12.4956 15.1834 12.6754 15.4723 12.915 15.7119C13.331 16.1277 13.8952 16.3613 14.4834 16.3613C15.0716 16.3613 15.6358 16.1278 16.0518 15.7119C16.2913 15.4724 16.4703 15.1833 16.5791 14.8691C16.7127 14.4832 16.3703 14.1426 15.9619 14.1426H13.0039ZM19.4424 14.1426C19.0342 14.1428 18.6916 14.4834 18.8252 14.8691C18.934 15.1833 19.113 15.4723 19.3525 15.7119C19.7685 16.1279 20.3336 16.3613 20.9219 16.3613C21.51 16.3613 22.0743 16.1278 22.4902 15.7119C22.7298 15.4723 22.9087 15.1833 23.0176 14.8691C23.1512 14.4832 22.8088 14.1426 22.4004 14.1426H19.4424Z" fill="#F5F5F5"/>
                  </svg>
                </div>
                
                <!-- Reasoning block (appears above "typing" text - streaming) -->
                <div v-if="message.reasoning && message.reasoning.reasoning" class="relative w-full mb-3 sm:mb-4 md:mb-6 cursor-pointer group ml-3 sm:ml-4 md:ml-5 lg:ml-6 xl:ml-8 reasoning-block">
                  <div class="w-[2px] sm:w-[2.5px] md:w-[3.337px] bg-white absolute left-[-10px] sm:left-[-14px] md:left-[-18px] lg:left-[-22px] xl:left-[-30px] top-[2px] sm:top-[2.5px] md:top-[3.121px] bottom-0 transition-opacity group-hover:opacity-80"></div>
                  <div 
                    class="text-white/70 font-['Roboto_Mono'] font-light text-xs sm:text-sm md:text-[15px] leading-[1.3] sm:leading-[1.4] md:leading-[16.871px] tracking-[1px] sm:tracking-[1.2px] md:tracking-[1.5px] overflow-hidden pr-2 transition-all duration-300 ease-in-out"
                    :class="expandedReasoning[message.reasoning.id || message.id] ? 'max-h-[400px] sm:max-h-[450px] md:max-h-[500px] overflow-y-auto scrollbar-hidden' : 'max-h-[30px] sm:max-h-[35px] md:max-h-[40px]'"
                    @click="toggleReasoning(message.reasoning.id || message.id)"
                  >
                    <p v-for="(line, index) in message.reasoning.reasoning.split('\n')" :key="index" :class="{ 'mb-0': index === message.reasoning.reasoning.split('\n').length - 1 }">
                      {{ line }}
                    </p>
                  </div>
                  <!-- Expand/Collapse indicator -->
                  <div 
                    class="mt-1 sm:mt-1.5 md:mt-2 text-white/50 text-[10px] sm:text-xs font-['Roboto_Mono'] hover:text-white/80 transition-colors"
                    @click="toggleReasoning(message.reasoning.id || message.id)"
                  >
                    {{ expandedReasoning[message.reasoning.id || message.id] ? '▲ Свернуть' : '▼ Развернуть рассуждения' }}
                  </div>
                </div>
                
                <!-- "Агент печатает..." indicator (appears between reasoning and response, fades out when done) -->
                <transition name="fade">
                  <div v-if="message.isStreaming" class="flex items-center gap-2 ml-3 sm:ml-4 md:ml-5 lg:ml-6 xl:ml-8 typing-indicator">
                    <div class="flex gap-1">
                      <div class="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
                      <div class="w-2 h-2 bg-white/60 rounded-full animate-pulse" style="animation-delay: 0.2s"></div>
                      <div class="w-2 h-2 bg-white/60 rounded-full animate-pulse" style="animation-delay: 0.4s"></div>
                    </div>
                    <span class="text-sm text-white/70 font-['Roboto_Mono']">Агент печатает...</span>
                  </div>
                </transition>
                
                <!-- Response block (appears below "typing" text - streaming) -->
                <div v-if="message.content" class="ml-3 sm:ml-4 md:ml-5 lg:ml-6 xl:ml-8">
                  <ChatMessage 
                    :key="`${message.id}-content`"
                    :message="message" 
                    :is-user="false" 
                  />
                </div>
              </div>
            </div>

            <!-- Loading Indicator (only when sending, not streaming) -->
            <div v-if="isSending && !isStreaming" class="flex items-start gap-2.5 agent-loading">
              <svg class="w-7 h-7 md:w-[29px] md:h-[29px] flex-shrink-0" viewBox="0 0 29 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.8662 0.28418C19.0924 -0.163482 19.7599 -0.0594699 19.8398 0.435547L20.96 7.41602C21.0015 7.67502 21.2922 7.80964 21.5166 7.67383L28.2129 3.61426C28.633 3.3596 29.1382 3.77935 28.9658 4.23926L24.9316 14.9873C24.8666 15.1605 24.9398 15.3557 25.1025 15.4434L28.0957 17.0479C28.5464 17.2894 28.4111 17.9681 27.9023 18.0186L24.7803 18.3271C24.5153 18.3535 24.3642 18.6436 24.4941 18.876L27.1396 23.5928C27.3459 23.9604 27.0498 24.4071 26.6309 24.3604L19.4297 23.5566C19.3143 23.5439 19.1987 23.5864 19.1191 23.6709L14.0078 29.1123C13.7512 29.385 13.2984 29.3033 13.1533 28.958L10.3262 22.2314C10.2641 22.0843 10.1143 21.9928 9.95508 22.0059L6.38965 22.2988C5.93036 22.3362 5.65419 21.7998 5.95215 21.4482L8.00293 19.0312C8.15668 18.8496 8.10152 18.5715 7.88965 18.4629L0.28125 14.5693C-0.163676 14.3409 -0.0575712 13.6754 0.436523 13.5967L7.71484 12.4414C7.98322 12.3988 8.11564 12.0911 7.96191 11.8672L0.835938 1.5166C0.527945 1.06823 1.03181 0.508808 1.50977 0.768555L13.0205 7.03809C13.2323 7.15322 13.4962 7.03837 13.5557 6.80469L13.7783 5.9248C13.8854 5.50446 14.4317 5.39441 14.6934 5.74023L15.1865 6.39355C15.3515 6.61195 15.6882 6.58127 15.8115 6.33691L18.8662 0.28418ZM13.0039 14.1426C12.5957 14.1428 12.2531 14.4834 12.3867 14.8691C12.4956 15.1834 12.6754 15.4723 12.915 15.7119C13.331 16.1277 13.8952 16.3613 14.4834 16.3613C15.0716 16.3613 15.6358 16.1278 16.0518 15.7119C16.2913 15.4724 16.4703 15.1833 16.5791 14.8691C16.7127 14.4832 16.3703 14.1426 15.9619 14.1426H13.0039ZM19.4424 14.1426C19.0342 14.1428 18.6916 14.4834 18.8252 14.8691C18.934 15.1833 19.113 15.4723 19.3525 15.7119C19.7685 16.1279 20.3336 16.3613 20.9219 16.3613C21.51 16.3613 22.0743 16.1278 22.4902 15.7119C22.7298 15.4723 22.9087 15.1833 23.0176 14.8691C23.1512 14.4832 22.8088 14.1426 22.4004 14.1426H19.4424Z" fill="#F5F5F5"/>
              </svg>
              <div class="flex gap-1 mt-2">
                <div class="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                <div class="w-2 h-2 bg-white/60 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                <div class="w-2 h-2 bg-white/60 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
              </div>
            </div>

            <!-- Error Message -->
            <div v-if="chatError" class="bg-red-500/20 border border-red-500/30 rounded-lg p-4 text-red-300">
              <div class="flex items-center justify-between">
                <p class="text-sm">{{ chatError }}</p>
                <button @click="clearError" class="text-red-300 hover:text-red-200 ml-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Chat Input (Outside chat block) -->
      <div class="w-full max-w-[95%] sm:max-w-[85%] md:max-w-[75%] lg:max-w-[65%] xl:max-w-[749px] flex items-center justify-center">
        <ChatInput @send-message="handleSendMessage" :is-streaming="isStreaming" />
      </div>

      <!-- User Info with Logout (Fixed Top Right) -->
      <div class="fixed top-2 right-2 sm:top-4 sm:right-4 md:right-6 lg:right-8 xl:right-12 2xl:right-16 z-40 flex items-start gap-2 sm:gap-3">
        <!-- User Email -->
        <div class="text-right hidden sm:block">
          <p class="text-white/60 text-xs">{{ userEmail }}</p>
        </div>
        
        <!-- Logout Button -->
        <button 
          @click="handleLogout"
          class="header-action-button group w-8 h-8 sm:w-10 sm:h-10"
          :disabled="isLoggingOut"
          title="Выйти"
        >
          <svg v-if="isLoggingOut" class="animate-spin w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <svg v-else class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
          </svg>
        </button>
      </div>

      <!-- Reset Chat Button (Fixed Top Left) -->
      <div class="fixed top-2 left-2 sm:top-4 sm:left-4 md:left-6 lg:left-8 xl:left-12 2xl:left-16 z-40">
        <button 
          @click="handleResetChat"
          class="header-action-button group w-8 h-8 sm:w-10 sm:h-10"
          :disabled="isResetting || !hasMessages"
          title="Очистить историю диалога"
        >
          <svg v-if="isResetting" class="animate-spin w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <svg v-else class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      <!-- Menu Container (Fixed Bottom Right) - Desktop Only -->
      <div class="menu-container fixed right-2 sm:right-4 md:right-6 lg:right-8 xl:right-12 2xl:right-16 z-50 flex flex-col items-end gap-3 hidden sm:hidden md:hidden lg:flex" style="bottom: -22.77px;">
        <!-- Menu Actions - currently empty, can be used for future features -->
        <transition name="menu-slide">
          <div v-if="isMenuOpen" class="flex flex-col gap-2 mb-2">
            <!-- Future menu items can be added here -->
          </div>
        </transition>

        <!-- Menu Button -->
        <button 
          class="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 xl:w-[61.194px] xl:h-[61.774px] transition-all duration-300 menu-button"
          :class="{ 'menu-button-active': isMenuOpen }"
          @click="toggleMenu"
        >
          <svg viewBox="0 0 62 62" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21.3828 0.600586C20.9055 -0.344484 19.4979 -0.125605 19.3301 0.919922L16.9658 15.6504C16.8779 16.1969 16.2644 16.4803 15.791 16.1934L1.66113 7.62793C0.774612 7.0909 -0.291924 7.97579 0.0722656 8.94629L8.58594 31.626C8.72331 31.9919 8.56816 32.4032 8.22363 32.5879L1.9082 35.9736C0.957874 36.4838 1.24391 37.9162 2.31738 38.0225L8.90527 38.6729C9.46516 38.7281 9.78463 39.3393 9.50977 39.8301L3.9248 49.7852C3.49048 50.5606 4.1156 51.5025 4.99902 51.4043L20.1953 49.708C20.4392 49.6808 20.6824 49.7705 20.8506 49.9492L31.6357 61.4297C32.177 62.0058 33.1321 61.8341 33.4385 61.1055L39.4043 46.9111C39.535 46.6004 39.8506 46.4083 40.1865 46.4355L47.7109 47.0537C48.6808 47.1333 49.2624 46.0008 48.6328 45.2588L44.3066 40.1592C43.982 39.7759 44.0989 39.1892 44.5459 38.96L60.5986 30.7432C61.5393 30.2616 61.3162 28.8581 60.2725 28.6924L44.9141 26.2539C44.3479 26.1636 44.0686 25.5134 44.3936 25.041L59.4297 3.2002C60.0809 2.25367 59.0169 1.07264 58.0078 1.62207L33.7197 14.8525C33.2728 15.0956 32.7163 14.8525 32.5908 14.3594L32.1191 12.502C31.8933 11.6143 30.7403 11.3821 30.1885 12.1133L29.1484 13.4912C28.8004 13.952 28.0893 13.8886 27.8291 13.373L21.3828 0.600586ZM33.7539 29.8408C34.6154 29.841 35.3385 30.5579 35.0566 31.3721C34.827 32.0352 34.448 32.6447 33.9424 33.1504C33.0646 34.028 31.8741 34.5215 30.6328 34.5215C29.3915 34.5214 28.201 34.0281 27.3232 33.1504C26.8176 32.6447 26.4396 32.0352 26.21 31.3721C25.928 30.5578 26.651 29.8408 27.5127 29.8408H33.7539ZM20.168 29.8408C21.0297 29.8408 21.7527 30.5578 21.4707 31.3721C21.2411 32.0352 20.8631 32.6448 20.3574 33.1504C19.4797 34.0281 18.2892 34.5214 17.0479 34.5215C15.8066 34.5215 14.6161 34.028 13.7383 33.1504C13.2327 32.6448 12.8546 32.0351 12.625 31.3721C12.3431 30.5579 13.0652 29.841 13.9268 29.8408H20.168Z" fill="#F5F5F5"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth.js'
import { useChat } from '../composables/useChat.js'
import ChatMessage from '../components/ChatMessage.vue'
import ChatInput from '../components/ChatInput.vue'

const router = useRouter()
const { userEmail, signOut } = useAuth()
const { 
  messages, 
  isLoading, 
  isSending, 
  isStreaming,
  error: chatError,
  hasMessages,
  loadMessages, 
  sendMessage, 
  clearError,
  resetMessages
} = useChat()

const messagesContainer = ref(null)
const expandedReasoning = ref({})

const toggleReasoning = (reasoningId) => {
  expandedReasoning.value[reasoningId] = !expandedReasoning.value[reasoningId]
}

// Auto-scroll function
const scrollToBottom = (smooth = true) => {
  if (messagesContainer.value) {
    const container = messagesContainer.value
    const scrollOptions = {
      top: container.scrollHeight,
      behavior: smooth ? 'smooth' : 'auto'
    }
    container.scrollTo(scrollOptions)
  }
}

// Auto-scroll when messages change
const shouldAutoScroll = ref(true)

// Watch for new messages and auto-scroll
watch(() => messages.value.length, () => {
  if (shouldAutoScroll.value) {
    // Use nextTick to ensure DOM is updated
    nextTick(() => {
      scrollToBottom(true)
    })
  }
}, { flush: 'post' })


// Handle scroll events to detect if user manually scrolled up
const handleScroll = () => {
  if (messagesContainer.value) {
    const container = messagesContainer.value
    const threshold = 100 // pixels from bottom
    const isNearBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - threshold
    shouldAutoScroll.value = isNearBottom
  }
}

// Debug: Watch messages array for changes (combined with auto-scroll logic)
watch(() => messages.value, (newMessages) => {
  console.log('Messages array changed in ChatPage:', newMessages.length)
  
  // Auto-scroll logic for streaming messages
  if (shouldAutoScroll.value) {
    // Check if there's a streaming message or content changes
    const hasStreamingMessage = newMessages.some(msg => msg.isStreaming)
    if (hasStreamingMessage) {
      nextTick(() => {
        scrollToBottom(true)
      })
    }
  }
  
  // Log all messages with their structure
  newMessages.forEach((msg, idx) => {
    if (msg.reasoning || msg.isStreaming) {
      console.log(`Message ${idx}:`, {
        id: msg.id,
        role: msg.role,
        hasReasoning: !!msg.reasoning,
        hasAssistant: !!msg.assistant,
        isStreaming: msg.isStreaming,
        content: msg.content?.substring(0, 50)
      })
    }
  })
  
  const streamingMsg = newMessages.find(m => m.isStreaming)
  if (streamingMsg) {
    console.log('Streaming message found:', {
      content: streamingMsg.content,
      reasoning: streamingMsg.reasoning?.reasoning?.substring(0, 50),
      isStreaming: streamingMsg.isStreaming
    })
  }
}, { deep: true, flush: 'post' })

onMounted(() => {
  // Add scroll listener to messages container
  if (messagesContainer.value) {
    messagesContainer.value.addEventListener('scroll', handleScroll)
  }
  
  // Add click outside listener for menu
  document.addEventListener('click', handleClickOutside)
  
  // Add escape key listener for menu
  document.addEventListener('keydown', handleEscapeKey)
  
  // Initial scroll to bottom
  nextTick(() => {
    scrollToBottom(false)
  })
  
  // Agent info is already available from user profile (letta_agent_id)
  // No need to make additional API calls
})

onUnmounted(() => {
  // Remove scroll listener from messages container
  if (messagesContainer.value) {
    messagesContainer.value.removeEventListener('scroll', handleScroll)
  }
  
  // Remove click outside listener for menu
  document.removeEventListener('click', handleClickOutside)
  
  // Remove escape key listener for menu
  document.removeEventListener('keydown', handleEscapeKey)
})

const handleSendMessage = async (messageText) => {
  if (!messageText || !messageText.trim()) return

  try {
    await sendMessage(messageText)
    console.log('Message sent successfully')
    
    // Ensure auto-scroll is enabled after sending message
    shouldAutoScroll.value = true
    
    // Scroll to bottom after sending
    nextTick(() => {
      scrollToBottom(true)
    })
  } catch (error) {
    console.error('Failed to send message:', error)
    // Error is already handled in useChat composable
  }
}

const isLoggingOut = ref(false)
const isResetting = ref(false)
const isMenuOpen = ref(false)

const handleLogout = async () => {
  try {
    isLoggingOut.value = true
    await signOut()
    router.push('/auth')
  } catch (error) {
    console.error('Logout error:', error)
  } finally {
    isLoggingOut.value = false
  }
}

const handleResetChat = async () => {
  if (!confirm('Вы уверены, что хотите очистить историю диалога? Это действие нельзя отменить.')) {
    return
  }

  try {
    isResetting.value = true
    await resetMessages({ add_default_initial_messages: false })
  } catch (error) {
    console.error('Reset chat error:', error)
  } finally {
    isResetting.value = false
  }
}

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

// Close menu when clicking outside
const handleClickOutside = (event) => {
  if (isMenuOpen.value) {
    const menuContainer = event.target.closest('.menu-container')
    if (!menuContainer) {
      isMenuOpen.value = false
    }
  }
}

// Close menu on Escape key
const handleEscapeKey = (event) => {
  if (event.key === 'Escape' && isMenuOpen.value) {
    isMenuOpen.value = false
  }
}
</script>

<style scoped>
/* Agent avatar fade in animation for streaming messages */
.agent-avatar-animation {
  animation: fadeIn 0.3s ease-in-out;
}

/* History message smooth appearance */
.history-message-appear {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.98);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Typing indicator fade animation */
.fade-enter-active {
  animation: fadeIn 0.3s ease-in-out;
}

.fade-leave-active {
  animation: fadeOut 0.3s ease-in-out;
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

/* Loading animation */
.agent-loading {
  animation: fadeIn 0.3s ease-in-out;
}

/* Scrollbar hidden utility */
.scrollbar-hidden::-webkit-scrollbar {
  display: none;
}

.scrollbar-hidden {
  -ms-overflow-style: none;
  scrollbar-width: none;
  scroll-behavior: auto;
}

/* Top fade gradient overlay */
.fade-gradient-top {
  background: linear-gradient(to bottom, 
    rgba(0, 0, 0, 0.9) 0%, 
    rgba(0, 0, 0, 0.7) 20%,
    rgba(0, 0, 0, 0.4) 50%,
    rgba(0, 0, 0, 0.1) 80%,
    transparent 100%
  );
  border-radius: 19px 19px 0 0;
}

/* Chat container gradient glow effect - minimalistic */
.chat-container-glow {
  position: relative;
  box-shadow: 
    0 0 40px rgba(184, 243, 191, 0.08),
    0 0 60px rgba(129, 187, 242, 0.06),
    0 0 50px rgba(233, 177, 229, 0.06),
    0 0 55px rgba(126, 144, 217, 0.08),
    0px 0px 36.3px -13px rgba(0, 0, 0, 0.67);
  animation: glow-breathe 6s ease-in-out infinite;
}

@keyframes glow-breathe {
  0%, 100% {
    box-shadow: 
      0 0 30px rgba(184, 243, 191, 0.06),
      0 0 50px rgba(129, 187, 242, 0.05),
      0 0 40px rgba(233, 177, 229, 0.05),
      0 0 45px rgba(126, 144, 217, 0.06),
      0px 0px 36.3px -13px rgba(0, 0, 0, 0.67);
  }
  33% {
    box-shadow: 
      0 0 45px rgba(184, 243, 191, 0.1),
      0 0 35px rgba(129, 187, 242, 0.08),
      0 0 40px rgba(233, 177, 229, 0.07),
      0 0 50px rgba(126, 144, 217, 0.09),
      0px 0px 36.3px -13px rgba(0, 0, 0, 0.67);
  }
  66% {
    box-shadow: 
      0 0 35px rgba(184, 243, 191, 0.07),
      0 0 55px rgba(129, 187, 242, 0.09),
      0 0 50px rgba(233, 177, 229, 0.08),
      0 0 40px rgba(126, 144, 217, 0.07),
      0px 0px 36.3px -13px rgba(0, 0, 0, 0.67);
  }
}

/* Animated background gradients - floating effect */
@keyframes float-1 {
  0%, 100% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  33% {
    transform: translate3d(30px, -20px, 0) scale(1.05);
  }
  66% {
    transform: translate3d(-20px, 30px, 0) scale(0.95);
  }
}

@keyframes float-2 {
  0%, 100% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  33% {
    transform: translate3d(-40px, 25px, 0) scale(1.08);
  }
  66% {
    transform: translate3d(35px, -30px, 0) scale(0.92);
  }
}

@keyframes float-3 {
  0%, 100% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  33% {
    transform: translate3d(25px, 40px, 0) scale(0.95);
  }
  66% {
    transform: translate3d(-30px, -25px, 0) scale(1.05);
  }
}

@keyframes float-4 {
  0%, 100% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  33% {
    transform: translate3d(-35px, -30px, 0) scale(1.06);
  }
  66% {
    transform: translate3d(40px, 20px, 0) scale(0.94);
  }
}

@keyframes pulse-slow {
  0%, 100% {
    opacity: 0.6;
  }
  50% {
    opacity: 0.9;
  }
}

.animate-float-1 {
  animation: float-1 20s ease-in-out infinite;
}

.animate-float-2 {
  animation: float-2 25s ease-in-out infinite;
}

.animate-float-3 {
  animation: float-3 22s ease-in-out infinite;
}

.animate-float-4 {
  animation: float-4 28s ease-in-out infinite;
}

.animate-pulse-slow {
  animation: pulse-slow 8s ease-in-out infinite;
}

/* Header action button - minimalistic style */
.header-action-button {
  @apply flex items-center justify-center rounded-full;
  @apply text-white/40 hover:text-white;
  @apply transition-all duration-200;
  @apply cursor-pointer;
  background: transparent;
  border: none;
  padding: 0;
}

.header-action-button:hover:not(:disabled) {
  @apply text-white/80;
  transform: scale(1.1);
}

.header-action-button:active:not(:disabled) {
  transform: scale(0.95);
}

.header-action-button:disabled {
  @apply text-white/20 cursor-not-allowed;
  transform: none;
}

/* Menu action buttons - minimalistic style */
.menu-action-button {
  @apply w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-full;
  @apply text-white/50 hover:text-white;
  @apply transition-all duration-200;
  @apply cursor-pointer;
  background: transparent;
  border: none;
  padding: 0;
}

.menu-action-button:hover:not(:disabled) {
  @apply text-white;
  transform: scale(1.1);
}

.menu-action-button:active:not(:disabled) {
  transform: scale(0.95);
}

.menu-action-button:disabled {
  @apply text-white/20 cursor-not-allowed;
}

/* Menu button - partially hidden at bottom, slides up on hover */
.menu-button {
  cursor: pointer;
}

.menu-button:hover {
  transform: translateY(-22.77px);
}

.menu-button-active {
  transform: translateY(-22.77px);
}

/* Menu slide transition - buttons appear from bottom to top */
.menu-slide-enter-active,
.menu-slide-leave-active {
  transition: all 0.3s ease-out;
}

.menu-slide-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.menu-slide-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.menu-slide-enter-to,
.menu-slide-leave-from {
  opacity: 1;
  transform: translateY(0);
}

/* Mobile-specific improvements */
@media (max-width: 640px) {
  .chat-container-glow {
    margin-top: 0;
  }
  
  /* Ensure proper spacing on mobile */
  .main-content-container {
    padding-top: 80px;
  }
  
  /* Improve touch targets */
  .header-action-button {
    min-width: 32px;
    min-height: 32px;
  }
  
  /* Better text sizing for mobile */
  .mobile-text {
    font-size: 14px;
    line-height: 1.4;
  }
  
  /* Disable complex animations on mobile to prevent flickering */
  .animate-float-1,
  .animate-float-2,
  .animate-float-3,
  .animate-float-4 {
    animation: none;
  }
  
  .animate-pulse-slow {
    animation: none;
  }
  
  /* Reduce backdrop blur on mobile for better performance */
  .backdrop-blur-77 {
    backdrop-filter: blur(20px);
  }
  
  /* Optimize glow effect for mobile */
  .chat-container-glow {
    animation: none;
    box-shadow: 0px 0px 20px -5px rgba(0, 0, 0, 0.67);
  }
  
  /* Disable hover effects on mobile */
  .header-action-button:hover {
    transform: none;
  }
  
  .menu-action-button:hover {
    transform: none;
  }
}
</style>
