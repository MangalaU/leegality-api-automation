import { TIMEOUT } from "node:dns";

export const API_CONFIG = {
    BASE_URL:
    process.env.BASE_URL ||
    'https://restful-booker.herouapp.com',

    ENDPOINTS:{
        HEALTH: '/ping',
        AUTH: '/auth',
        BOOKING: '/booking'
        },

        TIMEOUT: 30000,
}