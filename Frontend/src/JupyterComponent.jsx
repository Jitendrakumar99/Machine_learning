import React, { useState } from 'react';
import axios from 'axios';
import { FaUpload } from 'react-icons/fa';

const JupyterComponent = () => {
  const [selectedCode, setSelectedCode] = useState('');
  const [file, setFile] = useState(null);
  const [output, setOutput] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [currentShow, setCurrentShow] = useState(null);


  const codeOptions = [
    { label: 'Candidate-Elimination algorithm', value: 'candidate-elimination' },
    { label: 'FIND-S', value: 'FIND-S' },
    { label: 'ID3 algorithm', value: 'ID3_algorithm' },
  ];


  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);

     
      const reader = new FileReader();
      reader.onload = (event) => {
        setFileContent(event.target.result);
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleExecute = async () => {
    if (!selectedCode || !file) {
      setOutput('Please select a code and upload a file.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('selectedCode', selectedCode);
    setCurrentShow(selectedCode);

    try {
      const response = await axios.post('http://127.0.0.1:5000/execute', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setOutput(response.data.output);
    } catch (error) {
      console.error('Error executing code:', error);
      setOutput('Error executing code.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center py-10 px-4">
   
      <h1 className="text-4xl font-bold mb-8 text-blue-400">Machine Learning Execution</h1>

      <div className="w-full  bg-gray-800 p-8 rounded-lg shadow-lg mb-8">
        <div className="flex w-3/4 flex-col md:flex-row gap-6">
      
          <div className="flex-1">  
            <label className="block text-lg font-semibold mb-2 text-gray-200">Select Python Code:</label>
            <select
              value={selectedCode}
              onChange={(e) => setSelectedCode(e.target.value)}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-200"
            >
              <option value="" disabled>-- Select Code --</option>
              {codeOptions.map((option) => (
                <option key={option.value} value={option.value} className="bg-gray-800">
                  {option.label}
                </option>
              ))}
            </select>
        </div>

  <div className="flex flex-row  justify-center items-end ">
  <label className="cursor-pointer  flex items-center space-x-2 bg-blue-600 px-6 py-3 rounded-lg hover:bg-blue-500 transition transform hover:scale-105 active:scale-95">
    <FaUpload className="text-xl" />
    <span className="text-lg font-medium">Upload File</span>
    <input
      type="file"
      onChange={handleFileChange}
      accept=".xlsx,.xls,.csv,.txt"
      className="hidden"
    />
  </label>


  {file && (
    <div className="flex items-center justify-center ml-5">
    <p className="text-sm text-gray-400 bg-gray-700 px-3 py-3.5 align-items-center h-13  justify-content-center rounded-md">
      Uploaded: <span className="font-semibold text-gray-200 align-items-center  justify-content-center">{file.name}</span>
    </p>
    </div>
  )}
</div>
        </div>
      </div>


      <div className="w-full flex flex-col md:flex-row gap-6">
  
        <div className="w-full md:w-1/2 bg-gray-800 p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-4 text-gray-200">Input (CSV Content)</h3>
          <pre className="h-96 overflow-auto bg-gray-700 p-4 rounded-lg text-gray-200">
            {fileContent || 'No file selected'}
          </pre>
        </div>

 
        <div className="w-full md:w-1/2 bg-gray-800 p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-4 text-gray-200">Output</h3>

          {currentShow === 'FIND-S' && output && (
            <pre className="h-96 overflow-auto bg-gray-700 p-4 rounded-lg text-gray-200">
              {JSON.stringify(output.message)} {JSON.stringify(output.hypothesis)}
            </pre>
          )}

          {currentShow === 'candidate-elimination' && output && (
            <div className="h-96 overflow-auto bg-gray-700 p-4 rounded-lg text-gray-200">
              <h3 className="font-semibold mb-2">Specific Hypothesis</h3>
              <pre>{JSON.stringify(output['Specific Hypothesis'])}</pre>
              <h3 className="font-semibold mt-4 mb-2">General Hypotheses</h3>
              <pre>{JSON.stringify(output['General Hypotheses'])}</pre>
            </div>
          )}

          {currentShow === 'ID3_algorithm' && output && (
            <div className="h-96 overflow-auto bg-gray-700 p-4 rounded-lg flex flex-col items-center">
              <h3 className="text-lg font-semibold mb-4 text-gray-200">{output.message}</h3>
              <img
                src={`http://127.0.0.1:5000/${output.image_url}`}
                alt="Decision Tree"
                className="rounded-lg shadow-md"
              />
            </div>
          )}

          {!output && <p className="text-gray-400">No output yet.</p>}
        </div>
      </div>


      <button
        onClick={handleExecute}
        disabled={!selectedCode || !file}
        className="mt-8 px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-lg font-semibold disabled:bg-gray-600 disabled:cursor-not-allowed transition"
      >
        Execute Code
      </button>
    </div>
  );
};

export default JupyterComponent;