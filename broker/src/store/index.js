import { createStore } from 'vuex';

export default createStore({
    state() {
        return {
            currentBroker: null
        };
    },
    mutations: {
        setBroker(state, broker) {
            state.currentBroker = broker;
        },
        clearBroker(state) {
            state.currentBroker = null;
        }
    },
    actions: {
        login({ commit }, broker) {
            commit('setBroker', broker);
            localStorage.setItem('currentBroker', JSON.stringify(broker));
        },
        logout({ commit }) {
            commit('clearBroker');
            localStorage.removeItem('currentBroker');
        },
        initializeStore({ commit }) {
            const broker = localStorage.getItem('currentBroker');
            if (broker) {
                commit('setBroker', JSON.parse(broker));
            }
        }
    },
    getters: {
        currentBroker: state => state.currentBroker
    }
});