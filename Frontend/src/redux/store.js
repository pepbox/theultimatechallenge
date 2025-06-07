import { configureStore } from "@reduxjs/toolkit";
import { adminSlice } from "./admin/adminSlice";
import { superAdminSlice } from "./superadmin/superAdminSlice";

export const store=configureStore({
    reducer:{
        admin:adminSlice.reducer,
        superadmin:superAdminSlice.reducer,
    }
})