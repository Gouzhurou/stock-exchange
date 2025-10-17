<template>
  <router-view></router-view>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
* {
  padding: 0;
  margin: 0;
}
a {
  text-decoration: none;
}
.heading {
  font-size: 24px;
  font-weight: 600;
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
