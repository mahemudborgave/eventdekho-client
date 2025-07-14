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
import FeaturedImagesCarousel from '../components/FeaturedImagesCarousel';
import axios from 'axios';
import { useEffect } from 'react';

function setVisitorCookie(name, value, days) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/';
}

function getVisitorCookie(name) {
  return document.cookie.split('; ').reduce((r, v) => {
    const parts = v.split('=');
    return parts[0] === name ? decodeURIComponent(parts[1]) : r
  }, '');
}

function Home() {
    useEffect(() => {
        if (!getVisitorCookie('eventdekho_home_visitor')) {
            axios.post(`${import.meta.env.VITE_BASE_URL}:${import.meta.env.VITE_PORT}/stats/visitors`)
                .then(() => setVisitorCookie('eventdekho_home_visitor', '1', 1/24)) // 1 hour
                .catch(() => {});
        }
    }, []);
    return (
        <>
            <div className='grid md:grid-cols-2 grid-cols-1 items-center rounded-xl bg-gray-100 py-5 lg:py-10 mb-15'>
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

            <div className='mb-15'>
                <UserComp />
            </div>
            <div className='mb-15'>
                <FeaturedImagesCarousel />
            </div>
            <div className='mb-20'>
                <HomeRecent />
            </div>
            {/* <div className='mb-15'>
                <CompaniesCoro />
            </div> */}
            <div className='mb-15'>
                <NumbersComp />
            </div>

        </>
    )
}



export default Home