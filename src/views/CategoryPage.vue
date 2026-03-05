<script setup lang="ts">
import {
  ref,
  computed,
  watch
} from 'vue'
import {
  useRoute,
  useRouter
} from 'vue-router'

import EmailList from '../components/EmailList.vue'
import EmailDetail from '../components/EmailDetail.vue'
import Divider from '../components/Divider.vue'

import { useLabelStore } from '../stores/categoryStore'
import emailService from '../services/email'
import { Message } from '../interface/email'
import { useUiStore } from '../stores/uiStore'

const router = useRouter()
const route = useRoute()
const labelStore = useLabelStore()
const uiStore = useUiStore()

const props = defineProps<{
  darkMode: boolean
  listWidth: number
}>()

const emit = defineEmits(['update:listWidth'])

// ── State ──
const containerRef = ref<HTMLElement | null>(null)
const emailList = ref<Message[]>([])
const selectedEmail = ref<Message | null>(null)

// ── Layout Control ──
const MIN_PX  = 80
const MAX_PX  = 800
const SNAP_PX = 140

const currentWidth = computed({
  get: () => props.listWidth,
  set: (val) => emit('update:listWidth', val)
})

const collapsed   = computed(() => currentWidth.value <= MIN_PX + 4)
const showViewer  = computed(() => selectedEmail.value !== null)
const currentLabel = computed((): string[] => {
  const currentCategoryName = route.params.category;

  const labelId = labelStore.getLabelIdByName(currentCategoryName as string);
  
  return labelId ? [labelId] : [];
})

// Params
const labels            = currentLabel
const limit             = 20
const query             = ''
const includeSpamTrash  = false

const nextPageToken   = ref<string | null>(null)
const stackToken      = ref<string[]>([""])
const currentPage     = ref(0)
const totalMessage    = ref(1)

const resetPagination = () => {
  emailList.value = []
  currentPage.value   = 0
  totalMessage.value  = 1
  stackToken.value    = [""]
  nextPageToken.value = null

}


const fetchEmails = async (
  labelIds: string[],
  maxResults: number,
  pageToken: string,
  query: string,
  includeSpamTrash: boolean
) => {
  try {
    uiStore.setLoading(true)
    selectedEmail.value = null
    getTotalMessage()
    const response = await emailService.fetchEmails(
      labelIds, maxResults, pageToken, query, includeSpamTrash
    )
    nextPageToken.value = response.nextPageToken
    if (!stackToken.value.includes(response.nextPageToken)) {
      stackToken.value.push(response.nextPageToken)
    }
    emailList.value = response.messages    

  } catch (error) {
    console.error('Failed to fetch emails', error)
  } finally {
    uiStore.setLoading(false)
  }
}

const nextPage = async () => {
  if (!nextPageToken.value && currentPage.value >= stackToken.value.length - 1) return
  currentPage.value++
  emailList.value = []
  await fetchEmails(
    labels.value,
    limit,
    stackToken.value[currentPage.value],
    query,
    includeSpamTrash
  )
}

const prevPage = async () => {
  if (currentPage.value === 0) return
  currentPage.value--
  emailList.value = []
  await fetchEmails(
    labels.value,
    limit,
    stackToken.value[currentPage.value],
    query,
    includeSpamTrash
  )
}

const getTotalMessage = async () => {
  const response = await emailService.getLabelById(currentLabel.value[0])
  if (response.messagesTotal) totalMessage.value = response.messagesTotal
}

const handleDrag = (clientX: number) => {
  if (!containerRef.value) return
  const { left, width } = containerRef.value.getBoundingClientRect()
  const raw = clientX - left
  const newWidth = raw < SNAP_PX ? MIN_PX : Math.min(Math.max(raw, MIN_PX), Math.min(MAX_PX, width * 0.75))
  currentWidth.value = newWidth
}

const handleSelectEmail = async (email: Message) => {
  try {
    uiStore.setLoading(true)
    selectedEmail.value = email
  } catch (error) {
    console.error('Failed to fetch email', error)
  } finally {
    uiStore.setLoading(false)
  }
}

const handleCollapse = () => { currentWidth.value = MIN_PX }
const handleExpand   = () => { currentWidth.value = 350 }

watch(() => route.params.category, async () => {
    await router.isReady()
    resetPagination()
    fetchEmails(
      labels.value,
      limit,
      stackToken.value[currentPage.value],
      query,
      includeSpamTrash
    )
}, { immediate: true })

</script>

<template>
  <div
    ref="containerRef"
    class="flex-1 flex overflow-hidden"
  >
    <div
      :style="{ width: `${currentWidth}px`, minWidth: `${MIN_PX}px`, flexShrink: 0 }"
      class="flex-col overflow-hidden transition-none"
      :class="showViewer ? 'hidden md:flex' : 'flex'"
    >
      <EmailList
        :emails="emailList"
        :selectedEmail="selectedEmail"
        :loading="uiStore.isLoading"
        :current-page="currentPage + 1"
        :total-message="totalMessage"
        :limit="limit"
        :dark-mode="darkMode"
        :collapsed="collapsed"
        @select="handleSelectEmail"
        @refresh="() => fetchEmails(
          labels,
          limit,
          stackToken[currentPage],
          query,
          includeSpamTrash
        )"
        @prevPage="prevPage"
        @nextPage="nextPage"
      />
    </div>

    <div class="hidden md:block">
      <Divider
        :dark-mode="darkMode"
        @drag="handleDrag"
        @collapse="handleCollapse"
        @expand="handleExpand"
      />
    </div>

    <div
      class="flex-col flex-1 min-w-0"
      :class="showViewer ? 'flex' : 'hidden md:flex'"
    >
      <EmailDetail
        :email="selectedEmail"
        :loading="uiStore.isLoading"
        :dark-mode="darkMode"
        @back="selectedEmail = null"
      />
    </div>
  </div>
</template>