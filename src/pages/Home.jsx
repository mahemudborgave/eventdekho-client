import React from 'react'
import MainSearch from '../components/MainSearch'
import { Carousel } from 'flowbite-react'
import i1 from '../assets/images/illustration1.svg'
import i2 from '../assets/images/illustration2.svg'
import i3 from '../assets/images/illustration3.svg'
import i4 from '../assets/images/illustration4.svg'
import CompaniesCoro from '../components/CompaniesCoro'

function Home() {
    return (
        <>
            <div className='grid md:grid-cols-2 grid-cols-1  items-center'>
                <div className='block w-full px-10 h-[300px] lg:h-[500px] overflow-hidden overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] relative'>
                    <Carousel slideInterval={1000} className="overflow-hidden">
                        {/* <div className='flex justify-center w-[500px] h-[500px]'>
                            <img src={i1} alt="..." className='w-full h-full' />
                        </div> */}
                        <div className='flex justify-center w-full h-full'>
                            <img src={i2} alt="..." className='w-full h-full' />
                        </div>
                    
                    </Carousel>
                </div>
                <div className='lg:px-10'><MainSearch /></div>
            </div>
            <div className='my-10 lg:my-20 block'>
                <CompaniesCoro />
            </div>
        </>
    )
}



export default Home