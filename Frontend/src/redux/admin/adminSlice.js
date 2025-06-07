import { createSlice } from "@reduxjs/toolkit";


const initialState={
    isLoading:true,
    authenticated:false,
    sessionId:null
}

export const adminSlice = createSlice({
    name:"admin",
    initialState,
    reducers:{
        setAdmin:(state,action)=>{
            state.authenticated=action.payload.authenticated ?? state.authenticated;
            state.sessionId=action.payload.sessionId ?? state.sessionId;
            state.isLoading=action.payload.isLoading??state.isLoading;
        },
        resetAdminState:(state)=>{
            state.authenticated=false;
            state.sessionId=null;
        }
    }

})

export const { setAdmin, resetAdminState } = adminSlice.actions;