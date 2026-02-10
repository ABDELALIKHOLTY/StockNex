'use client'
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Nav_Items } from '@/lib/Constants'

const NavItems = () => {
    const pathName = usePathname();
    const isActive = (path: string) => {   
        if (path === '/') {
            return pathName === '/';
        }
        return pathName?.startsWith(path);
    }
    
    return (
        <ul className='flex flex-col sm:flex-row p-2 gap-3 sm:gap-10 font-medium'>
            {Nav_Items.map(({href, label}) => (
                <li key={href}>
                    <Link 
                        href={href} 
                        className={`transition-colors ${
                            isActive(href) 
                                ? 'text-cyan-500 font-semibold border-b-2 border-cyan-500' 
                                : 'text-gray-400 hover:text-cyan-500'
                        }`}
                    >
                        {label}
                    </Link>
                </li>
            ))}
        </ul>
    )
}

export default NavItems
