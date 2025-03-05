import React, { useEffect, useState } from 'react';

const FileList = () => {
  const [files, setFiles] = useState([]);
  const serverPort = process.env.REACT_APP_SERVER_PORT;

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await fetch(`http://localhost:${serverPort}/files`);
        const files = await response.json();
        setFiles(files);
      } catch (error) {
        console.error('Error fetching files:', error);
      }
    };

    fetchFiles();
  }, []);

  const downloadFile = async (key) => {
    try {
      const response = await fetch(`http://localhost:${serverPort}/files/${key}`);
      const result = await response.text();
      console.log(result); // Log the result message
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  return (
    <div>
      <h1>Files in S3 Bucket</h1>
      <ul>
        {files.map(file => (
          <li key={file.Key}>
            {file.Key}
            <button onClick={() => downloadFile(file.Key)}>Download</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FileList;
