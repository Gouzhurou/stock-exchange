import { createStore } from 'vuex';

export default createStore({
    state() {
        return {
            currentBroker: null,
            activeStockId: null
        };
    },
    mutations: {
        setBroker(state, broker) {
            state.currentBroker = broker;
        },
        updateBroker(state, updatedBroker) {
            state.currentBroker = { ...state.currentBroker, ...updatedBroker };
        },
        clearBroker(state) {
            state.currentBroker = null;
        },
        setActiveStockId(state, stockId) {
            state.activeStockId = stockId;
        },
        clearActiveStockId(state) {
            state.activeStockId = null;
        }
    },
    actions: {
        initializeStore({ commit }) {
            const broker = localStorage.getItem('currentBroker');
            if (broker) {
                commit('setBroker', JSON.parse(broker));
            }
            const stockId = localStorage.getItem('activeStockId');
            if (stockId) {
                commit('setActiveStockId', stockId);
            }
        },
        login({ commit }, broker) {
            commit('setBroker', broker);
            localStorage.setItem('currentBroker', JSON.stringify(broker));
        },
        logout({ commit }) {
            commit('clearBroker');
            commit('clearActiveStockId');
            localStorage.removeItem('currentBroker');
        },
        updateBroker({ commit, state }, updatedBroker) {
            commit('updateBroker', updatedBroker);
            localStorage.setItem('currentBroker', JSON.stringify(state.currentBroker));
        },
        setActiveStockId({ commit }, stockId) {
            commit('setActiveStockId', stockId);
            localStorage.setItem('activeStockId', stockId);
        },
        clearActiveStockId({ commit }) {
            commit('clearActiveStockId');
            localStorage.removeItem('activeStockId');
        }
    },
    getters: {
        currentBroker: state => state.currentBroker,
        activeStockId: state => state.activeStockId
    }
});