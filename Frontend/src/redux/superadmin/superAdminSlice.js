import { createSlice } from "@reduxjs/toolkit";

const initialState={
    isLoading:true,
    authenticated:false,
}

export const superAdminSlice = createSlice({
    name:"superadmin",
    initialState,
    reducers:{
        setSuperAdmin:(state,action)=>{
            state.authenticated=action.payload.authenticated ?? state.authenticated;
            state.isLoading=action.payload.isLoading ?? state.isLoading;
        },
        resetSuperAdminState:(state)=>{
            state.authenticated=false;
        }
    }

})

export const { setSuperAdmin, resetSuperAdminState } = superAdminSlice.actions;