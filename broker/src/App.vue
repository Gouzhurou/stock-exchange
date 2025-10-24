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
.input {
  width: 100%;
  background-color: #F6F6F6;
  border: none;
  outline: none;
  padding: 16px;
  box-sizing: border-box;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 500;
}
.input:hover {
  box-shadow: 0 0 0 2px #616161;
}
.input:focus {
  box-shadow: 0 0 0 2px #FFD500;
}
.button {
  border: none;
  border-radius: 12px;
  font-size: 16px;
  background-color: #FFD500;
  padding: 16px 64px;
  box-sizing: border-box;
}
.button:hover {
  background-color: #F0C700;
}
.button:active {
  background-color: #FFD500;
}
.full-width-button {
  width: 100%;
}
.error-message {
  font-size: 16px;
  font-weight: 400;
  color: #AC0000;
}
</style>
