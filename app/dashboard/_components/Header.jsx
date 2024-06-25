"use client"
import { UserButton } from '@clerk/nextjs'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import React, { useEffect } from 'react'

export const Header = () => {
    const path=usePathname()
    useEffect(()=>{
        console.log(path);
    })
  return (
    <div className='flex p-4 items-center justify-between bg-secondary shadow-sm '>
        <Image src={'/logo.png'} alt='logo' width={65} height={45}    />
        <ul className='hidden md:flex gap-6'>
            <li className={`hover:text-primary hover:font-bold transition-all cursor-pointer ${path=='/dashboard' && 'text-primary font-bold'}`}>Dashboard</li>
            <li className="hover:text-primary hover:font-bold transition-all cursor-pointer">
    <a href="https://pro-prep-resume-builder.vercel.app/" target="_blank" rel="noopener noreferrer">
        Build Your Own Resume
    </a>
</li>

            <li className={`hover:text-primary hover:font-bold transition-all cursor-pointer ${path=='/dashboard/upgrade' && 'text-primary font-bold'}`}>Upgrade</li>
            <li className={`hover:text-primary hover:font-bold transition-all cursor-pointer ${path=='/dashboard/how' && 'text-primary font-bold'}`}>How its works?</li>
        </ul>
        <UserButton/>
    </div>
  )
}
