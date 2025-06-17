import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import collegeList from "../../college_list.json";
import { toast } from "react-toastify";
import UserContext from "../../context/UserContext";
import { Link } from "react-router-dom";



export default function AddEvent() {

  const { email } = useContext(UserContext);

  const initialState = {
    email,
    eventName: "",
    collegeName: "",
    collegeCode: "",
    eventDate: "",
    eventLocation: "",
    closeOn: "",
    eventDescription: "",
  };


  const baseURL = import.meta.env.VITE_BASE_URL;
  const port = import.meta.env.VITE_PORT;
  const [form, setForm] = useState(initialState);
  const [colleges, setColleges] = useState([]);
  const [isShow, setIsShow] = useState(false);



  useEffect(() => {
    const checkAuth = async () => {
      setColleges(collegeList);
      const StoredToken = localStorage.getItem("token");
      let response;

      if (StoredToken) {
        try {
          response = await axios.post(`${baseURL}:${port}/userauth/verifytoken`, {}, {
            headers: {
              Authorization: `Bearer ${StoredToken}`
            }
          });
        } catch (e) {
          console.log("Error ", e);
        }
      }

      if (StoredToken && response) {
        setIsShow(true);
      } 
      // else {
      //   toast.warn("Please Log in to continue");
      // }
    };

    checkAuth();
  }, []);


  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "collegeName") {
      const [namePart, codePart] = value.split(" - ");
      setForm({
        ...form,
        collegeName: namePart || "",
        collegeCode: codePart || "",
      });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.eventName || !form.collegeName || !form.collegeCode ||
      !form.eventDate || !form.eventLocation || !form.closeOn || !form.eventDescription) {
      console.error("Validation failed: All fields are required");
      return;
    }

    if (form.collegeCode.length < 4) {
      console.error("Validation failed: College code must be at least 4 characters");
      return;
    }

    try {
      const res = await axios.post(`${baseURL}:${port}/eventt/addevent`, form);
      setForm(initialState);
      if (res) toast.success(`${res.data.message}`);
    } catch (error) {
      console.error("Error submitting event:", error);
    }
  };

  return (
    <>
      {
        isShow ? (
          <div className="h-full bg-[#F5F6FA] w-full">
            <form className="bg-white p-8 h-full" onSubmit={handleSubmit}>
              <h2 className="text-2xl font-bold mb-16 text-[#232946]">
                <span className="text-[#FFD600]">Create</span> Event
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField name="eventName" label="Event Name" value={form.eventName} onChange={handleChange} required />

                <div>
                  <label className="block font-medium mb-1">Event College Name</label>
                  <select
                    name="collegeName"
                    value={`${form.collegeName} - ${form.collegeCode}`}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#FFD600] border-gray-300"
                    required
                  >
                    <option value="">Select a college</option>
                    {colleges.map((college) => (
                      <option key={college.dte_code} value={`${college.college_name} - ${college.dte_code}`}>
                        {`${college.college_name} - ${college.dte_code}`}
                      </option>
                    ))}
                  </select>
                </div>

                <InputField name="eventDate" type="date" label="Event Date" value={form.eventDate} onChange={handleChange} required />
                <InputField name="eventLocation" label="Event Location" value={form.eventLocation} onChange={handleChange} required />
                <InputField name="closeOn" type="date" label="Close On" value={form.closeOn} onChange={handleChange} required />
              </div>

              <div className="mt-6">
                <label className="block font-medium mb-1">Event Description</label>
                <textarea
                  name="eventDescription"
                  value={form.eventDescription}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#FFD600] border-gray-300"
                  required
                />
              </div>

              <button
                type="submit"
                className="mt-8 px-5 bg-[#FFD600] text-[#232946] font-bold py-3 rounded-full hover:bg-[#ffe066] transition"
              >
                Create Event
              </button>
            </form>
          </div>
        ) : (<Link to='/login' className="block p-8 text-center text-red-700 underline ">Log in to continue</Link>)
      }
    </>

  );
}

function InputField({ name, type = "text", label, value, onChange, required = false }) {
  return (
    <div>
      <label className="block font-medium mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        minLength={name === "collegeCode" ? 4 : undefined}
        required={required}
        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#FFD600] border-gray-300"
      />
    </div>
  );
}
