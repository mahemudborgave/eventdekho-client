import { useContext, useState } from "react"
import SearchContext from "../context/SearchContext";

function Search({ handleChange, handleClick }) {
  const { searchValue, setSearchValue } = useContext(SearchContext);

  return (
      <div className='px-2 py-1 md:px-4 md:py-2 bg-gray-200 m-auto rounded-full flex items-center text-sm'>
        <input type="text" placeholder="Search for event" className='focus:outline-none outline-0 flex-grow ml-2 text-md' onChange={handleChange} value={searchValue} />
        <i className="fa-solid fa-magnifying-glass p-3 lg:p-4 bg-amber-300 rounded-full"></i>
        <span className="material-symbols-outlined lg:ml-2 p-1.5 hover:bg-gray-100 rounded-full cursor-pointer" onClick={handleClick}>
          close
        </span>
      </div>
  )
}

export default Search