import React, { useState, useEffect } from "react";

const VirtualCampusToursPage = () => {
  const [school, setSchool] = useState("");
  const [schoolType, setSchoolType] = useState("");
  const [filteredCampuses, setFilteredCampuses] = useState([]);

  const campuses = [
    {
      name: "Cebu Institute of Technology - University",
      description:
        "Our main campus offers state-of-the-art facilities and a vibrant student community.",
      video: "https://drive.google.com/file/d/1M_HWOUz4Z-UIkJMWhuxbFOpnlfVXKLn7/preview", // Updated embed link
      location: "Cebu",
      schoolType: "Private",
    },
    {
      name: "University of San Jose - Recoletos",
      description:
        "The University of San Jose - Recoletos is known for its rich history and academic excellence.",
      video: "https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fwww.facebook.com%2Fusjr.official%2Fvideos%2F358279392604079%2F&show_text=false&width=560&t=0",
      location: "Cebu",
      schoolType: "Private",
    },
    {
      name: "Southwestern University - PHINMA",
      description:
        "Southwestern University - PHINMA is a leading institution in Cebu, offering a wide range of programs.",
      video: "https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fweb.facebook.com%2Fswuphinma%2Fvideos%2F1186881652309815%2F&show_text=false&width=560&t=0",
      location: "Cebu",
      schoolType: "Private",
    },
    {
      name: "University of San Carlos",
      description:
        "University of San Carlos is a leading institution in Cebu, offering a wide range of programs.",
      video: "https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fweb.facebook.com%2Fusccebu%2Fvideos%2F668876398463718%2F&show_text=false&width=560&t=0",
      location: "Cebu",
      schoolType: "Private",
    },
    {
      name: "University of the Visayas - Main Campus",
      description:
        "University of the Visayas - Main Campus is a leading institution in Cebu, offering a wide range of programs.",
      video: "https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fweb.facebook.com%2Funiversityofthevisayascebu%2Fvideos%2F1700673043796685%2F&show_text=false&width=560&t=0",
      location: "Cebu",
      schoolType: "Private",
    },
    {
      name: "University of the Visayas - Main Campus",
      description:
        "University of the Visayas - Main Campus is a leading institution in Cebu, offering a wide range of programs.",
      video: "https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fweb.facebook.com%2Funiversityofthevisayascebu%2Fvideos%2F975038627400028%2F&show_text=false&width=560&t=0",
      location: "Cebu",
      schoolType: "Private",
    },
    {
      name: "Cebu Doctors' University",
      description: "Cebu Doctors' University is a leading institution in Cebu, offering a wide range of programs.",
      video: "https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fweb.facebook.com%2Fcebudoctorsuniversityofficial%2Fvideos%2F583647479816850%2F&show_text=false&width=560&t=0",
      location: "Cebu",
      schoolType: "Private",
    },
    {
      name: "Cebu Doctors' University",
      description: "Cebu Doctors' University is a leading institution in Cebu, offering a wide range of programs.",
      video: "https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fweb.facebook.com%2Fcebudoctorsuniversityofficial%2Fvideos%2F468438925081437%2F&show_text=false&width=560&t=0",
      location: "Cebu",
      schoolType: "Private",
    },
    {
      name: "Cebu Technological University",
      description: "Cebu Technological University is a leading institution in Cebu, offering a wide range of programs.",
      video: "https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fweb.facebook.com%2Fctu.premier%2Fvideos%2F609134661314472%2F&show_text=false&width=560&t=0",
      location: "Cebu",
      schoolType: "Public",
    },
    {
      name: "Indiana Aerospace University",
      description: "Indiana Aerospace University is a leading institution in Cebu, offering a wide range of programs.",
      video: "https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fweb.facebook.com%2FIndianaAeroUniv%2Fvideos%2F601543727175461%2F&show_text=false&width=560&t=0",
      location: "Cebu",
      schoolType: "Private",
    },
    {
      name: "Cebu Normal University",
      description: "Cebu Normal University is a leading institution in Cebu, offering a wide range of programs.",
      video: "https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fweb.facebook.com%2Fcebunormaluniversityofficial%2Fvideos%2F364001561712089%2F&show_text=false&width=560&t=0",
      location: "Cebu",
      schoolType: "Public",
    },
    // Add more campuses here...
  ];

  useEffect(() => {
    const filtered = campuses.filter(
      (campus) =>
        (school ? campus.name === school : true) &&
        (schoolType ? campus.schoolType === schoolType : true)
    );
    setFilteredCampuses(filtered);
  }, [school, schoolType]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Virtual Campus Tours
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Explore our campus from the comfort of your home!
          </p>
        </div>
      </header>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-wrap justify-center gap-4">
          <div className="w-64">
            <label
              htmlFor="school"
              className="block text-sm font-medium text-gray-700"
            >
              School
            </label>
            <select
              id="school"
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
            >
              <option value="">All Schools</option>
              {campuses.map((campus, index) => (
                <option key={index} value={campus.name}>
                  {campus.name}
                </option>
              ))}
            </select>
          </div>
          <div className="w-64">
            <label
              htmlFor="schoolType"
              className="block text-sm font-medium text-gray-700"
            >
              School Type
            </label>
            <select
              id="schoolType"
              value={schoolType}
              onChange={(e) => setSchoolType(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
            >
              <option value="">All School Types</option>
              <option value="Public">Public</option>
              <option value="Private">Private</option>
            </select>
          </div>
        </div>
      </div>

      {/* Campuses */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampuses.map((campus, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-300"
            >
              <iframe
                className="w-full h-48 rounded-t-lg"
                src={campus.video}
                title={campus.name}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {campus.name}
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  {campus.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VirtualCampusToursPage;