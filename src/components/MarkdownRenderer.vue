<script setup>
import { computed } from 'vue'
import MarkdownIt from 'markdown-it'

const md = new MarkdownIt()
const props = defineProps({
  initAnswer: {
    type: String,
    default: ''
  }
})

const formattedHtml = computed(() => {
  const rawReply = props.initAnswer || '你好！我是 **DeepSeek**...'
  return md.render(rawReply)
})
</script>

<template>
  <div class="markdown-body" v-html="formattedHtml"></div>
</template>

<style scoped>
.markdown-body {
  line-height: 1.6;
  font-size: 15px;
  color: #333;
}

.markdown-body :deep(ul) {
  padding-left: 1.5em;
  margin: 10px 0;
  list-style-type: disc;
}

.markdown-body :deep(li) {
  margin-bottom: 5px;
}

.markdown-body :deep(strong) {
  font-weight: 600;
  color: #000;
}

.markdown-body :deep(p) {
  margin-bottom: 12px;
}
</style>
