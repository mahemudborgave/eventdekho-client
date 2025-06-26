import React from 'react';
import NumbersComp from '../components/NumbersComp';
import illustration1 from '../assets/images/illustration1.svg';

function About() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-10 px-2">
            <div className="max-w-5xl w-full bg-white rounded-2xl shadow-lg grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
                {/* Left: Text Content */}
                <div className="flex flex-col justify-center">
                    <span className="text-amber-600 font-semibold mb-2 text-lg">How It Started</span>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight text-gray-900">
                        Our Dream is <br /> Global Event Transformation
                    </h1>
                    <p className="text-gray-600 text-lg">
                        EventApply was founded by a passionate team of learners and educators. Our shared dream is to create a digital haven of opportunities accessible to all. United by our belief in the transformational power of events and education, we embarked on a journey to build EventApply. With relentless dedication, we gathered a team of experts and launched this innovative platform, creating a global community of eager learners and organizers, all connected by the desire to explore, learn, and grow.
                    </p>
                </div>
                {/* Right: Image */}
                <div className="flex flex-col items-center justify-center">
                    <img src={illustration1} alt="About EventApply" className="rounded-xl w-full h-64 object-contain bg-gray-100" />
                </div>
            </div>
            {/* Statistics Cards */}
            <div className="w-full max-w-5xl mt-8">
                <NumbersComp />
            </div>
        </div>
    );
}

export default About; 