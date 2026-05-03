<template>
  <el-container class="h-screen">
    <Transition name="aside-slide">
      <el-aside v-if="isExpand" class="w-[400px] bg-gray-100 flex flex-col relative">
        <!-- 头部log区域 -->
        <div class="flex justify-between mt-3 items-center">
          <img src="@/assets/deepseek.svg" class="w-[215px] h-[28px]">
          <el-icon :size="24" class="mr-4" @click="isExpand=!isExpand"><Fold /></el-icon>
        </div>
        <!-- 新建对话区域 -->
        <div class="flex mt-5 items-center justify-center mx-3 bg-light-100 h-[40px] rounded-[20px] cursor-pointer hover:shadow-xl transition-all duration-300">
          <el-icon><CirclePlus /></el-icon>
          <span @click="$router.push('/')">开启新对话</span>
        </div>
        <!-- 历史记录区域 -->
        <div class="mt-5 flex-1 overflow-y-auto">
            <AdminAside></AdminAside>
        </div>
        <!-- 底部区域 -->
        <div class="flex justify-between items-center bottom-0 left-0 right-0 mx-2 px-5 py-3 bg-white hover:bg-gray-100 rounded-xl">
          <div class="flex items-center">
            <img src="@/assets/user.svg" class="w-[32px] h-[32px] rounded-[16px]">
            <span>用户id</span>
          </div>
          <el-icon><ToiletPaper /></el-icon>
        </div>
      </el-aside>
    </Transition>

    <Transition name="logo-fade">
      <template v-if="!isExpand">
        <el-header class="bg-white flex items-start">
          <div class="flex justify-between items-center h-[40px] mt-[5px]">
            <i class="iconfont icon-deepseek" style="font-size: 36px; line-height: 40px;"></i>
            <div class="flex bg-light-600 rounded-full ml-[10px]">
              <button
                class="w-[36px] h-[36px] hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors"
                @click="$router.push('/')"
              >
                <el-icon :size="18"><CirclePlus /></el-icon>
              </button>
              <button
                class="w-[36px] h-[36px] hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors"
                @click="isExpand=!isExpand"
              >
                <el-icon :size="18"><Expand /></el-icon>
              </button>
            </div>
          </div>
        </el-header>
      </template>
    </Transition>

    <el-main>
      <div class="h-full w-[774px] m-auto flex flex-col items-center justify-center">
        <router-view></router-view>
      </div>
    </el-main>
  </el-container>
</template>
<script setup>
import { toRef } from 'vue';
import AdminAside from './components/AdminAside.vue';
import { useAsideStore } from '@/stores/asideWidth';
const asideStore = useAsideStore();
const isExpand = toRef(asideStore, 'asideWidth');
</script>
<style>
.aside-slide-enter-active,
.aside-slide-leave-active {
  transition: all 0.3s ease;
}

.aside-slide-enter-from,
.aside-slide-leave-to {
  width: 0;
  opacity: 0;
}

.aside-slide-enter-to,
.aside-slide-leave-from {
  width: 400px;
  opacity: 1;
}

.logo-fade-enter-active,
.logo-fade-leave-active {
  transition: all 0.3s ease;
}

.logo-fade-enter-from,
.logo-fade-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.logo-fade-enter-to,
.logo-fade-leave-from {
  opacity: 1;
  transform: translateX(0);
}
</style>
