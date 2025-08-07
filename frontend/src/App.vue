<template>
  <div id="app">
    <NavBar />
    <main class="min-h-screen">
      <RouterView />
    </main>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import NavBar from './components/NavBar.vue'
import Footer from './components/Footer.vue'
import { RouterView } from 'vue-router'
</script>
