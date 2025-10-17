<template>
  <div class="container">
    <header class="header">
      <button
          class="logout-button"
          :style="{ backgroundImage: `url(${ buttonBgUrl })` }"
          @mouseenter="buttonBgUrl = hoverBgUrl"
          @mouseleave="buttonBgUrl = normalBgUrl"
          @click="logout"
      ></button>
    </header>

    <div class="main">
      <section>
        <p class="heading">Стоимость портфеля</p>
        <p class="text price total-balance">{{ brokerBalance }}</p>
      </section>

      <section></section>

      <section class="table">
        <div class="headings table-row">
          <p class="table__heading">Название</p>
          <p class="table__heading">Цена</p>
          <p class="table__heading">Изм, 1д</p>
        </div>

        <StocksList></StocksList>
      </section>
    </div>
  </div>
</template>

<script>
import StocksList from "@/components/StocksList.vue";

export default {
  name: 'BrokerPage',
  components: {StocksList},
  data() {
    return {
      normalBgUrl: '/logout.png',
      buttonBgUrl: '/logout.png',
      hoverBgUrl: '/hover-logout.png'
    }
  },
  mounted() {
    window.addEventListener('beforeunload', this.handleBeforeUnload);
  },
  beforeUnmount() {
    window.removeEventListener('beforeunload', this.handleBeforeUnload);
  },
  computed: {
    broker() {
      return this.$store.getters.currentBroker;
    },
    brokerName() {
      return this.broker ? this.broker.name : '';
    },
    brokerBalance() {
      if (!this.broker) {
        return '';
      }

      const balance = Number(this.broker.balance);
      if (isNaN(balance)) {
        return '';
      }

      return new Intl.NumberFormat('ru-RU', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }).format(balance);
    }
  },
  methods: {
    logout() {
      this.$store.dispatch('logout');
      this.$router.push('/login');
    },
    handleBeforeUnload(event) {
      // type 1 = reload
      if (event.currentTarget.performance.navigation.type === 1) {
        return;
      }

      this.logout();
    }
  }
}
</script>

<style>
.header {
  padding: 16px;
  box-sizing: border-box;
  position: fixed;
  width: 100%;
  display: flex;
  flex-direction: row-reverse;
}
.main {
  padding: 64px 10%;
  box-sizing: border-box;
  background-color: #fff;
  display: grid;
  grid-template-columns: 2fr 4fr 3fr;
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
.total-balance {
  font-size: 24px;
  font-weight: 600;
}
.logout-button {
  width: 32px;
  height: 32px;
  background-size: cover;
  border: none;
  background-color: #fff;
  transition: transform 0.3s ease;
}
.logout-button:hover {
  transform: scale(1.1);
}
</style>
