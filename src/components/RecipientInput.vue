<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { X, Pencil } from 'lucide-vue-next'

const props = defineProps<{
  modelValue: string[]
  placeholder?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

const inputRef = ref<HTMLInputElement | null>(null)
const editInputRef = ref<HTMLInputElement | null>(null)
const inputText = ref('')
const editingIndex = ref<number | null>(null)
const editingText = ref('')

const tags = computed<string[]>(() => props.modelValue ?? [])

const emitTags = (list: string[]) => {
  emit('update:modelValue', list)
}

const addTag = () => {
  const val = inputText.value.trim()
  if (!val) return
  const newTags = val.split(/[,;\s]+/).map(s => s.trim()).filter(Boolean)
  emitTags([...tags.value, ...newTags])
  inputText.value = ''
}

const removeTag = (index: number) => {
  const updated = [...tags.value]
  updated.splice(index, 1)
  emitTags(updated)
}

const startEdit = (index: number) => {
  editingIndex.value = index
  editingText.value = tags.value[index]
  nextTick(() => {
    editInputRef.value?.focus()
    editInputRef.value?.select()
  })
}

const confirmEdit = () => {
  if (editingIndex.value === null) return
  const val = editingText.value.trim()
  const updated = [...tags.value]
  if (val) {
    updated[editingIndex.value] = val
  } else {
    updated.splice(editingIndex.value, 1)
  }
  emitTags(updated)
  editingIndex.value = null
  editingText.value = ''
}

const cancelEdit = () => {
  editingIndex.value = null
  editingText.value = ''
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === ',' || e.key === ';' || e.key === 'Tab') {
    e.preventDefault()
    addTag()
  } else if (e.key === 'Backspace' && inputText.value === '' && tags.value.length > 0) {
    removeTag(tags.value.length - 1)
  }
}

const handleEditKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === 'Tab') {
    e.preventDefault()
    confirmEdit()
  } else if (e.key === 'Escape') {
    cancelEdit()
  }
}

const handleBlur = () => {
  addTag()
}

const handlePaste = (e: ClipboardEvent) => {
  e.preventDefault()
  const text = e.clipboardData?.getData('text') || ''
  const pasted = text.split(/[,;\s\n]+/).map(s => s.trim()).filter(Boolean)
  if (pasted.length > 0) {
    emitTags([...tags.value, ...pasted])
    inputText.value = ''
  }
}

const focusInput = () => {
  if (editingIndex.value !== null) return
  nextTick(() => inputRef.value?.focus())
}
</script>

<template>
  <div
    class="flex flex-wrap items-center gap-1 min-h-[32px] cursor-text"
    @click="focusInput"
  >
    <template v-for="(tag, i) in tags" :key="i">
      <span
        v-if="editingIndex === i"
        class="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-100 border border-blue-400 text-[11px]"
      >
        <input
          ref="editInputRef"
          v-model="editingText"
          class="outline-none bg-transparent text-blue-800 font-medium min-w-[80px] max-w-[200px]"
          @keydown="handleEditKeydown"
          @blur="confirmEdit"
          @click.stop
        />
      </span>

      <span
        v-else
        class="group inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-medium border border-blue-100 shrink-0 cursor-pointer hover:bg-blue-100 transition-colors"
        @click.stop="startEdit(i)"
        title="Click to edit"
      >
        <Pencil :size="9" class="opacity-0 group-hover:opacity-50 transition-opacity" />
        {{ tag }}
        <button
          type="button"
          @click.stop="removeTag(i)"
          class="hover:text-red-500 transition-colors ml-0.5"
        >
          <X :size="10" />
        </button>
      </span>
    </template>

    <input
      ref="inputRef"
      v-model="inputText"
      :placeholder="tags.length === 0 ? placeholder : ''"
      class="flex-1 min-w-[120px] outline-none text-base bg-transparent placeholder-gray-300"
      @keydown="handleKeydown"
      @blur="handleBlur"
      @paste="handlePaste"
    />
  </div>
</template>