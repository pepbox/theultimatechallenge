import { Button, InputAdornment, TextField } from '@mui/material'
import React from 'react'
import SearchIcon from '@mui/icons-material/Search';
import LogoutIcon from '@mui/icons-material/Logout';

function Header() {
  return (
   <>
   <div className='w-[80%] mx-auto'>
        <div className='h-[60px] flex items-center justify-between'>
          <div className='flex gap-[40px]'>

            <div className='flex items-center text-[16px] text-[#111111]'>
              <h1 className='text-[24px] font-bold'>Pepbox Super Admin</h1>
            </div>
            <div>
              <TextField
                placeholder="Search"
                variant="outlined"
                size="small"
                sx={{
                  borderRadius: '12px',
                  backgroundColor: '#fff'
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  style: {
                    borderRadius: '12px',
                    height: '40px'
                  }
                }}
              />
            </div>

          </div>
          <div className='h-[60px] flex items-center gap-[30px]'>
            <h1 className='font-sans text-[16px] font-bold'>Home</h1>
            <h1 className='font-sans text-[16px]'>Manage Games</h1>
            <Button variant="outlined" sx={{ color: "#FF6363", borderColor: "#FF6363", borderRadius: "8px" }} startIcon={<LogoutIcon />}>
              Logout
            </Button>
          </div>
        </div>
      </div>
   </>
  )
}

export default Header