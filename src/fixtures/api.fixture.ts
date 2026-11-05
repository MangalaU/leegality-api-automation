
import {test as base, expect } from '@playwright/test';

import { BookingClient } from '../clients/booking.client';
import { AuthClient } from '../clients/auth.client';


type ApiFixtures = {
    bookingClient: BookingClient ;
    authClient: AuthClient ;
    authToken: string;
    
};

export const test = base.extend<ApiFixtures>({

    //Reusable booking API client
    bookingClient: async ({request }, use) =>{
        const client = new BookingClient(request);

        await use(client);
    },

    // Reusable authentication API client
    authClient: async ({request} ,use)=>{
        const client = new AuthClient(request);

        await use(client);
    },

    //Generate authentication token when  required 
    authToken: async ({ authClient }, use) => {

        const username = process.env.API_USERNAME;
        const password = process.env.API_PASSWORD;
  
        if(!username || !password){
            throw new Error(
                'API_USERNAME or API_PASSWORD is missing from environment variables'
            );

        } 

        const response = await authClient.createToken({
            username,
            password,
        });

        if(!response.ok()){
            throw new Error(
                `Authetication failed with status: ${response.status()}`
            );
        }

        const responseBody  = await response.json();

        if(
            typeof responseBody.token !== 'string' ||
            responseBody.token.length ===0
        ) {
            throw  new Error(
                `Authenticaton token missing: ${JSON.stringify(responseBody)}`
            );
            
        }

        await use(responseBody.token);
    },
});
 export { expect };