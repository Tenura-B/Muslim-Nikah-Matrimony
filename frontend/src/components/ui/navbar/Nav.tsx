'use client'
import Link from 'next/link'

const Nav = () => {
  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'About us', href: '/about' },
    { name: 'Packages', href: '/packages' },
    { name: 'Profiles', href: '/profiles' },
    { name: 'Contact us', href: '/contact' },
  ]

  return (
    <div className="fixed top-5 left-0 right-0 z-50 flex justify-center containerpadding container mx-auto">
      <nav className="w-full  backdrop-blur-md bg-[#4B7F73]/50 border border-white/15 rounded-full shadow-2xl shadow-black/30">
        <div className="px-6 lg:px-10">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <span className="text-white font-poppins text-[20px] font-medium  uppercase">
                Muslim Nikah
              </span>
            </Link>

            {/* Navigation Items */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-white font-poppins font-medium text-[18px] transition-colors duration-200 hover:text-[#DB9D30]"
                  style={{ fontSize: '18px' }}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-3">
              <Link href="/login">
                <button
                  className="text-white font-poppins font-medium px-4 py-1.5 transition-colors duration-200 hover:text-[#DB9D30]"
                  style={{ fontSize: '18px' }}
                >
                  Login
                </button>
              </Link>
              <Link href="/register">
                <button
                  className="bg-white text-[#010806] font-poppins font-medium px-6 py-1.5 rounded-full hover:bg-white/90 transition-colors duration-200"
                  style={{ fontSize: '18px' }}
                >
                  Register
                </button>
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </div>
  )
}

export default Nav
