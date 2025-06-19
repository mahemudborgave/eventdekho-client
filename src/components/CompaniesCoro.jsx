import React from 'react'
import Marquee from "react-fast-marquee";
import WCESangliLogo from '../assets/images/colleges/WCE-Sangli-Logo.webp';
import updateLogo from '../assets/images/colleges/update-logo.png';
import logoIIT from '../assets/images/colleges/logo-iit.png';
import logo1 from '../assets/images/colleges/logo (1).png';
import logo from '../assets/images/colleges/logo.png';
import iitrLogo from '../assets/images/colleges/iitrLogo.png';
import iitmLogo from '../assets/images/colleges/iitm_logo.png';
import iitLogoOriginal from '../assets/images/colleges/iit_logo_original.png';
import iitgLogo from '../assets/images/colleges/iitglogo.jpg';
import horzLogoLong from '../assets/images/colleges/horzlogolong.png';
import coepLogo from '../assets/images/colleges/College_of_Engineering,_Pune_logo.jpg';

function CompaniesCoro() {
  return (
    <div className='flex h-20 lg:h-25 bg-gray-200'>

      <div className='text-sm text-left flex flex-col justify-center lg:px-10 px-5 lg:w-45 w-30'>
        Colleges
        <span className='font-bold text-md lg:text-[20px] text-[#0d0c22]'>
          Trust us
        </span>
      </div>

      <Marquee speed={100} gradient={false}>
        <div className='mr-20'>
          <img src={WCESangliLogo} alt="WCE Sangli Logo" className='block h-12' />
        </div>
        <div className='mr-20'>
          <img src={updateLogo} alt="Update Logo" className='block h-12' />
        </div>
        <div className='mr-20'>
          <img src={logoIIT} alt="IIT Logo" className='block h-12' />
        </div>
        <div className='mr-20'>
          <img src={logo1} alt="Logo 1" className='block h-12' />
        </div>
        <div className='mr-20'>
          <img src={logo} alt="Logo" className='block h-12' />
        </div>
        <div className='mr-20'>
          <img src={iitrLogo} alt="IITR Logo" className='block h-12' />
        </div>
        <div className='mr-20'>
          <img src={iitmLogo} alt="IITM Logo" className='block h-12' />
        </div>
        <div className='mr-20'>
          <img src={iitLogoOriginal} alt="IIT Logo Original" className='block h-12' />
        </div>
        <div className='mr-20'>
          <img src={iitgLogo} alt="IITG Logo" className='block h-12' />
        </div>
        <div className='mr-20'>
          <img src={horzLogoLong} alt="Horizontal Logo Long" className='block h-12' />
        </div>
        <div className='mr-20'>
          <img src={coepLogo} alt="COEP Logo" className='block h-12' />
        </div>
      </Marquee>
    </div>
  )
}

export default CompaniesCoro