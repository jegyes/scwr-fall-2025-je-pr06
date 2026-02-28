import { useState, useEffect } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { Menu } from 'antd'
import { HomeOutlined, UserOutlined, ProfileOutlined } from '@ant-design/icons'
import { Hub } from 'aws-amplify/utils'
import checkUser from './checkUser'

const getNavLinks = (isAdmin) => {
  const navLinks = [
    {
      key: 'home',
      label: (
        <Link to="/">
          <HomeOutlined />
          Home
        </Link>
      ),
    },
    {
      key: 'profile',
      label: (
        <Link to="/profile">
          <ProfileOutlined />
          Profile
        </Link>
      ),
    },
  ]

  if (isAdmin) {
    navLinks.push({
      key: 'admin',
      label: (
        <Link to="/admin">
          <UserOutlined />
          Admin
        </Link>
      ),
    })
  }

  return navLinks
}

const Nav = () => {
  const [selectedPage, setSelectedPage] = useState('home')
  const location = useLocation()
  const [user, updateUser] = useState({})

useEffect(() => {
  checkUser(updateUser)

  const listener = (data) => {
    const { payload: { event } } = data
    if (event === 'signIn' || event === 'signOut') {
      checkUser(updateUser)
    }
  }

  Hub.listen('auth', listener)

  const currentPage = location.pathname.split('/')[1]
  setSelectedPage(currentPage ? currentPage : 'home')

  return () => {
    try {
      Hub.remove('auth', listener)
    } catch (e) {
      // ignore if not supported
    }
  }
}, [location])

  return (
    <div>
      <div className="headerBar">
        <div className="headerInner">
          <h1 className="appTitle">The Happy AppITizer🌶️</h1>
        </div>
      </div>
      <Menu
        items={getNavLinks(user.isAuthorized)}
        selectedKeys={[selectedPage]}
        mode="horizontal"
      />
      <Outlet />
    </div>
  )
}

export default Nav