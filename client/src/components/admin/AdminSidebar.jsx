import React from 'react'
import { assets } from '../../assets/assets'
import { LayoutDashboardIcon, ListCollapse, ListIcon, PlusSquareIcon } from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'

const AdminSidebar = () => {

  const location = useLocation()

  const user = {
    firstName: "Admin",
    lastName: "User",
    importUrl: assets.profile,
  }

  const adminNavlinks = [
    { name: 'Dashboard', path: '/admin/', icon: LayoutDashboardIcon },
    { name: 'Add Shows', path: '/admin/add-shows', icon: PlusSquareIcon },
    { name: 'List Shows', path: '/admin/list-shows', icon: ListIcon },
    { name: 'List Bookings', path: '/admin/list-bookings', icon: ListCollapse },
  ]

  return (
    <div className='h-[calc(100vh-64px)] flex flex-col items-center pt-8 w-full md:max-w-60 border-r border-gray-300/20 text-sm'>

      <img
        src={user.importUrl}
        alt=""
        className='h-9 md:h-14 w-9 md:w-14 rounded-full mx-auto'
      />

      <p className='mt-2 text-base max-md:hidden'>
        {user.firstName} {user.lastName}
      </p>

      <div className='w-full mt-6'>
        {adminNavlinks.map((link, index) => {

          const activeNow =
            location.pathname === '/admin' && index === 0

          return (
            <NavLink
              key={index}
              to={link.path}
              end
              className={({ isActive }) =>
                `relative flex items-center max-md:justify-center gap-2 w-full py-2.5 md:pl-10 text-gray-400 ${
                  (isActive || activeNow) && 'bg-primary/15 text-primary group'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <link.icon className='w-5 h-5' />

                  <p className='max-md:hidden'>{link.name}</p>

                  <span
                    className={`w-1.5 h-10 rounded right-0 absolute ${
                      (isActive || activeNow) && 'bg-primary'
                    }`}
                  />
                </>
              )}
            </NavLink>
          )
        })}
      </div>
    </div>
  )
}

export default AdminSidebar
