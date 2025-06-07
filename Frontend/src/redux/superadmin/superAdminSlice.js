import { createSlice } from "@reduxjs/toolkit";

const initialState={
    authenticated:false,
}

export const superAdminSlice = createSlice({
    name:"superadmin",
    initialState,
    reducers:{
        setSuperAdmin:(state,action)=>{
            state.authenticated=action.payload.authenticated ?? state.authenticated;
        },
        resetSuperAdminState:(state)=>{
            state.authenticated=false;
        }
    }

})

export const { setSuperAdmin, resetSuperAdminState } = superAdminSlice.actions;