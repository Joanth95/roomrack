'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const Navbar = () => {
  const pathname = usePathname();

  const navigation = [
    { name: 'Tableau de bord', href: '/' },
    { name: 'Room-Rack', href: '/room-rack' },
    { name: 'Planning', href: '/planning' },
    { name: 'Séjours', href: '/stays', children: [
      { name: 'Nouveau séjour', href: '/stays/new' },
      { name: 'Historique', href: '/stays/history' }
    ]},
    { name: 'Résidents', href: '/residents' },
    { name: 'Chambres', href: '/admin' }
  ];

  const [isStaysOpen, setIsStaysOpen] = useState(false);

  return (
    <nav className="bg-indigo-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-white text-xl font-bold">EHPAD Manager</span>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {navigation.map((item) => {
                  const isActive = pathname === item.href || 
                    (item.children?.some(child => pathname === child.href));
                  
                  if (item.children) {
                    return (
                      <div key={item.name} className="relative">
                        <button
                          onClick={() => setIsStaysOpen(!isStaysOpen)}
                          className={`${
                            isActive
                              ? 'bg-indigo-700 text-white'
                              : 'text-gray-100 hover:bg-indigo-500'
                          } px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 flex items-center`}
                        >
                          {item.name}
                          <svg
                            className={`ml-2 h-4 w-4 transition-transform ${isStaysOpen ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        {isStaysOpen && (
                          <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                            <div className="py-1">
                              {item.children.map((child) => (
                                <Link
                                  key={child.name}
                                  href={child.href}
                                  className={`${
                                    pathname === child.href
                                      ? 'bg-gray-100 text-gray-900'
                                      : 'text-gray-700 hover:bg-gray-50'
                                  } block px-4 py-2 text-sm`}
                                >
                                  {child.name}
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`${
                        isActive
                          ? 'bg-indigo-700 text-white'
                          : 'text-gray-100 hover:bg-indigo-500'
                      } px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150`}
                    >
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* Menu mobile */}
          <div className="md:hidden">
            <div className="flex items-center">
              <button
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-100 hover:bg-indigo-500 focus:outline-none"
                aria-label="Menu principal"
              >
                <svg
                  className="h-6 w-6"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Menu mobile (contenu) */}
      <div className="md:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            if (item.children) {
              return (
                <div key={item.name} className="space-y-1">
                  <button
                    onClick={() => setIsStaysOpen(!isStaysOpen)}
                    className={`${
                      isActive
                        ? 'bg-indigo-700 text-white'
                        : 'text-gray-100 hover:bg-indigo-500'
                    } w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors duration-150 flex items-center justify-between`}
                  >
                    {item.name}
                    <svg
                      className={`ml-2 h-4 w-4 transition-transform ${isStaysOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {isStaysOpen && (
                    <div className="pl-4 space-y-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.name}
                          href={child.href}
                          className={`${
                            pathname === child.href
                              ? 'bg-indigo-700 text-white'
                              : 'text-gray-100 hover:bg-indigo-500'
                          } block px-3 py-2 rounded-md text-base font-medium transition-colors duration-150`}
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`${
                  isActive
                    ? 'bg-indigo-700 text-white'
                    : 'text-gray-100 hover:bg-indigo-500'
                } block px-3 py-2 rounded-md text-base font-medium transition-colors duration-150`}
              >
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 