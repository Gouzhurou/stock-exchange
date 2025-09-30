import { createRouter, createWebHistory } from 'vue-router';
import LogIn from '@/components/LogIn.vue';
import Broker from '@/components/Broker.vue';

const routes = [
    {
        path: '/',
        redirect: '/login'
    },
    {
        path: '/login',
        name: 'LogIn',
        component: LogIn
    },
    {
        path: '/broker',
        name: 'Broker',
        component: Broker,
        meta: { requiresAuth: true }
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

router.beforeEach((to, from, next) => {
    if (to.meta.requiresAuth) {
        const broker = localStorage.getItem('currentBroker');
        if (!broker) {
            next('/login');
        } else {
            next();
        }
    } else {
        next();
    }
});

export default router;