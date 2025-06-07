import { createSlice } from "@reduxjs/toolkit";





const initialState={
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
        },
        resetAdminState:(state)=>{
            state.authenticated=false;
            state.sessionId=null;
        }
    }

})

export const { setAdmin, resetAdminState } = adminSlice.actions;