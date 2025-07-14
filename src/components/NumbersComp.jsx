import React from 'react';

function NumbersComp() {
  return (
    <div className="lg:px-40 px-4">
      <h2 className="text-2xl lg:text-3xl font-semibold mb-6 text-center text-[#0d0c22]">
        Platform Statistics
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-100 p-6 rounded-xl flex flex-col items-center">
          <p className="text-3xl lg:text-4xl font-bold text-amber-500">12,500+</p>
          <p className="mt-2 text-lg text-gray-600">Visitors</p>
        </div>
        <div className="bg-gray-100 p-6 rounded-xl flex flex-col items-center">
          <p className="text-3xl lg:text-4xl font-bold text-amber-500">180+</p>
          <p className="mt-2 text-lg text-gray-600">Events</p>
        </div>
        <div className="bg-gray-100 p-6 rounded-xl flex flex-col items-center">
          <p className="text-3xl lg:text-4xl font-bold text-amber-500">25+</p>
          <p className="mt-2 text-lg text-gray-600">Colleges</p>
        </div>
        <div className="bg-gray-100 p-6 rounded-xl flex flex-col items-center">
          <p className="text-3xl lg:text-4xl font-bold text-amber-500">3,000+</p>
          <p className="mt-2 text-lg text-gray-600">Students</p>
        </div>
      </div>
    </div>
  );
}

export default NumbersComp;
