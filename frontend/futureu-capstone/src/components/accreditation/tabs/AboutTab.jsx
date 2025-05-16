import React from "react";

const AboutTab = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-8 animate-fadeIn">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-left">About Accreditation</h2>
      
      <div className="text-left max-w-none">
        <p className="text-gray-700 mb-6 leading-relaxed">
          Accreditation is a process of external quality review used by higher education to scrutinize colleges, universities, 
          and educational programs for quality assurance and quality improvement. In the Philippines, accreditation is 
          voluntary and is carried out by private, non-governmental organizations.
        </p>
        
        <div className="bg-gray-50 rounded-lg p-6 mb-6 border-l-4 border-yellow-500 shadow-sm">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Accreditation Levels</h3>
          <p className="text-gray-700 mb-4">
            The accreditation system in the Philippines consists of four levels, each representing a different stage of quality 
            assurance:
          </p>
          
          <div className="space-y-4 pl-2">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold">I</div>
              <div>
                <p className="font-semibold text-gray-800">Level I (Initial Accreditation)</p>
                <p className="text-gray-600">The program has met the minimum standards and has been granted initial accreditation.</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold">II</div>
              <div>
                <p className="font-semibold text-gray-800">Level II (Formal Accreditation)</p>
                <p className="text-gray-600">The program has demonstrated a good quality of instruction, research, and extension services.</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold">III</div>
              <div>
                <p className="font-semibold text-gray-800">Level III (Re-accredited Status)</p>
                <p className="text-gray-600">The program has demonstrated a high level of quality and has shown a commitment to excellence and continuous improvement.</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold">IV</div>
              <div>
                <p className="font-semibold text-gray-800">Level IV (Institutional Accreditation)</p>
                <p className="text-gray-600">The highest level of accreditation, indicating that the program has met international standards of excellence.</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-50 rounded-lg p-6 mb-6 border-l-4 border-indigo-500 shadow-sm">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Recognition Types</h3>
          <p className="text-gray-700 mb-4">
            The Commission on Higher Education (CHED) recognizes outstanding programs through two designations:
          </p>
          
          <div className="space-y-4 pl-2">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 px-3 py-1 mt-1 rounded-full bg-indigo-700 text-white text-xs font-medium">COE</div>
              <div>
                <p className="font-semibold text-gray-800">Center of Excellence</p>
                <p className="text-gray-600">Programs that have demonstrated the highest level of standards in instruction, research, and extension services.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 px-3 py-1 mt-1 rounded-full bg-indigo-500 text-white text-xs font-medium">COD</div>
              <div>
                <p className="font-semibold text-gray-800">Center of Development</p>
                <p className="text-gray-600">Programs that have demonstrated the potential to become Centers of Excellence.</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-yellow-50 rounded-lg p-6 border-l-4 border-amber-500 shadow-sm">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Accrediting Bodies</h3>
          <p className="text-gray-700 mb-4">
            Several accrediting bodies operate in the Philippines, including:
          </p>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center mb-2">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold mr-2">P</div>
                <p className="font-semibold text-gray-800">PACUCOA</p>
              </div>
              <p className="text-gray-600 text-sm">Philippine Association of Colleges and Universities Commission on Accreditation</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center mb-2">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold mr-2">P</div>
                <p className="font-semibold text-gray-800">PAASCU</p>
              </div>
              <p className="text-gray-600 text-sm">Philippine Accrediting Association of Schools, Colleges and Universities</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm md:col-span-2">
              <div className="flex items-center mb-2">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold mr-2">A</div>
                <p className="font-semibold text-gray-800">AACCUP</p>
              </div>
              <p className="text-gray-600 text-sm">Accrediting Agency of Chartered Colleges and Universities in the Philippines</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutTab; 