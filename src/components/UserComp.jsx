import { GraduationCap, University } from 'lucide-react';
import React from 'react';

function UserComp() {
    return (
        <div className="flex flex-col md:flex-row gap-6 p-15 justify-center items-center">
            <div className="border border-gray-500 rounded-xl p-6 lg:w-80 text-center hover:scale-105 transition duration-300">
                <h2 className="text-xl font-semibold mb-2 flex justify-center items-center gap-2"><GraduationCap />Students</h2>
                <p className="text-gray-600">Explore and join college events.</p>
            </div>

            <div className='p-2 text-xl text-[#0d0c22] font-bold bg-gray-200 rounded-full w-50 h-50 flex justify-center items-center text-center border-6 border-[#0d0c22]'>
                Who is using EventApply
            </div>


            <div className="border border-gray-500 rounded-xl p-6 lg:w-80 text-center hover:scale-105 transition duration-300">
                <h2 className="text-xl font-semibold mb-2 flex justify-center items-center gap-2"><University />Colleges</h2>
                <p className="text-gray-600">Host and manage college events.</p>
            </div>
        </div>
    );
}

export default UserComp;
