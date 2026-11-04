import {test , expect} from '@playwright/test'

test.describe('Health Check API', () => {
    test('GET /ping should return successful response', async ({ request }) =>{

        const response = await request.get('/ping');

        // Validate HTTP status
        expect(response.status()).toBe(201);

        //Validate successful HTTP response
        expect(response.ok()).toBeTruthy();

    });

});