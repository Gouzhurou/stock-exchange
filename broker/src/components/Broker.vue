<template>
  <div class="main">
    <section class="table">
      <div class="headings table-row">
        <p class="table__heading">Название</p>
        <p class="table__heading">Цена</p>
        <p class="table__heading">Изм, 1д</p>
      </div>

      <StocksList></StocksList>
    </section>
  </div>
</template>

<script>
import StocksList from "@/components/StocksList.vue";

export default {
  name: 'BrokerPage',
  components: {StocksList}
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
.main {
  padding: 32px 64px;
  background-color: #fff;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
}
.table {
  background-color: #f6f6f6;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;

}
.headings {
  padding: 16px;
  padding-top: 32px;
}
.table-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
}
.table__heading {
  font-size: 16px;
  font-weight: 600;
}
.text {
  font-size: 16px;
  font-weight: 500;
}
.row-gap16 {
  display: flex;
  flex-direction: row;
  gap: 16px;
}
</style>
