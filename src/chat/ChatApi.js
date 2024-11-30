import ApiClient from "../core/networks/ApiClient"

export const initiateCall = async ({}) =>{
    const api = new ApiClient();

    
}

export const updateCallStatus = async (data) =>{
    const api = new ApiClient();
    await api.post(`/api/call/update-call`, data);
    // console.log(response);
}