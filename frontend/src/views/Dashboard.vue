<template>
  <div class="dashboard-view">
    <ContributionDashboard />
  </div>
</template>

<script setup lang="ts">
import ContributionDashboard from '../components/ContributionDashboard.vue'
</script>

<style scoped>
.dashboard-view {
  min-height: calc(100vh - 4rem);
  background: linear-gradient(to bottom, #f8fafc, #e2e8f0);
  padding: 2rem 0;
}

.dark .dashboard-view {
  background: linear-gradient(to bottom, #1a202c, #2d3748);
}
</style>
