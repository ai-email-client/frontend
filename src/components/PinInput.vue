<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'

const props = defineProps({
  length: { type: Number, default: 6 },
  error: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false }
})

const emit = defineEmits(['complete', 'update:modelValue'])

const digits = ref<string[]>(new Array(props.length).fill(''))
const inputs = ref<HTMLInputElement[]>([])

const handleInput = (index: number, event: Event) => {
  const target = event.target as HTMLInputElement
  const val = target.value

  if (!/^\d*$/.test(val)) {
    digits.value[index] = ''
    return
  }

  digits.value[index] = val.slice(-1)

  if (val && index < props.length - 1) {
    inputs.value[index + 1]?.focus()
  }

  checkComplete()
}

const handleKeyDown = (index: number, event: KeyboardEvent) => {
  if (event.key === 'Backspace') {
    if (!digits.value[index] && index > 0) {
      digits.value[index - 1] = ''
      inputs.value[index - 1]?.focus()
    }
    checkComplete()
  }
}

const handlePaste = (event: ClipboardEvent) => {
  event.preventDefault()
  const pastedData = event.clipboardData?.getData('text')
  if (!pastedData) return

  const numbers = pastedData.match(/\d/g)
  if (numbers) {
    numbers.slice(0, props.length).forEach((num, i) => {
      digits.value[i] = num
    })
    const nextIndex = Math.min(numbers.length, props.length - 1)
    inputs.value[nextIndex]?.focus()
    checkComplete()
  }
}

const checkComplete = () => {
  const pin = digits.value.join('')
  emit('update:modelValue', pin)
  if (pin.length === props.length) {
    emit('complete', pin)
  }
}

const reset = () => {
  digits.value = new Array(props.length).fill('')
  inputs.value[0]?.focus()
}

onMounted(() => {
  nextTick(() => {
    if (!props.disabled) inputs.value[0]?.focus()
  })
})

defineExpose({ reset })
</script>

<template>
  <div class="flex gap-3 justify-center">
    <input
      v-for="(digit, index) in digits"
      :key="index"
      :ref="(el) => (inputs[index] = el as HTMLInputElement)"
      :type="'password'"
      inputmode="numeric"
      v-model="digits[index]"
      :disabled="disabled"
      @input="(e) => handleInput(index, e)"
      @keydown="(e) => handleKeyDown(index, e)"
      @paste="handlePaste"
      class="w-12 h-14 text-center text-2xl font-bold border-2 rounded-lg outline-none transition-all duration-200"
      :class="[
        error 
          ? 'border-red-500 bg-red-50 text-red-500 animate-shake' 
          : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white text-gray-800',
        disabled ? 'bg-gray-100 cursor-not-allowed' : ''
      ]"
      maxlength="1"
    />
  </div>
</template>

<style scoped>
.animate-shake {
  animation: shake 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

@keyframes shake {
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(2px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
  40%, 60% { transform: translate3d(4px, 0, 0); }
}
</style>