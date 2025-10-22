<template>
  <router-view></router-view>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');

#app {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

* {
  padding: 0;
  margin: 0;
}
a {
  text-decoration: none;
}
.heading {
  font-size: 24px;
  font-weight: 500;
}
.price::after {
  content: " $";
}
.button {
  border: none;
  border-radius: 12px;
  font-size: 16px;
  background-color: #FFD500;
  padding: 16px 64px;
  box-sizing: border-box;
}
</style>
