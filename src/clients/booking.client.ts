import { APIRequestContext } from "@playwright/test";
import { API_CONFIG } from "../config/api.config";

export class BookingClient {
    constructor (
        private request: APIRequestContext
    ) {}

    async getHealth(){
        return await this.request.get(API_CONFIG.ENDPOINTS.HEALTH);
    }

    async getBooking(id: number){
        return await this.request.get(
            `${API_CONFIG.ENDPOINTS.BOOKING}/${id}`
        );
 
    }
    async createBooking(data: object){
        return await this.request.post(API_CONFIG.ENDPOINTS.BOOKING,{data});
    }

    async updateBooking(
        id: number,
        data: object,
        token: string
    ) {
        return await this.request.put(
            `${API_CONFIG.ENDPOINTS.BOOKING}/${id}`,
            {
                data,
                headers: {
                    Cookie: `token=${token}`,
                },
            }
        );
    }

    async partialUpdateBooking(
        id: number,
        data: object,
        token: string,
    ){
        return await this.request.patch(
            `${API_CONFIG.ENDPOINTS.BOOKING}/${id}`,
            {
                data,
                headers: {
                    Cookie: `token=${token}`,
                },
            }
        );
    }   
      async deleteBooking(
        id: number,
        token: string
      ) {
        return await this.request.delete(
            `${API_CONFIG.ENDPOINTS.BOOKING}/${id}`,
            {
                headers:{
                    Cookie: `token=${token}`,
                },
            }
        );
      }
}    