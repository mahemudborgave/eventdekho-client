import { useContext, useState } from "react"
import SearchContext from "../context/SearchContext";

function Search({ handleChange, handleClick, page}) {
  const { searchValue, setSearchValue } = useContext(SearchContext);

  return (
      <div className='px-2 py-1 lg:px-4 lg:py-2 bg-gray-200 m-auto rounded-full flex items-center text-sm'>
        <input type="text" placeholder={`Search for ${page}`} className='focus:outline-none outline-0 flex-grow ml-2 text-sm lg:text-base' onChange={handleChange} value={searchValue} />
        <i className="fa-solid fa-magnifying-glass p-3 lg:p-4 bg-amber-300 rounded-full"></i>
        <span className="material-symbols-outlined lg:ml-2 p-1.5 hover:bg-gray-100 rounded-full cursor-pointer" onClick={handleClick}>
          close
        </span>
      </div>
  )
}

export default Search