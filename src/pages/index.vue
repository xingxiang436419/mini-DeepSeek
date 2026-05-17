<template>
  <div class="h-full w-full flex flex-col items-center justify-center overflow-auto">
    <!-- 头部log和标题 -->
    <div class="flex justify-center items-center text-2xl">
      <img src="@/assets/deepseek-logo.svg" class="w-[32px] h-[25px]">
      <span class="font-bold ml-3">使用{{mode}}模式开始对话</span>
    </div>
    <!-- 选择模式区域 -->
    <el-tabs v-model="mode" class="demo-tabs text-xl font-bold mb-5">
      <el-tab-pane label="快速" name="快速">
        <template #label>
          <el-tooltip
            content="适合日常对话，及时响应"
            placement="bottom"
            effect="dark"
          >
            <span>快速</span>
          </el-tooltip>
        </template>
      </el-tab-pane>
      <el-tab-pane label="专家" name="专家">
        <template #label>
          <el-tooltip
            content="适合复杂问题，高峰需等待"
            placement="bottom"
            effect="dark"
          >
            <span>专家</span>
          </el-tooltip>
        </template>
      </el-tab-pane>
    </el-tabs>
    <input-search></input-search>
  </div>

</template>

<script setup>
import InputSearch from '@/components/inputSearch.vue'
import {ref} from 'vue'
let mode=ref('快速')
</script>

<style>

</style>
