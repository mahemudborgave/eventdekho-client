import React from 'react'
import MainSearch from '../components/MainSearch'
import { Carousel } from 'flowbite-react'
import i1 from '../assets/images/illustration1.svg'
import i2 from '../assets/images/illustration2.svg'
import i3 from '../assets/images/illustration3.svg'
import i4 from '../assets/images/illustration4.svg'
import CompaniesCoro from '../components/CompaniesCoro'
import { NavLink } from 'react-router-dom'
import { ArrowBigRightDash } from 'lucide-react'
import HomeRecent from '../components/HomeRecent'
import NumbersComp from '../components/NumbersComp'
import UserComp from '../components/UserComp'

function Home() {
    return (
        <>
            <div className='grid md:grid-cols-2 grid-cols-1 items-center bg-gray-100 py-10'>
                <div className='block w-full h-[300px] lg:h-[420px] overflow-hidden overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] relative'>
                    <Carousel slideInterval={1000} className="overflow-hidden">
                        <div className='flex justify-center w-full h-full'>
                            <img src={i1} alt="..." className='w-full h-full' />
                        </div>
                        <div className='flex justify-center w-full h-full'>
                            <img src={i2} alt="..." className='w-full h-full' />
                        </div>
                        <div className='flex justify-center w-full h-full'>
                            <img src={i3} alt="..." className='w-full h-full' />
                        </div>
                        <div className='flex justify-center w-full h-full'>
                            <img src={i4} alt="..." className='w-full h-full' />
                        </div>

                    </Carousel>
                </div>
                <div className='lg:px-10'>
                    <MainSearch />
                </div>
            </div>
            <div className=''>
                <UserComp />
            </div>
            <div className='py-10 lg:py-0 block'>
                <CompaniesCoro />
            </div>
            <div>
                <HomeRecent />
            </div>
            <div>
                <NumbersComp />
            </div>
            
        </>
    )
}



export default Home