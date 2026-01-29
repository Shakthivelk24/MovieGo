import React from 'react'
import { Link } from 'react-router-dom'
import { assets } from '../../assets/assets'

const AdminNavbar = () => {
  return (
    <div className='flex items-center justify-between px-6 md:px-10 h-16 border-b border-gray-300/30'>
        <Link to = "/" className='flex items-center gap-2'>
          <img src={assets.logo} alt="" className='w-20 h-auto' />
          <p className='text-2xl font-bold text-white'><span className='text-red-400 text-3xl'>M</span>ovieGo</p>
        </Link>
    </div>
  )
}

export default AdminNavbar