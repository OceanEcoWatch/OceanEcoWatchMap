# Ocean Eco Watch Map

Welcome to the Ocean Eco Watch Map repository! This repository contains the frontend mapping application of Ocean Eco Watch. All plastic predictions are visualized on a map to make the data accessible and easy to use for everyone.

The mapping application fetches data from our [Map Server](https://github.com/OceanEcoWatch/OceanEcoMapServer), providing all data via an API.

The application is deployed here: [Ocean Eco Watch Map](https://map.oceanecowatch.org/)

## Technologies

-   **React**: Frontend framework
-   **TypeScript**: Programming language
-   **Mapbox**: Mapping library
-   **TanStack Query**: State management library

## Get STarted

In the project directory, you can run:

### `npm install`

Installs all dependencies from the package.lock file.

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

## Deployement

We have set up a build and deployment pipeline on AWS that is automatically triggered on every push to the master branch.

The application is doployed here: [https://map.oceanecowatch.org/](https://map.oceanecowatch.org/)
