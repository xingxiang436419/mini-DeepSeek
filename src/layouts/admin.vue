<template>
  <el-container class="h-screen">
    <el-aside class="w-[400px] bg-gray-100 flex flex-col relative">
      <!-- 头部log区域 -->
      <div class="flex justify-between mt-3 items-center">
        <img src="@/assets/deepseek.svg" class="w-[215px] h-[28px]">
        <el-icon :size="24"
        class="mr-4"><Fold /></el-icon>
      </div>
      <!-- 新建对话区域 -->
      <div class="flex mt-5 items-center justify-center mx-3
       bg-light-100 h-[40px] rounded-[20px] cursor-pointer
       hover:shadow-xl transition-all duration-300">
        <el-icon><CirclePlus /></el-icon>
        <span @click="$router.push('/')">开启新对话</span>
      </div>
      <!-- 历史记录区域 -->
       <div class="mt-5 flex-1 overflow-y-auto">
          <AdminAside></AdminAside>
       </div>
       <!-- 底部区域 -->
      <div class="flex justify-between items-center obsolute
      bottom-0 left-0 right-0 mx-2 px-5 py-3 bg-white  hover:bg-gray-100 rounded-xl">
        <div class="flex items-center">
          <img src="@/assets/user.svg" class="w-[32px] h-[32px] rounded-[16px]">
          <span>用户id</span>
        </div>
        <el-icon><ToiletPaper /></el-icon>
      </div>
    </el-aside>
    <el-main>
      <div class="h-full w-[774px] m-auto flex flex-col items-center justify-center">
        <router-view></router-view>
      </div>
    </el-main>
  </el-container>
</template>
<script setup>
import AdminAside from './components/AdminAside.vue';
</script>
<style>

</style>
