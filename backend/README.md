# My React App

This is a full-stack React application with an Express server. The client and server are both run concurrently for development purposes.

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed on your system:

- [Node.js](https://nodejs.org/) (which includes `npm`)

### Installation

1. **Enter directory**:

    ```bash
    cd my-app
    ```

2. **Install dependencies**:

    ```bash
    npm install
    ```

    This will install all the necessary dependencies for both the client and server.

    If you are still missing a dependency, you can install the package using:

    ```bash
    npm install package-name
    ```

### Running the Application

To start both the client and server sides concurrently, use the following command:

```bash
npm start
```

## Access Client and Server

In your browser, you can go to both the client and server as the app runs them concurrently.

### Client

Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you save changes to the code.\
You may also see any lint errors in the console.

### Server

Open [http://localhost:5000](http://localhost:5000) to view it in your browser.

The page will need to be manually reloaded, after stopping and re-starting the code when you save changes.\
You may also see any lint errors in the console.

## API Calls
The API used are defined in the `server.js` file, and contains all the API used for both S3 access and SQL database access. The global variables used for the API configuration are stored in the `.env` file.

### Amazon S3 APIs
1. GET Method - `/files`\
This API lists the details for all the files currently in the S3 storage bucket. To view it in a browser, use [http://localhost:5000/files](http://localhost:5000/files)

2. GET Method - `/files/:key`\
This API gets the detials for a specific file from the S# storage bucket, where the `key` parameter is the name of the stored file including the file extension (Eg. test-video.mp4). If the file is not sotred locally, it will download the file and save it in the `my-app/Folders/` directory.

   At the moment, the code within the `FileList.js` file automatically lists all files from S3 by using the fetch method. When the download button is clicked, it downloads the file. This component is added to the main `App.js` file.