import React, { useState, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import mapTexture from './assets/map.png';
import soil from './assets/soil_texture5.jpg';
import daylight from './assets/daylight.png';
import SimpleOverlay from './SimpleOverlay';
import wheat from './assets/wheat/scene.gltf?url';
import soybean from './assets/soybean/scene.gltf?url';
import island from './assets/island/scene.gltf?url';
import croptext from './assets/croptext/result.gltf?url';
import field from './assets/wheat_field_low_poly/scene.gltf?url';
import panel1 from './assets/CropPanel.png';
import panel2 from './assets/CropPanel2.png';
import { fetchWeatherApi } from 'openmeteo';
import protein from './assets/CropProteinA.png';
import calories from './assets/CropCalories.png';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
async function getWeatherBulk(coordsArray) {
  // Create an array to hold all the promises
  const allPromises = [];

  // Flatten the nested array - we need to know which y,x each result belongs to
  for (let y = 0; y < coordsArray.length; y++) {
    for (let x = 0; x < coordsArray[y].length; x++) {
      // Create a promise for each coordinate
      const promise = (async () => {
        try {
          const lat = coordsArray[y][x][0];
          const lon = coordsArray[y][x][1];
          
          const parms = {
            "latitude": lat,
            "longitude": lon,
            "daily": ["weather_code", "uv_index_max"],
            "hourly": ["temperature_2m", "relative_humidity_2m", "weather_code", "cloud_cover", "precipitation", "wind_speed_120m"],
            "timezone": "GMT",
            "apikey": "fTcQWIiIg89maNKW"
          }; 
          
          const url = "https://customer-api.open-meteo.com/v1/forecast";
          const responses = await fetchWeatherApi(url, parms);
          const response = responses[0];

          const firstfivetemp = response.hourly().variables(0).valuesArray().slice(0, 5);
          const firstfivewind120m = response.hourly().variables(5).valuesArray().slice(0, 5);
          const firstfivehumidity = response.hourly().variables(1).valuesArray().slice(0, 5);
          const firstfiveprecipitation = response.hourly().variables(4).valuesArray().slice(0, 5);
          const firstfivecloudcover = response.hourly().variables(3).valuesArray().slice(0, 5);
          
          return {
            y, x,
            temp: firstfivetemp.reduce((sum, current) => sum + current, 0) / firstfivetemp.length,
            humidity: firstfivehumidity.reduce((sum, current) => sum + current, 0) / firstfivehumidity.length,
            wind120m: firstfivewind120m.reduce((sum, current) => sum + current, 0) / firstfivewind120m.length,
            precipitation: firstfiveprecipitation.reduce((sum, current) => sum + current, 0) / firstfiveprecipitation.length,
            cloud: firstfivecloudcover.reduce((sum, current) => sum + current, 0) / firstfivecloudcover.length
          };
        } catch (error) {
          console.error(`Error getting weather for coords [${coordsArray[y][x]}]:`, error);
          return {
            y, x,
            temp: 20, // Default values in case of error
            wind120m: 0,
            humidity: 50,
            precipitation: 0,
            cloud: 25
          };
        }
      })();
      
      allPromises.push(promise);
    }
  }
  
  // Execute all promises in parallel
  const results = await Promise.all(allPromises);
  
  // Initialize result arrays
  const temps = Array(coordsArray.length).fill().map(() => []);
  const humidities = Array(coordsArray.length).fill().map(() => []);
  const precipitations = Array(coordsArray.length).fill().map(() => []);
  const clouds = Array(coordsArray.length).fill().map(() => []);
  const wind120m = Array(coordsArray.length).fill().map(() => []);
  
  // Populate results back into the original structure
  results.forEach(result => {
    if (!temps[result.y]) temps[result.y] = [];
    if (!humidities[result.y]) humidities[result.y] = [];
    if (!precipitations[result.y]) precipitations[result.y] = [];
    if (!clouds[result.y]) clouds[result.y] = [];
    if (!wind120m[result.y]) wind120m[result.y] = [];
    
    temps[result.y][result.x] = result.temp;
    humidities[result.y][result.x] = result.humidity;
    precipitations[result.y][result.x] = result.precipitation;
    clouds[result.y][result.x] = result.cloud;
    wind120m[result.y][result.x] = result.wind120m;

  });
  
  return { 
    temps, 
    humidities, 
    precipitations, 
    clouds,
    wind120m
  };
}

// Keep your updated getWeather function for single coordinate lookups
async function getWeather(lat, lon) {
  const parms = {
    "latitude": lat,
    "longitude": lon,
    "daily": ["weather_code", "uv_index_max"],
    "hourly": ["temperature_2m", "relative_humidity_2m", "weather_code", "cloud_cover", "precipitation"],
    "timezone": "GMT",
    "apikey": "fTcQWIiIg89maNKW"
  }; 
  const url= "https://customer-api.open-meteo.com/v1/forecast";
  const responses = await fetchWeatherApi(url, parms);
  const response = responses[0];

  const firstfivetemp = response.hourly().variables(0).valuesArray().slice(0, 5);
  const firstfivehumidity = response.hourly().variables(1).valuesArray().slice(0, 5);
  const firstfiveprecipitation = response.hourly().variables(4).valuesArray().slice(0, 5);
  const firstfivecloudcover = response.hourly().variables(3).valuesArray().slice(0, 5);
  return {
    temp: firstfivetemp.reduce((sum, current) => sum + current, 0) / firstfivetemp.length,
    humidity: firstfivehumidity.reduce((sum, current) => sum + current, 0) / firstfivehumidity.length,
    precipitation: firstfiveprecipitation.reduce((sum, current) => sum + current, 0) / firstfiveprecipitation.length,
    cloud: firstfivecloudcover.reduce((sum, current) => sum + current, 0) / firstfivecloudcover.length
  };
}
async function getCropYields(coords, nutrient) {
  // Create an array to hold all the promises
  const allPromises = [];

  // Flatten the nested array - we need to know which y,x each result belongs to
  for (let y = 0; y < coords.length; y++) {
    for (let x = 0; x < coords[y].length; x++) {
      // Create a promise for each coordinate
      const promise = (async () => {
        try {
          const lat = coords[y][x][0];
          const lon = coords[y][x][1];
          
          const weatherData = await getWeather(lat, lon);
          
          const modelInput = {
            "humidity": weatherData.humidity,
            "temperature": weatherData.temp,
            "nutrient": nutrient
          };
          
          const response = await fetch('https://6903-43-245-155-23.ngrok-free.app/predict_yield', {
            method: 'POST',
            body: JSON.stringify(modelInput),
            headers: {
              'Content-Type': 'application/json'
            }
          });
          
          const prediction = await response.json();
          
          return {
            y, x,
            cropName: prediction.yields[0][0],
            yieldValue: prediction.yields[0][1]
          };
        } catch (error) {
          console.error(`Error processing coords [${coords[y][x]}]:`, error);
          return {
            y, x,
            cropName: "Error",
            yieldValue: 0
          };
        }
      })();
      
      allPromises.push(promise);
    }
  }
  
  // Execute all promises in parallel
  const results = await Promise.all(allPromises);
  
  // Initialize result arrays
  const crops = Array(coords.length).fill().map(() => []);
  const yields = Array(coords.length).fill().map(() => []);
  
  // Populate results back into the original structure
  results.forEach(result => {
    if (!crops[result.y]) crops[result.y] = [];
    if (!yields[result.y]) yields[result.y] = [];
    
    crops[result.y][result.x] = result.cropName;
    yields[result.y][result.x] = result.yieldValue;
  });
  
  return { crops, yields };
}
const App = () => {
  const Coordinates = [
    [[3, 10], [6, 8], [4, 4], [9, 10], [2, 0], [7, 6], [5, 3], [8, 1], [6, 6], [3, 2], [9, 1], [1, 9], [0, 10], [10, 5], [7, 0], [4, 7]],
    [[1, 8], [2, 10], [5, 5], [0, 0], [6, 2], [8, 4], [3, 3], [7, 9], [10, 10], [9, 6], [1, 1], [5, 2], [6, 9], [4, 0], [0, 3], [2, 5]],
    [[10, 3], [3, 6], [4, 1], [2, 7], [0, 9], [1, 5], [9, 8], [8, 2], [6, 0], [5, 7], [7, 1], [2, 4], [3, 9], [10, 0], [0, 2], [1, 6]],
    [[6, 7], [7, 4], [8, 5], [1, 2], [5, 10], [2, 6], [3, 0], [0, 8], [9, 9], [4, 10], [10, 1], [6, 1], [8, 6], [3, 7], [2, 3], [7, 8]],
    [[5, 9], [0, 4], [10, 9], [9, 0], [4, 8], [3, 5], [6, 5], [2, 1], [7, 3], [1, 0], [8, 8], [0, 5], [5, 4], [10, 6], [6, 3], [9, 5]],
    [[2, 2], [1, 3], [4, 6], [3, 4], [8, 3], [7, 10], [5, 6], [0, 6], [10, 2], [2, 9], [6, 4], [4, 5], [1, 10], [9, 7], [7, 6], [8, 9]],
    [[3, 1], [5, 1], [7, 7], [6, 10], [1, 4], [4, 3], [0, 7], [2, 8], [9, 3], [10, 8], [8, 7], [3, 8], [5, 8], [6, 1], [7, 5], [0, 1]],
    [[10, 10], [2, 0], [6, 7], [1, 7], [9, 2], [8, 10], [3, 2], [4, 2], [7, 2], [0, 9], [2, 6], [5, 0], [6, 0], [10, 7], [8, 0], [1, 1]],
    [[0, 0], [7, 9], [4, 10], [5, 3], [6, 9], [2, 3], [1, 9], [3, 9], [10, 4], [9, 1], [8, 1], [4, 9], [0, 8], [7, 10], [5, 5], [3, 3]],
    [[1, 6], [6, 6], [9, 10], [2, 10], [3, 10], [10, 5], [7, 4], [0, 2], [8, 4], [5, 2], [4, 4], [2, 2], [6, 2], [3, 1], [10, 6], [9, 4]],
    [[8, 5], [1, 5], [0, 3], [2, 7], [7, 7], [6, 8], [3, 0], [10, 3], [9, 8], [5, 4], [4, 6], [8, 2], [1, 4], [0, 1], [2, 9], [6, 10]],
    [[5, 6], [7, 6], [3, 5], [9, 5], [2, 1], [1, 0], [10, 2], [8, 6], [4, 7], [0, 5], [6, 1], [3, 7], [9, 3], [7, 2], [5, 8], [1, 2]],
    [[2, 4], [0, 6], [6, 3], [10, 8], [8, 7], [3, 6], [7, 1], [4, 1], [5, 9], [1, 7], [9, 0], [2, 5], [0, 7], [6, 9], [8, 9], [10, 9]],
    [[9, 2], [4, 5], [5, 1], [3, 8], [2, 8], [6, 5], [7, 5], [1, 6], [0, 10], [10, 0], [8, 8], [5, 7], [4, 8], [7, 0], [3, 3], [9, 6]],
    [[6, 4], [1, 3], [2, 6], [0, 4], [5, 5], [3, 4], [10, 10], [9, 9], [7, 8], [6, 0], [8, 0], [2, 0], [1, 1], [4, 2], [0, 0], [10, 1]],
    [[3, 2], [5, 2], [8, 3], [9, 7], [6, 6], [0, 9], [4, 3], [1, 8], [10, 7], [2, 10], [7, 3], [3, 9], [9, 1], [8, 4], [5, 0], [6, 8]]
  ];
  
  const [weatherData, setWeatherData] = useState({
    temp: "Loading...", // Just using first coordinate for display in UI
    humidity: "Loading...",
    precipitation: "Loading...",
    cloud: "Loading...",
    wind120m: "Loading..."
  });
  const [yieldData, setYieldData] = useState({
    crops: [],
    yields: []
  });
  
  // State to manage loading
  const [isLoading, setIsLoading] = useState(true);
  const [isYieldLoading, setIsYieldLoading] = useState(true);
  useEffect(() => {
    // Create the scene  
    

    const fetchYieldData = async () => {
      try {
        // Example coordinates grid - replace with actual coordinates
        const coords = [Coordinates.flat()];
        const nutrientLevel = "Protein"; // Example nutrient level
        
        const data = await getCropYields(coords, nutrientLevel);
        console.log("Original data:", JSON.stringify(data));
        
        // Get the total number of crop types we have (assuming equal distribution)
        const totalCrops = data.crops[0].length;
        const coordsCount = coords.length;
       
        
        // Restructure the crops array
      // Restructure the crops array
      // Restructure the crops array - first get chunks of 3
       // Get individual crops without grouping by 3
        const cropItems = data.crops[0]; // Get the flat array of crops

        // Group every 16 individual crops into a higher-level array
        const transformedCrops = [];
        for (let i = 0; i < cropItems.length; i += 16) {
          transformedCrops.push(cropItems.slice(i, i + 16));
        }

        // Get individual yields without grouping by 3
        const yieldItems = data.yields[0]; // Get the flat array of yields

        // Group every 16 individual yields into a higher-level array
        const transformedYields = [];
        for (let i = 0; i < yieldItems.length; i += 16) {
          transformedYields.push(yieldItems.slice(i, i + 16));
        }

        console.log("Crop data:", transformedCrops);
        console.log("Yield data:", transformedYields);
        if (transformedCrops.length > 0) {
          // Replace the default values in bestPlantGrid with the transformed crops
          for (let i = 0; i < transformedCrops.length && i < bestPlantGrid.length; i++) {
            for (let j = 0; j < transformedCrops[i].length && j < bestPlantGrid[i].length; j++) {
              bestPlantGrid[i][j] = transformedCrops[i][j];
            }
          }
          console.log("Updated bestPlantGrid with transformed crops data");
        }
        if (transformedYields.length > 0) {
          // Update yieldGrid with the new data
          for (let i = 0; i < transformedYields.length && i < intensityGrid2.length; i++) {
            for (let j = 0; j < transformedYields[i].length && j < intensityGrid2[i].length; j++) {
              intensityGrid2[j][i] = transformedYields[i][j];
            }
          }
          updateColorGrid(intensityGrid2);
          console.log("Updated yieldGrid with transformed yields data");
        }
        
        // Not setting yield data as requested
      } catch (error) {
        console.error("Error fetching yield data:", error);
      } finally {
        setIsYieldLoading(false);
      }
    };
    // In the fetchWeatherData function, update to populate grid data properly:

const fetchWeatherData = async () => {
  try {
    // Use the same coordinates grid as the yield data
    const coords = [Coordinates.flat()];
    
    // Get bulk weather data for all coordinates
    const data = await getWeatherBulk(coords);
    console.log("Original weather data:", JSON.stringify(data));
    
    // Get individual temperature values without grouping
    const tempItems = data.temps[0]; // Get the flat array of temperatures

    // Group every 16 individual temperature values into a higher-level array
    const transformedTemps = [];
    for (let i = 0; i < tempItems.length; i += 16) {
      transformedTemps.push(tempItems.slice(i, i + 16));
    }

    // Get individual humidity values
    const humidityItems = data.humidities[0]; // Get the flat array of humidity values

    // Group every 16 individual humidity values into a higher-level array
    const transformedHumidities = [];
    for (let i = 0; i < humidityItems.length; i += 16) {
      transformedHumidities.push(humidityItems.slice(i, i + 16));
    }

    // Do the same for precipitation data
    const precipitationItems = data.precipitations[0];
    const transformedPrecipitations = [];
    for (let i = 0; i < precipitationItems.length; i += 16) {
      transformedPrecipitations.push(precipitationItems.slice(i, i + 16));
    }

    // And for cloud cover data
    const cloudItems = data.clouds[0];
    const transformedClouds = [];
    for (let i = 0; i < cloudItems.length; i += 16) {
      transformedClouds.push(cloudItems.slice(i, i + 16));
    }

    // Process wind data
    const windItems = data.wind120m[0];
    const transformedWinds = [];
    for (let i = 0; i < windItems.length; i += 16) {
      transformedWinds.push(windItems.slice(i, i + 16));
    }

    console.log("Temperature data:", transformedTemps);
    console.log("Humidity data:", transformedHumidities);
    console.log("Precipitation data:", transformedPrecipitations);
    console.log("Cloud cover data:", transformedClouds);
    console.log("Wind data:", transformedWinds);

    // Update your state with the weather data
      // Calculate average values for each weather parameter
    let tempSum = 0, humiditySum = 0, precipSum = 0, cloudSum = 0, windSum = 0;
    let tempCount = 0, humidityCount = 0, precipCount = 0, cloudCount = 0, windCount = 0;

    // Sum up all values
    for (let z = 0; z < transformedTemps.length; z++) {
      for (let x = 0; x < transformedTemps[z].length; x++) {
        if (typeof transformedTemps[z][x] === 'number') {
          tempSum += transformedTemps[z][x];
          tempCount++;
        }
        if (typeof transformedHumidities[z][x] === 'number') {
          humiditySum += transformedHumidities[z][x];
          humidityCount++;
        }
        if (typeof transformedPrecipitations[z][x] === 'number') {
          precipSum += transformedPrecipitations[z][x];
          precipCount++;
        }
        if (typeof transformedClouds[z][x] === 'number') {
          cloudSum += transformedClouds[z][x];
          cloudCount++;
        }
        if (typeof transformedWinds[z][x] === 'number') {
          windSum += transformedWinds[z][x];
          windCount++;
        }
      }
    }

    // Calculate averages
    const avgTemp = tempCount > 0 ? tempSum / tempCount : 0;
    const avgHumidity = humidityCount > 0 ? humiditySum / humidityCount : 0;
    const avgPrecip = precipCount > 0 ? precipSum / precipCount : 0;
    const avgCloud = cloudCount > 0 ? cloudSum / cloudCount : 0;
    const avgWind = windCount > 0 ? windSum / windCount : 0;

    console.log(`Average temperature: ${avgTemp.toFixed(1)}°C`);
    console.log(`Average humidity: ${avgHumidity.toFixed(1)}%`);
    console.log(`Average precipitation: ${avgPrecip.toFixed(1)}mm`);
    console.log(`Average cloud cover: ${avgCloud.toFixed(1)}%`);
    console.log(`Average wind speed: ${avgWind.toFixed(1)}m/s`);

    // Update your state with the average weather data instead of first coordinate
    setWeatherData({
      temp: avgTemp,
      humidity: avgHumidity,
      precipitation: avgPrecip,
      cloud: avgCloud,
      wind120m: avgWind,
    });

    // Update the temperature grid with the transformed data
    if (transformedTemps.length > 0) {
      for (let i = 0; i < transformedTemps.length && i < temperatureGrid.length; i++) {
        for (let j = 0; j < transformedTemps[i].length && j < temperatureGrid[i].length; j++) {
          temperatureGrid[i][j] = transformedTemps[i][j];
        }
      }
      console.log("Updated temperatureGrid with transformed temperature data");
    }

    // Update the humidity grid with the transformed data
    if (transformedHumidities.length > 0) {
      for (let i = 0; i < transformedHumidities.length && i < humidityGrid.length; i++) {
        for (let j = 0; j < transformedHumidities[i].length && j < humidityGrid[i].length; j++) {
          humidityGrid[i][j] = transformedHumidities[i][j];
        }
      }
      console.log("Updated humidityGrid with transformed humidity data");
    }

    // Update the precipitation grid with the transformed data
    if (transformedPrecipitations.length > 0) {
      for (let i = 0; i < transformedPrecipitations.length && i < precipitationGrid.length; i++) {
        for (let j = 0; j < transformedPrecipitations[i].length && j < precipitationGrid[i].length; j++) {
          precipitationGrid[i][j] = transformedPrecipitations[i][j];
        }
      }
      console.log("Updated precipitationGrid with transformed precipitation data");
    }

    // Update the cloud grid with the transformed data
    if (transformedClouds.length > 0) {
      for (let i = 0; i < transformedClouds.length && i < cloudGrid2.length; i++) {
        for (let j = 0; j < transformedClouds[i].length && j < cloudGrid2[i].length; j++) {
          cloudGrid2[i][j] = transformedClouds[i][j];
        }
      }
      console.log("Updated cloudGrid2 with transformed cloud data");
    }

    // Update the wind grid with the transformed data
    if (transformedWinds.length > 0) {
      for (let i = 0; i < transformedWinds.length && i < windGrid2.length; i++) {
        for (let j = 0; j < transformedWinds[i].length && j < windGrid2[i].length; j++) {
          windGrid2[i][j] = transformedWinds[i][j];
        }
      }
      console.log("Updated windGrid2 with transformed wind data");
    }

    if (transformedClouds.length > 0 && transformedPrecipitations.length > 0) {
      // Call the function to update clouds and rain after data is loaded
      updateCloudAndRainEffects();
    }

  } catch (error) {
    console.error("Error fetching weather data:", error);
  } finally {
    setIsLoading(false);
  }
};
    
    // Function to transform the data
   

    fetchWeatherData();
    fetchYieldData();
    const scene = new THREE.Scene();
    const gltfloader = new GLTFLoader();
    let wheatModel;
    async function fetchNewYieldData(nutrient) {
      console.log(`Fetching new yield data for nutrient: ${nutrient}`);
      
      // Show loading indicator on the grid
      for (let x = 0; x < 16; x++) {
        for (let z = 0; z < 16; z++) {
          bestPlantGrid[x][z] = "Loading...";
          intensityGrid2[x][z] = 10; // Default value while loading
        }
      }
      
      // Update the color grid with default values to show loading state
      updateColorGrid(intensityGrid2);
      
      try {
        // Use the same coordinates as the initial load
        const coords = [Coordinates.flat()];
        
        // Call the API with the new nutrient value
        const data = await getCropYields(coords, nutrient);
        console.log(`Received new data for ${nutrient}:`, JSON.stringify(data));
        
        // Get the crop items without grouping
        const cropItems = data.crops[0]; 
    
        // Group every 16 individual crops into a higher-level array
        const transformedCrops = [];
        for (let i = 0; i < cropItems.length; i += 16) {
          transformedCrops.push(cropItems.slice(i, i + 16));
        }
    
        // Get individual yields
        const yieldItems = data.yields[0]; 
    
        // Group every 16 individual yields into a higher-level array
        const transformedYields = [];
        for (let i = 0; i < yieldItems.length; i += 16) {
          transformedYields.push(yieldItems.slice(i, i + 16));
        }
    
        console.log("New crop data:", transformedCrops);
        console.log("New yield data:", transformedYields);
        
        // Update the bestPlantGrid with the new crop data
        if (transformedCrops.length > 0) {
          for (let i = 0; i < transformedCrops.length && i < bestPlantGrid.length; i++) {
            for (let j = 0; j < transformedCrops[i].length && j < bestPlantGrid[i].length; j++) {
              bestPlantGrid[i][j] = transformedCrops[i][j];
            }
          }
          console.log(`Updated bestPlantGrid with ${nutrient} crop data`);
        }
        
        // Update the intensityGrid2 with the new yield data
        if (transformedYields.length > 0) {
          for (let i = 0; i < transformedYields.length && i < intensityGrid2.length; i++) {
            for (let j = 0; j < transformedYields[i].length && j < intensityGrid2[i].length; j++) {
              intensityGrid2[i][j] = transformedYields[i][j];
            }
          }
          
          // Update the color grid with the new data
          updateColorGrid(intensityGrid2);
          console.log(`Updated intensityGrid2 with ${nutrient} yield data`);
        }
        
      } catch (error) {
        console.error(`Error fetching ${nutrient} yield data:`, error);
        
        // Restore default values in case of error
        for (let x = 0; x < 16; x++) {
          for (let z = 0; z < 16; z++) {
            bestPlantGrid[x][z] = "Error loading data";
          }
        }
      }
    }

    const bestPlantGrid = [
      ["Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading..."],
      ["Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading..."],
      ["Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading..."],
      ["Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading..."],
      ["Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading..."],
      ["Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading..."],
      ["Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading..."],
      ["Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading..."],
      ["Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading..."],
      ["Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading..."],
      ["Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading..."],
      ["Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading..."],
      ["Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading..."],
      ["Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading..."],
      ["Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading..."],
      ["Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading..."]
    ];
    const temperatureGrid = Array(16).fill().map(() => Array(16).fill("Loading..."));
    const humidityGrid = Array(16).fill().map(() => Array(16).fill("Loading..."));
    const precipitationGrid = Array(16).fill().map(() => Array(16).fill("Loading..."));
    const cloudGrid2 = Array(16).fill().map(() => Array(16).fill("Loading..."));
    const windGrid2 = Array(16).fill().map(() => Array(16).fill("Loading..."));

    const intensityGrid2 = [
      [10.1, 10.2, 10.1, 10.3, 10.2, 10.1, 10.4, 10.2, 10.3, 10.1, 10.2, 10.3, 10.4, 10.2, 10.3, 10.1],
      [10.2, 10.3, 10.4, 10.2, 10.3, 10.4, 10.2, 10.3, 10.4, 10.2, 10.3, 10.4, 10.2, 10.3, 10.4, 10.2],
      [10.3, 10.4, 10.5, 10.3, 10.4, 10.5, 10.3, 10.4, 10.5, 10.3, 10.4, 10.5, 10.3, 10.4, 10.5, 10.3],
      [10.4, 10.5, 10.6, 10.4, 10.5, 10.6, 10.4, 10.5, 10.6, 10.4, 10.5, 10.6, 10.4, 10.5, 10.6, 10.4],
      [10.5, 10.6, 10.7, 10.5, 10.6, 10.7, 10.5, 10.6, 10.7, 10.5, 10.6, 10.7, 10.5, 10.6, 10.7, 10.5],
      [10.6, 10.7, 10.8, 10.6, 10.7, 10.8, 10.6, 11.0, 10.8, 10.6, 10.7, 10.8, 10.6, 10.7, 10.8, 10.6],
      [10.7, 10.8, 10.9, 10.7, 10.8, 10.9, 10.7, 10.8, 10.9, 10.7, 10.8, 10.9, 10.7, 10.8, 10.9, 10.7],
      [10.8, 10.9, 11.0, 10.8, 10.9, 11.0, 10.8, 10.9, 11.0, 10.8, 10.9, 11.0, 10.8, 10.9, 11.0, 10.8],
      [10.9, 11.0, 11.1, 10.9, 11.0, 11.1, 10.9, 11.0, 11.1, 10.9, 11.0, 11.1, 10.9, 11.0, 11.1, 10.9],
      [11.0, 11.1, 11.2, 11.0, 11.1, 11.2, 11.0, 11.1, 11.2, 11.0, 11.1, 11.2, 11.0, 11.1, 11.2, 11.0],
      [11.1, 11.2, 11.3, 11.1, 11.2, 11.3, 11.1, 11.2, 11.3, 11.1, 11.2, 11.3, 11.1, 11.2, 11.3, 11.1],
      [11.2, 11.3, 11.4, 11.2, 11.3, 11.4, 11.2, 11.3, 11.4, 11.2, 11.3, 11.4, 11.2, 11.3, 11.4, 11.2],
      [11.3, 11.4, 11.5, 11.3, 11.4, 11.5, 11.3, 11.4, 11.5, 11.3, 11.4, 11.5, 11.3, 11.4, 11.5, 11.3],
      [11.4, 11.5, 11.6, 11.4, 11.5, 11.6, 11.4, 11.5, 11.6, 11.4, 11.5, 11.6, 11.4, 11.5, 11.6, 11.4],
      [11.5, 11.6, 11.7, 11.5, 11.6, 11.7, 11.5, 11.6, 11.7, 11.5, 11.6, 11.7, 11.5, 11.6, 12.2, 11.5],
      [11.6, 11.7, 11.8, 11.6, 11.7, 11.8, 11.6, 11.7, 11.8, 11.6, 11.7, 11.8, 11.6, 11.7, 11.8, 11.6],
    ];
    const intensityGrid = [
      ["Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading..."],
      ["Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading..."],
      ["Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading..."],
      ["Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading..."],
      ["Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading..."],
      ["Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading..."],
      ["Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading..."],
      ["Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading..."],
      ["Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading..."],
      ["Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading..."],
      ["Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading..."],
      ["Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading..."],
      ["Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading..."],
      ["Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading..."],
      ["Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading..."],
      ["Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading...", "Loading..."]
    ];
    
    
    

    


    let croptextModel;
    let islandModel;
    let fieldModel;
    let textSprite = null;
    let textCanvas = null;
    let textContext = null;
    let textTexture = null;
    let textMaterial = null;
    let isFieldHovered = false;
    let originalMaterials = new Map();
    gltfloader.load(
      wheat, 
      (gltfScene) => {

        wheatModel = gltfScene.scene;
        wheatModel.position.set(1000, 1000, 1000);
        scene.add(wheatModel);
        
       
      },
      (progress) => {
        // Optional: Log loading progress
        console.log("Loading progress:", (progress.loaded / progress.total * 100).toFixed(2) + "%");
      },
      (error) => {
        // This will catch loading errors
        console.error("Error loading wheat model:", error);
      }
    );
    gltfloader.load(
      island, 
      (gltfScene) => {

        islandModel = gltfScene.scene;
        islandModel.scale.set(0.4, 0.4, 0.4)
        islandModel.position.set(0, 0, 15);
        scene.add(islandModel);
        
       
      },
      (progress) => {
        // Optional: Log loading progress
        console.log("Loading progress:", (progress.loaded / progress.total * 100).toFixed(2) + "%");
      },
      (error) => {
        // This will catch loading errors
        console.error("Error loading island model:", error);
      }
    );
    gltfloader.load(
      croptext, 
      (gltfScene) => {

        croptextModel = gltfScene.scene;
        croptextModel.scale.set(2, 2, 2)
        croptextModel.position.set(0, 8, 11);

        // Rotate 180 degrees around Y axis (in radians)
        croptextModel.rotation.y = Math.PI; // 180 degrees

        // Make the model completely white by traversing all meshes
        croptextModel.traverse((child) => {
          if (child.isMesh) {
            // Create a new white material
            child.material = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
            
            // If you want to preserve the original material type but make it white:
            // child.material.color.set(0xFFFFFF);
          }
        });
        scene.add(croptextModel);
        
       
      },
      (progress) => {
        // Optional: Log loading progress
        console.log("Loading progress:", (progress.loaded / progress.total * 100).toFixed(2) + "%");
      },
      (error) => {
        // This will catch loading errors
        console.error("Error loading island model:", error);
      }
    );
    gltfloader.load(
      field, 
      (gltfScene) => {

        fieldModel = gltfScene.scene;
        fieldModel.scale.set(0.004, 0.004, 0.004)
        fieldModel.position.set(1, 3.8, 13);
        fieldModel.traverse((child) => {
          if (child.isMesh) {
            // Mark this model as interactive
            child.userData.isField = true;
            
            // Store original materials to restore later
            originalMaterials.set(child.uuid, child.material.clone());
          }
        });
        scene.add(fieldModel);
        
       
      },
      (progress) => {
        // Optional: Log loading progress
        console.log("Loading progress:", (progress.loaded / progress.total * 100).toFixed(2) + "%");
      },
      (error) => {
        // This will catch loading errors
        console.error("Error loading island model:", error);
      }
    );
    function setBackgroundImage(imagePath) {
      // Create a texture loader
      const backgroundLoader = new THREE.TextureLoader();
      
      // Load the texture from your assets folder
      backgroundLoader.load(
        // Path to your image in the assets folder
        imagePath, 
        
        // onLoad callback - when the image has loaded successfully
        function(texture) {
          // Set the texture as the scene background
          scene.background = texture;
        },
        
        // onProgress callback - optional
        undefined,
        
        // onError callback - if the load fails
        function(err) {
          console.error('Error loading background texture:', err);
        }
      );
    }
    setBackgroundImage(daylight);


    // Create the camera
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(5, 13, -25);

    // Create the renderer
    const renderer = new THREE.WebGLRenderer();
    createTextSprite();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Create OrbitControls
    const orbit = new OrbitControls(camera, renderer.domElement);
    orbit.update(); // Required after setting up OrbitControls
   

     /*****************************************
     * SOIL LAYER ADDITION - START
     *****************************************/
    // Create a soil/terrain box beneath the grid
    const soilGeometry = new THREE.BoxGeometry(16, 2, 16);
    
    // Create a soil texture
    const textureLoader1 = new THREE.TextureLoader();
    const soilTexture = textureLoader1.load(soil);
    
    // Repeat the texture to make it look more detailed
    soilTexture.wrapS = THREE.RepeatWrapping;
    soilTexture.wrapT = THREE.RepeatWrapping;
    soilTexture.repeat.set(4, 4);
    
    const soilMaterial = new THREE.MeshPhongMaterial({
      map: soilTexture,
      color: 0x755c48
    });
    
    const soilMesh = new THREE.Mesh(soilGeometry, soilMaterial);
    // Position the soil box beneath the grid
    soilMesh.position.y = -1.03; // Just 1 unit below the grid
    scene.add(soilMesh);
    soilMesh.castShadow = false;
    
    // Add ambient light so we can see the soil texture
    const ambientLight = new THREE.AmbientLight(0xffffff, 2);
    scene.add(ambientLight);
    
    // Add directional light to create some subtle shading
    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight2.position.set(5, 20, 5);
    scene.add(directionalLight2);

    const directionalLight3 = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight3.position.set(-5, 20, -5);
    scene.add(directionalLight3);
    /*****************************************
     * SOIL LAYER ADDITION - END
     *****************************************/

    // Create a plane mesh for raycasting (hidden but for calculation)
    const planeMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(16, 16),
      new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, visible: false })
    );
    planeMesh.rotateX(-Math.PI / 2);
    scene.add(planeMesh);

    const textureLoader = new THREE.TextureLoader();
    const gridTexture = textureLoader.load(mapTexture);

    

    const gridMaterial = new THREE.MeshPhongMaterial({
      map: gridTexture, // Apply the loaded texture
      side: THREE.DoubleSide,
      transparent: true, // If you want transparency on the grid
    });
    
    const gridGeometry = new THREE.PlaneGeometry(16, 16);
    const gridMesh = new THREE.Mesh(gridGeometry, gridMaterial);
    gridMesh.rotateX(-Math.PI / 2); // Rotate the grid to match the plane
    gridMesh.position.y = -0.01;
    scene.add(gridMesh);
    // Create a grid helper
    const grid = new THREE.GridHelper(16, 16);
    scene.add(grid);
     /*****************************************
     * WIND EFFECT IMPLEMENTATION - START 
     *****************************************/
    // Define a 16x16 array for wind positions
    const windGrid = [
      [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false], // 0
      [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false], // 1
      [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false], // 2
      [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false], // 3
      [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false], // 4
      [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false], // 5
      [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false], // 6
      [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false], // 7
      [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false], // 8
      [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false], // 9
      [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false], // 10
      [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false], // 11
      [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false], // 12
      [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false], // 13
      [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false], // 14
      [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false], // 15
    ];
      
      
    
    // Wind particle system
    const windParticles = [];
    
    // Create wind indicators for each wind position
    for (let x = 0; x < 16; x++) {
      for (let z = 0; z < 16; z++) {
        if (windGrid[x][z]) {
          // Create wind particles for this grid cell
          const particleCount = 5 + Math.floor(Math.random() * 5); // 5-9 particles per cell
          
          for (let i = 0; i < particleCount; i++) {
            // Create a small line mesh to represent wind
            const windGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.6, 4);
            const windMaterial = new THREE.MeshBasicMaterial({
              color: 0xFFFFFF,
              transparent: true,
              opacity: 0.4 + Math.random() * 0.3,
              emissive: 0xCCCCCC,
              emissiveIntensity: 0.3
            });
            
            
            const windMesh = new THREE.Mesh(windGeometry, windMaterial);
            windMesh.renderOrder = 10;
            windMesh.castShadow = false;
            windMesh.receiveShadow = false;
            // Position slightly above the grid with random offset within the cell
            windMesh.position.set(
              x - 7.5 + (Math.random() * 0.8 - 0.4), // Center with slight randomness
              0.2 + Math.random() * 0.2,             // Slightly above the grid
              z - 7.5 + (Math.random() * 0.8 - 0.4)  // Center with slight randomness
            );
            
            // Rotate to be horizontal (like wind flowing)
            windMesh.rotation.z = Math.PI / 2;
            
            // Wind direction (slightly randomized but generally west to east)
            windMesh.rotation.y = Math.PI / 4 + (Math.random() * Math.PI / 8);
            
            // Add to scenes
            scene.add(windMesh);
            
            // Store for animation
            windParticles.push({
              mesh: windMesh,
              speed: 0.001, // Random speed
              cell: { x, z },
              phase: Math.random() * Math.PI * 2, // Random starting phase
              originalY: windMesh.position.y
            });
          }
        }
      }
    }
    
    // Wind animation function
    function animateWind(time) {
      windParticles.forEach((particle) => {
        // Make wind particles slightly pulse and move in the wind direction
        const windEffect = Math.sin(time / 500 + particle.phase) * 0.1;
        
        // Subtle vertical bobbing
        particle.mesh.position.y = particle.originalY + Math.sin(time / 800 + particle.phase) * 0.05;
        
        // Wind pulsing effect - stretching and contracting
        particle.mesh.scale.y = 1 + windEffect * 0.3;
        
        // Subtle opacity pulsing
        particle.mesh.material.opacity = 0.4 + 0.2 * Math.sin(time / 600 + particle.phase);
        
        // Calculate direction vector based on rotation
        const direction = new THREE.Vector3(1, 0, 0);
        direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), particle.mesh.rotation.y);
        direction.multiplyScalar(particle.speed);
        
        // Move in the direction
        particle.mesh.position.x += direction.x;
        particle.mesh.position.z += direction.z;
        
        // Check if particle has moved too far from its cell, wrap it around if so
        const cellCenterX = particle.cell.x - 7.5;
        const cellCenterZ = particle.cell.z - 7.5;
        
        // If it's moved more than 1 unit away, reset position
        if (Math.abs(particle.mesh.position.x - cellCenterX) > 0.8 ||
            Math.abs(particle.mesh.position.z - cellCenterZ) > 0.8) {
          // Reset position with some randomness
          particle.mesh.position.x = cellCenterX + (Math.random() * 0.6 - 0.3);
          particle.mesh.position.z = cellCenterZ + (Math.random() * 0.6 - 0.3);
        }
      });
    }
    /*****************************************
     * WIND EFFECT IMPLEMENTATION - END
     *****************************************/
   
   /*****************************************
     * CLOUD LAYER IMPLEMENTATION - START 
     *****************************************/
    // Define a 16x16 array for cloud positions (true = cloud, false = no cloud)
    const cloudGrid = [
      [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false], // 0
      [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false], // 1
      [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false], // 2
      [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false], // 3
      [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false], // 4
      [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false], // 5
      [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false], // 6
      [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false], // 7
      [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false], // 8
      [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false], // 9
      [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false], // 10
      [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false], // 11
      [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false], // 12
      [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false], // 13
      [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false], // 14
      [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false], // 15
    ];
    
      
    
    
    // Create cloud material (semi-transparent white)
    const cloudMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.9,
      // Make it slightly emissive to ensure visibility
      emissive: 0x333333
    });
    const cloudContainer = new THREE.Group();
    scene.add(cloudContainer);
    // Create a box for each cloud
    const cloudMeshes = [];
    
    for (let x = 0; x < 16; x++) {
      for (let z = 0; z < 16; z++) {
        if (cloudGrid[x][z]) {
          // Create a cloud box for this position
          const cloudGeometry = new THREE.BoxGeometry(1, 0.3, 1);
          const cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);
          cloudMesh.castShadow = true;
          cloudMesh.receiveShadow = false;
          // Position the cloud above the grid
          cloudMesh.position.set(
            x - 7.5, // Center the clouds over the grid
            5,       // Height above the grid
            z - 7.5  // Center the clouds over the grid
          );
          
          // Add some randomness to make clouds look more natural
          cloudMesh.scale.x = 0.8 + Math.random() * 0.4;
          cloudMesh.scale.z = 0.8 + Math.random() * 0.4;
          
          // Add the cloud to the scene
          scene.add(cloudMesh);
          cloudMeshes.push(cloudMesh);
        }
      }
    }

    
    // Function to animate clouds with gentle floating motion
    function animateClouds(time) {
      cloudMeshes.forEach((cloud, index) => {
        // Make each cloud float slightly up and down with a unique pattern
        cloud.position.y = 5 + 0.2 * Math.sin(time / 2000 + index * 0.2);
        
        // Optional: slight rotation
        cloud.rotation.y = time / 5000 + index * 0.1;
      });
    }
    /*****************************************
     * CLOUD LAYER IMPLEMENTATION - END
     *****************************************/
    /*****************************************
 * RAINFALL IMPLEMENTATION - START
 *****************************************/
// Create an array to store all rain drops
const raindrops = [];

// Define a 16x16 array to determine which cloud tiles have rainfall
// true = raining, false = not raining
const rainfallGrid = [
  [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false], // 0
  [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false], // 1
  [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false], // 2
  [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false], // 3
  [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false], // 4
  [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false], // 5
  [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false], // 6
  [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false], // 7
  [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false], // 8
  [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false], // 9
  [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false], // 10
  [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false], // 11
  [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false], // 12
  [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false], // 13
  [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false], // 14
  [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false], // 15
];

// Create a rain material (semi-transparent blue)
const rainMaterial = new THREE.MeshBasicMaterial({
  color: 0x9db3ff,
  transparent: true,
  opacity: 0.6
});

// Create a raindrop geometry (thin elongated box)
const rainGeometry = new THREE.BoxGeometry(0.05, 0.3, 0.05);

// Create rain container
const rainContainer = new THREE.Group();
scene.add(rainContainer);

// Configure rain settings
const rainConfig = {
  maxRaindrops: 500,      // Maximum number of raindrops
  rainSpeed: 0.01,         // Base speed of raindrops
  rainVariance: 0.05,     // Speed variance
  spawnRate: 5,           // How many raindrops to spawn each frame
  minHeight: 0,           // Minimum height (ground level)
  maxHeight: 5            // Maximum height (cloud level)
};

// Function to create a new raindrop
function createRaindrop() {
  // Find a random position where there's rainfall according to the rainfallGrid
  let validPositions = [];
  
  for (let x = 0; x < 16; x++) {
    for (let z = 0; z < 16; z++) {
      // Check if this position has both a cloud and is designated as a rainfall position
      if (cloudGrid[x][z] && rainfallGrid[x][z]) {
        validPositions.push({x, z});
      }
    }
  }
  
  // If no valid positions, return
  if (validPositions.length === 0) return null;
  
  // Select a random position
  const randomPos = validPositions[Math.floor(Math.random() * validPositions.length)];
  
  // Create a raindrop mesh
  const raindrop = new THREE.Mesh(rainGeometry, rainMaterial);
  
  // Position the raindrop below the cloud with some randomness
  raindrop.position.set(
    randomPos.x - 7.5 + (Math.random() * 0.8 - 0.4), // Add some random offset
    rainConfig.maxHeight, // Start at cloud level
    randomPos.z - 7.5 + (Math.random() * 0.8 - 0.4)  // Add some random offset
  );
  
  // Add individual speed property
  raindrop.speed = rainConfig.rainSpeed + (Math.random() * rainConfig.rainVariance);
  
  // Add the raindrop to the scene and array
  rainContainer.add(raindrop);
  raindrops.push(raindrop);
  
  return raindrop;
}

// Function to animate rainfall
function animateRain() {
  // Add new raindrops based on spawn rate
  for (let i = 0; i < rainConfig.spawnRate; i++) {
    // Only create new drops if below the maximum
    if (raindrops.length < rainConfig.maxRaindrops) {
      createRaindrop();
    }
  }
  
  // Update existing raindrops
  for (let i = raindrops.length - 1; i >= 0; i--) {
    const drop = raindrops[i];
    
    // Move the raindrop down
    drop.position.y -= drop.speed;
    
    // If the raindrop reaches the ground, remove it
    if (drop.position.y <= rainConfig.minHeight) {
      rainContainer.remove(drop);
      raindrops.splice(i, 1);
    }
  }
}



// You can add other event listeners here as needed
// For example: document.addEventListener('keydown', event => {
//   if (event.key === 'r') rainConfig.spawnRate = (rainConfig.spawnRate === 5) ? 10 : 5;
// });
/*****************************************
 * RAINFALL IMPLEMENTATION - END
 *****************************************/
/*****************************************
 * COLOR INTENSITY LAYER IMPLEMENTATION 
 *****************************************/






const colorGridContainer = new THREE.Group();
scene.add(colorGridContainer);


const redColor = new THREE.Color(0xff0000);
const greenColor = new THREE.Color(0x00ff00);

// Function to find the min and max values in the grid
function findMinMaxValues(grid) {
  let min = Infinity;
  let max = -Infinity;
  
  for (let x = 0; x < 16; x++) {
    for (let z = 0; z < 16; z++) {
      const value = grid[x][z];
      if (value < min) min = value;
      if (value > max) max = value;
    }
  }
  
  return { min, max };
}

// Find the value range
let { min, max } = findMinMaxValues(intensityGrid);
let range = max - min;

// Create a function to normalize values and map them to colors
function getColorForValue(value) {
  // Normalize the value to range [0,1]
  const normalizedValue = (value - min) / range;
  
  // Create a color by lerping between yellow and green
  const color = new THREE.Color();
  color.lerpColors(redColor, greenColor, normalizedValue);
  
  return color;
}

// Create color tiles for each grid position
function createColorGrid() {
  // Clear any existing tiles
  while (colorGridContainer.children.length > 0) {
    colorGridContainer.remove(colorGridContainer.children[0]);
  }
  
  // Create a tile for each grid position
  for (let x = 0; x < 16; x++) {
    for (let z = 0; z < 16; z++) {
      const value = intensityGrid[z][x];
      const color = getColorForValue(value);
      
      // Create a plane geometry for this tile
      const tileGeometry = new THREE.PlaneGeometry(1, 1);
      const tileMaterial = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide
      });
      
      const tile = new THREE.Mesh(tileGeometry, tileMaterial);
      tile.renderOrder = 10;
      // Position the tile at grid coordinates with slight offset above ground
      tile.position.set(
        x - 7.5, // Center the grid
        0.05,    // Just above the ground
        z - 7.5  // Center the grid
      );
      
      // Rotate to be flat/horizontal
      tile.rotation.x = -Math.PI / 2;
      
      // Add to container
      colorGridContainer.add(tile);
    }
  }
}

// Create the color grid
createColorGrid();

// Optional: Function to update the color grid if data changes
// Replace your current updateColorGrid function with this fixed version
function updateColorGrid(newData) {
  // Store current min/max from intensityGrid for comparison
  const oldMin = min;
  const oldMax = max;
  const oldRange = range;
  
  console.log("Updating color grid with new data");
  console.log("First value of new data:", newData[0][0]);
  console.log("First value of current grid:", intensityGrid[0][0]);
  
  // Update the data grid with the new values
  for (let x = 0; x < 16; x++) {
    for (let z = 0; z < 16; z++) {
      intensityGrid[x][z] = newData[x][z];
    }
  }
  
  // Find new min/max values from the updated intensityGrid
  const { min: newMin, max: newMax } = findMinMaxValues(intensityGrid);
  min = newMin;
  max = newMax;
  range = max - min;
  
  console.log("Color range updated:");
  console.log("Old min/max:", oldMin, oldMax, "range:", oldRange);
  console.log("New min/max:", min, max, "range:", range);

  // Clear the color grid and rebuild it from scratch
  // This ensures proper indexing and avoids potential ordering issues
  while (colorGridContainer.children.length > 0) {
    colorGridContainer.remove(colorGridContainer.children[0]);
  }
  
  // Recreate the color grid with the new values
  for (let x = 0; x < 16; x++) {
    for (let z = 0; z < 16; z++) {
      const value = intensityGrid[x][z];
      const color = getColorForValue(value);
      
      // Create a plane geometry for this tile
      const tileGeometry = new THREE.PlaneGeometry(1, 1);
      const tileMaterial = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide
      });
      
      const tile = new THREE.Mesh(tileGeometry, tileMaterial);
      tile.renderOrder = 10;
      
      // Position the tile at grid coordinates with slight offset above ground
      tile.position.set(
        x - 7.5, // Center the grid
        0.05,    // Just above the ground
        z - 7.5  // Center the grid
      );
      
      // Rotate to be flat/horizontal
      tile.rotation.x = -Math.PI / 2;
      
      // Add to container
      colorGridContainer.add(tile);
    }
  }
  
  console.log("Color grid rebuilt with", colorGridContainer.children.length, "tiles");
}

// Function to update cloud and rain effects based on data (top 5% only)
function updateCloudAndRainEffects() {
  // First, calculate the values for cloud data
  const cloudValues = [];
  for (let z = 0; z < 16; z++) {
    for (let x = 0; x < 16; x++) {
      if (typeof cloudGrid2[z][x] === 'number') {
        cloudValues.push(cloudGrid2[z][x]);
      }
    }
  }
  
  // Calculate the values for precipitation data
  const precipValues = [];
  for (let z = 0; z < 16; z++) {
    for (let x = 0; x < 16; x++) {
      if (typeof precipitationGrid[z][x] === 'number') {
        precipValues.push(precipitationGrid[z][x]);
      }
    }
  }
  const windValues = [];
  for (let z = 0; z < 16; z++) {
    for (let x = 0; x < 16; x++) {
      if (typeof windGrid2[z][x] === 'number') {
        windValues.push(windGrid2[z][x]);
      }
    }
  }
  
  // Sort values for percentile calculation
  cloudValues.sort((a, b) => a - b);
  precipValues.sort((a, b) => a - b);
  windValues.sort((a, b) => a - b);
  
  // Find the 95th percentile (top 5%)
  const cloudThreshold = cloudValues[Math.floor(cloudValues.length * 0.95)];
  const precipThreshold = precipValues[Math.floor(precipValues.length * 0.95)];
  const windThreshold = windValues[Math.floor(windValues.length * 0.95)];
  
  console.log(`Cloud cover threshold (top 5%): ${cloudThreshold}`);
  console.log(`Precipitation threshold (top 5%): ${precipThreshold}`);
  console.log(`Wind speed threshold (top 5%): ${windThreshold}`);
  
  // Clear existing cloud meshes
  while (cloudContainer.children.length > 0) {
    cloudContainer.remove(cloudContainer.children[0]);
  }
  cloudMeshes.length = 0;
   // Clear existing wind particles
   while (windParticles.length > 0) {
    const particle = windParticles.pop();
    scene.remove(particle.mesh);
  }
  
  // First, reset all cloud and rainfall grid values
  for (let x = 0; x < 16; x++) {
    for (let z = 0; z < 16; z++) {
      cloudGrid[x][z] = false;
      rainfallGrid[x][z] = false;
      windGrid[x][z] = false;
    }
  }
  
  // Identify cells with high precipitation (for rain)
  const rainCells = [];
  for (let z = 0; z < 16; z++) {
    for (let x = 0; x < 16; x++) {
      if (typeof precipitationGrid[z][x] === 'number' && precipitationGrid[z][x] >= precipThreshold) {
        rainCells.push({x, z});
      }
    }
  }
  
  // Identify cells with high cloud cover
  const cloudCells = [];
  for (let z = 0; z < 16; z++) {
    for (let x = 0; x < 16; x++) {
      if (typeof cloudGrid2[z][x] === 'number' && cloudGrid2[z][x] >= cloudThreshold) {
        cloudCells.push({x, z});
      }
    }
  }
  const windCells = [];
  for (let z = 0; z < 16; z++) {
    for (let x = 0; x < 16; x++) {
      if (typeof windGrid2[z][x] === 'number' && windGrid2[z][x] >= windThreshold) {
        windCells.push({x, z});
      }
    }
  }
  // First, mark cloud cells
  for (const cell of cloudCells) {
    cloudGrid[cell.x][cell.z] = true;
  }
  
  // Then, mark rain cells and ensure they also have clouds
  for (const cell of rainCells) {
    rainfallGrid[cell.x][cell.z] = true;
    
    // Ensure there's a cloud where it's raining (even if cloud cover isn't in top 5%)
    if (!cloudGrid[cell.x][cell.z]) {
      cloudGrid[cell.x][cell.z] = true;
    }
  }
  for (const cell of windCells) {
    windGrid[cell.x][cell.z] = true;
  }
  
  // Create cloud meshes for all cloud positions
  for (let x = 0; x < 16; x++) {
    for (let z = 0; z < 16; z++) {
      if (cloudGrid[x][z]) {
        // Create a cloud box for this position
        const cloudGeometry = new THREE.BoxGeometry(1, 0.3, 1);
        const cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);
        cloudMesh.castShadow = true;
        cloudMesh.receiveShadow = false;
        
        // Position the cloud above the grid
        cloudMesh.position.set(
          x - 7.5, // Center the clouds over the grid
          5,       // Height above the grid
          z - 7.5  // Center the clouds over the grid
        );
        
        // Add some randomness to make clouds look more natural
        cloudMesh.scale.x = 0.8 + Math.random() * 0.4;
        cloudMesh.scale.z = 0.8 + Math.random() * 0.4;
        
        // Add the cloud to the scene
        cloudContainer.add(cloudMesh);
        cloudMeshes.push(cloudMesh);
      }
    }
  }
  for (let x = 0; x < 16; x++) {
    for (let z = 0; z < 16; z++) {
      if (windGrid[x][z]) {
        // Create wind particles for this grid cell
        const particleCount = 5 + Math.floor(Math.random() * 5); // 5-9 particles per cell
        
        // Get the actual wind value to scale the wind effect
        const windValue = windGrid2[z][x];
        const windIntensity = windValue / windThreshold; // Normalize relative to threshold
        
        for (let i = 0; i < particleCount; i++) {
          // Create a small line mesh to represent wind
          const windGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.6 * windIntensity, 4);
          const windMaterial = new THREE.MeshBasicMaterial({
            color: 0xFFFFFF,
            transparent: true,
            opacity: 0.4 + (windIntensity * 0.3),
            emissive: 0xCCCCCC,
            emissiveIntensity: 0.3
          });
          
          const windMesh = new THREE.Mesh(windGeometry, windMaterial);
          windMesh.renderOrder = 10;
          windMesh.castShadow = false;
          windMesh.receiveShadow = false;
          
          // Position slightly above the grid with random offset within the cell
          windMesh.position.set(
            x - 7.5 + (Math.random() * 0.8 - 0.4), // Center with slight randomness
            0.2 + Math.random() * 0.2,             // Slightly above the grid
            z - 7.5 + (Math.random() * 0.8 - 0.4)  // Center with slight randomness
          );
          
          // Rotate to be horizontal (like wind flowing)
          windMesh.rotation.z = Math.PI / 2;
          
          // Wind direction (slightly randomized but generally west to east)
          // Use an angle based on the wind value for more variation
          windMesh.rotation.y = Math.PI / 4 + (windIntensity * Math.PI / 8);
          
          // Add to scene
          scene.add(windMesh);
          
          // Store for animation with wind intensity factored in
          windParticles.push({
            mesh: windMesh,
            speed: 0.001 * windIntensity * 3, // Scale speed by wind intensity
            cell: { x, z },
            phase: Math.random() * Math.PI * 2, // Random starting phase
            originalY: windMesh.position.y,
            intensity: windIntensity // Store intensity for animations
          });
        }
      }
    }
  }
  
  // Clear existing raindrops
  while (rainContainer.children.length > 0) {
    rainContainer.remove(rainContainer.children[0]);
  }
  raindrops.length = 0;
  
 
  
  console.log(`Updated clouds: ${cloudMeshes.length} clouds created`);
  console.log(`Rain enabled on ${rainCells.length} grid cells`);
}
function createTextSprite() {
  // Create canvas for the text
  textCanvas = document.createElement('canvas');
  textCanvas.width = 350;
  textCanvas.height = 200;
  textContext = textCanvas.getContext('2d');
  
  // Create texture from canvas
  textTexture = new THREE.CanvasTexture(textCanvas);
  textTexture.minFilter = THREE.LinearFilter;
  textTexture.magFilter = THREE.LinearFilter;
  
  // Create material with the texture
  textMaterial = new THREE.SpriteMaterial({
    map: textTexture,
    transparent: true
  });
  
  // Create sprite with the material
  textSprite = new THREE.Sprite(textMaterial);
  textSprite.scale.set(2, 1, 1);
  textSprite.visible = false;
  
  // Add to scene
  scene.add(textSprite);
}
function updateTextSprite(x, z) {
  // Clear the canvas
  textContext.clearRect(0, 0, textCanvas.width, textCanvas.height);
  
  // Background
  textContext.fillStyle = 'rgba(17, 24, 39, 0.8)';
  textContext.fillRect(0, 0, textCanvas.width, textCanvas.height);
  
  // Border
  textContext.strokeStyle = 'rgba(74, 85, 104, 0.6)';
  textContext.lineWidth = 4;
  textContext.strokeRect(2, 2, textCanvas.width - 4, textCanvas.height - 4);
  
  // Make sure coordinates are within bounds (0-15) for our 16x16 grid
  const gridX = Math.max(0, Math.min(15, Math.floor(x)));
  const gridZ = Math.max(0, Math.min(15, Math.floor(z)));
  
  // Check for negative values
  if (x < 0) console.warn("Warning: Negative X coordinate received");
  if (z < 0) console.warn("Warning: Negative Z coordinate received");
  
  // Get values from all our grid data structures
  let bestPlant = "Unknown";
  let currYield = "Unknown";
  let currentCoordinate = "Unknown";
  let currentTemp = "Unknown";
  let currentHumidity = "Unknown";
  let currentPrecipitation = "Unknown";
  let currentCloud = "Unknown";
  let currentWind = "Unknown";

  try {
    // Access data from respective grids, making sure to use the correct indices
    bestPlant = bestPlantGrid[gridZ][gridX];
    currentCoordinate = Coordinates[gridZ][gridX];
    currYield = intensityGrid[gridX][gridZ];
    
    // Get weather data from their respective grids
    currentTemp = temperatureGrid[gridZ][gridX];
    currentHumidity = humidityGrid[gridZ][gridX];
    currentPrecipitation = precipitationGrid[gridZ][gridX];
    currentCloud = cloudGrid2[gridZ][gridX];
    currentWind = windGrid2[gridZ][gridX];
    
    // Format numeric values for better display
    if (typeof currYield === 'number') currYield = currYield.toFixed(2);
    if (typeof currentTemp === 'number') currentTemp = currentTemp.toFixed(1);
    if (typeof currentHumidity === 'number') currentHumidity = currentHumidity.toFixed(1);
    if (typeof currentPrecipitation === 'number') currentPrecipitation = currentPrecipitation.toFixed(1);
    if (typeof currentCloud === 'number') currentCloud = currentCloud.toFixed(1);
    if (typeof currentWind === 'number') currentWind = currentWind.toFixed(1);
  } catch (error) {
    console.error(`Error accessing grid data at [${gridZ}][${gridX}]:`, error);
  }
  
  // Text
  textContext.font = 'bold 20px monospace';
  textContext.fillStyle = 'white';
  textContext.textAlign = 'center';

  // Display all relevant information
  textContext.fillText(`Yield: ${currYield}`, textCanvas.width / 2, 40);
  textContext.fillText(`Best Plant: ${bestPlant}`, textCanvas.width / 2, 70);
  textContext.fillText(`Coordinate: ${currentCoordinate}`, textCanvas.width / 2, 100);
  
  // Add weather information
  textContext.fillText(`Temperature: ${currentTemp}°C`, textCanvas.width / 2, 130);
  textContext.fillText(`Humidity: ${currentHumidity}%`, textCanvas.width / 2, 160);
  textContext.fillText(`Wind: ${currentWind} m/s`, textCanvas.width / 2, 190);
  
  // Update texture
  textTexture.needsUpdate = true;
}
function updateSpriteRotation() {
  if (textSprite && textSprite.visible) {
    textSprite.position.y = 1.5; // Keep it at consistent height
    
    // Make the text always face the camera
    textSprite.lookAt(camera.position);
  }
}
scene.children.forEach(child => {
  if (child instanceof THREE.DirectionalLight) {
    scene.remove(child);
  }
});

// Enable shadows in the renderer
// COMPREHENSIVE SHADOW TROUBLESHOOTING

// 1. RENDERER CONFIGURATION
// Make sure shadow mapping is DEFINITELY enabled
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Try different types if needed

// 2. LIGHT SETUP WITH DEBUGGING
// Create a new directional light with high intensity
const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1.5);
directionalLight1.position.set(0, 15, 0);
directionalLight1.castShadow = true;

// Set up shadow parameters with GENEROUS bounds
// More realistic shadow settings with better performance balance
directionalLight1.shadow.mapSize.width = 2048; // Good balance between quality and performance
directionalLight1.shadow.mapSize.height = 2048;
directionalLight1.shadow.camera.near = 1; // More realistic near plane for outdoor scene
directionalLight1.shadow.camera.far = 20; // Only need to see shadows within scene bounds
directionalLight1.shadow.camera.left = -8; // Tighter frustum for sharper shadows
directionalLight1.shadow.camera.right = 8;
directionalLight1.shadow.camera.top = 8;
directionalLight1.shadow.camera.bottom = -8;
directionalLight1.shadow.bias = -0.0005; // Subtle bias to prevent shadow acne
// Critical: Target and update matrices
directionalLight1.target.position.set(0, 0, 0);
scene.add(directionalLight1.target);
scene.add(directionalLight1);

// Force updates to ensure matrices are current
directionalLight1.updateMatrixWorld(true);
directionalLight1.target.updateMatrixWorld(true);
directionalLight1.shadow.camera.updateProjectionMatrix();

// 3. ENSURE MATERIALS ARE COMPATIBLE WITH SHADOWS
// For each cloud



gridMesh.receiveShadow = true;
gridMesh.castShadow = false;









// 8. FORCE A RENDER UPDATE
// This ensures all changes take effect
setTimeout(() => {
  
  renderer.render(scene, camera);
}, 200);


    // Create a highlight mesh (will change color on mouse hover)
    const highlightMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, transparent: true })
    );
    highlightMesh.rotateX(-Math.PI / 2);
    highlightMesh.position.set(0.5, 0, 0.5);
    scene.add(highlightMesh);

    // Raycaster and mouse position
    const mousePosition = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();
    let intersects;
    let intersectsField;

    // Mouse movement handler
    window.addEventListener('mousemove', (e) => {
      mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1;
      mousePosition.y = -(e.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mousePosition, camera);
      intersects = raycaster.intersectObject(planeMesh);
      intersectsField = raycaster.intersectObject(fieldModel);
      if (intersects.length > 0) {
        const intersect = intersects[0];
        
        
        const highlightPos = new THREE.Vector3().copy(intersect.point).floor().addScalar(0.5);
       
        
        highlightMesh.position.set(highlightPos.x, 0, highlightPos.z);
        highlightMesh.material.color.setHex(0xFFFFFF);
        
        // Show and position the text sprite
        if (textSprite) {
          textSprite.visible = true;
          textSprite.position.set(highlightPos.x, 2, highlightPos.z); // Position above the highlighted block
          
          // Make sure coordinates are properly bounded for our 16x16 grid
          const gridX = Math.max(0, Math.min(15, Math.floor(highlightPos.x + 8)));
          const gridZ = Math.max(0, Math.min(15, Math.floor(highlightPos.z + 8)));
          
          
          updateTextSprite(gridX, gridZ);
        }
      } else {
        // Hide the text sprite when not hovering
        if (textSprite) {
          textSprite.visible = false;
        }
      }
      if (intersectsField.length > 0) {
        // Mouse is hovering over the field
        if (!isFieldHovered) {
          isFieldHovered = true;
          
          // Apply highlight effect to the model
          
        }
      } else if (isFieldHovered) {
        // Mouse moved away from the field
        isFieldHovered = false;
        
       
      }
      document.body.style.cursor = 'auto';

    });

    // Sphere mesh to add on mouse click
    const sphereMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.4, 4, 2),
      new THREE.MeshBasicMaterial({ wireframe: true, color: 0xFFEA00 })
    );

    const objects = [];
    let fieldInfoPanel;
    let plantModel = null;
   
    // Mouse click handler
    window.addEventListener('mousedown', () => {
      if (event.target.closest('#field-info-panel')) {
        return; // Exit early - let the button handle the click
      }
      if (fieldModel && intersectsField && intersectsField.length > 0) {
        showFieldInfoPanel();
      } else {
        hideFieldInfoPanel();
      }
      if (intersects.length > 0) {
    
        // Get the grid position
        const highlightPos1 = new THREE.Vector3().copy(intersects[0].point).floor();
    
        // Calculate the grid indices (from -8,-8 to 7,7 transformed to 0-15, 0-15)
        const gridX = Math.max(0, Math.min(15, Math.floor(highlightPos1.x + 8)));
        const gridZ = Math.max(0, Math.min(15, Math.floor(highlightPos1.z + 8)));
        
        // Now using the correctly named variables
        const plantType = bestPlantGrid[gridZ][gridX];
        console.log(`Planting ${plantType} at grid position (${gridZ}, ${gridX})`);
        if (wheatModel) {
          // Clone the wheat model
          const wheatClone = wheatModel.clone();
          
          // Position the wheat clone at the highlight mesh location
          wheatClone.position.copy(highlightMesh.position);
          
          // You might need to adjust scale if the wheat model is too big or small
          wheatClone.scale.set(1, 1, 1);
          wheatClone.position.y = 1;
          wheatClone.traverse((child) => {
            if (child.isMesh) {
              child.renderOrder = 10; // Higher value = rendered later (on top)
              
              // If you're using transparent materials, make sure depthWrite is managed properly
              
            }
          });  
          // Add to scene and objects array
          scene.add(wheatClone);
          objects.push(wheatClone);
          
          // Change highlight color
          highlightMesh.material.color.setHex(0xFF0000);
        } else {
          // Fallback to sphere if wheat model isn't loaded yet
          const sphereClone = sphereMesh.clone();
          sphereClone.position.copy(highlightMesh.position);
          scene.add(sphereClone);
          objects.push(sphereClone);
          highlightMesh.material.color.setHex(0xFF0000);
        }
      }
    });
    function showFieldInfoPanel() {
      console.log('Starting showFieldInfoPanel function');
      
      // Disable Three.js canvas pointer events
      const canvasElements = document.querySelectorAll('canvas');
      canvasElements.forEach(canvas => {
        canvas.style.pointerEvents = 'none';
      });
      
      // Remove existing panel if there is one
      hideFieldInfoPanel();
      
      // Create a new panel element
      const fieldInfoPanel = document.createElement('div');
      fieldInfoPanel.id = 'field-info-panel';
      
      // Apply Tailwind classes with increased z-index
      fieldInfoPanel.className = 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-6 z-50 w-160 h-144 mt-8 overflow-hidden bg-gray-800 bg-opacity-80 rounded-md shadow-lg border border-gray-700';
      
      // Add content to the panel
      fieldInfoPanel.innerHTML = `
        <div class="relative h-full w-full flex flex-col items-center">
          <h2 class="text-white text-2xl font-bold mb-8" style="font-family: 'VT323', 'Silkscreen', monospace">Crop Optimization</h2>
    
          <!-- Calories button -->
          <button 
            id="calories-btn" 
            class="w-64 h-20 mb-6 text-white font-bold py-4 px-6 rounded-md transform focus:outline-none hover:bg-transparent"
            style="font-family: 'VT323', 'Silkscreen', monospace; background-color: #4B5563;" 
          >
            Calories (Default)
          </button>
    
          <!-- Protein button -->
          <button 
            id="protein-btn" 
            class="w-64 h-20 mb-6 text-white font-bold py-4 px-6 rounded-md transform focus:outline-none hover:bg-transparent"
            style="font-family: 'VT323', 'Silkscreen', monospace; background-color: #4B5563;" 
          >
            Protein
          </button>
    
          <!-- Oil button -->
          <button 
            id="water-btn" 
            class="w-64 h-20 mb-6 text-white font-bold py-4 px-6 rounded-md transform focus:outline-none hover:bg-transparent"
            style="font-family: 'VT323', 'Silkscreen', monospace; background-color: #4B5563;" 
          >
            Oil
          </button>
    
          <!-- Carbohydrates button -->
          <button 
            id="carbs-btn" 
            class="w-64 h-20 mb-6 text-white font-bold py-4 px-6 rounded-md transform focus:outline-none hover:bg-transparent"
            style="font-family: 'VT323', 'Silkscreen', monospace; background-color: #4B5563;" 
          >
            Carbohydrates
          </button>
    
          <!-- EFA button -->
          <button 
            id="efa-btn" 
            class="w-64 h-20 mb-6 text-white font-bold py-4 px-6 rounded-md transform focus:outline-none hover:bg-transparent"
            style="font-family: 'VT323', 'Silkscreen', monospace; background-color: #4B5563;" 
          >
            EFA
          </button>
        </div>
      `;
      
      // Add to the document
      document.body.appendChild(fieldInfoPanel);
      console.log('Panel added to document body');
    
      // Set up event listeners for all buttons
      const caloriesBtn = fieldInfoPanel.querySelector('#calories-btn');
      const proteinBtn = fieldInfoPanel.querySelector('#protein-btn');
      const waterBtn = fieldInfoPanel.querySelector('#water-btn');
      const carbsBtn = fieldInfoPanel.querySelector('#carbs-btn');
      const efaBtn = fieldInfoPanel.querySelector('#efa-btn');
      
      // Add event listeners with capture phase (true as third parameter)
      caloriesBtn.addEventListener('click', function(e) {
        console.log('Calories button clicked');

        e.stopPropagation();
        fetchNewYieldData("Calories");
        hideFieldInfoPanel();
      }, true);
      
      proteinBtn.addEventListener('click', function(e) {
        console.log('Protein button clicked');
        e.stopPropagation();
        fetchNewYieldData("Calories");
        hideFieldInfoPanel();
      }, true);
      
      waterBtn.addEventListener('click', function(e) {
        console.log('Oil button clicked');
        e.stopPropagation();
        fetchNewYieldData("Oil");
        hideFieldInfoPanel();
      }, true);
      
      carbsBtn.addEventListener('click', function(e) {
        console.log('Carbs button clicked');
        e.stopPropagation();
        fetchNewYieldData("Carbohydrates");
        hideFieldInfoPanel();
      }, true);
      
      efaBtn.addEventListener('click', function(e) {
        console.log('EFA button clicked');
        e.stopPropagation();
        fetchNewYieldData("EFA");
        hideFieldInfoPanel();
      }, true);
    }
    
    // Make sure you have this function defined somewhere
    function hideFieldInfoPanel() {
      const existingPanel = document.getElementById('field-info-panel');
      if (existingPanel) {
        existingPanel.remove();
      }
      
      // Re-enable Three.js canvas pointer events
      const canvasElements = document.querySelectorAll('canvas');
      canvasElements.forEach(canvas => {
        canvas.style.pointerEvents = 'auto';
      });
    }
    // Animation loop
    function animate(time) {
       /*****************************************
       * WIND ANIMATION CALL - START
       *****************************************/
       animateWind(time);
       /*****************************************
        * WIND ANIMATION CALL - END
        *****************************************/
       /*****************************************
       * CLOUD ANIMATION CALL - START
       *****************************************/
       animateClouds(time);
       /*****************************************
        * CLOUD ANIMATION CALL - END
        *****************************************/
       animateRain();
       updateSpriteRotation();
     
      renderer.render(scene, camera);
    }

    // Start the animation loop
    renderer.setAnimationLoop(animate);

    // Resize handling
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Clean up when the component unmounts
    return () => {
      document.body.removeChild(renderer.domElement);
    };
  }, []);

  
  return (
    <div className="fixed inset-0 flex justify-between p-4 z-50 pointer-events-none">
    {/* Left panel - expanded size for all weather data */}
    <div 
      className="p-5 bg-gray-800 text-white overflow-hidden w-96 h-56 flex flex-col justify-center pointer-events-auto"
      style={{
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
        border: "1px solid rgba(74, 85, 104, 0.3)",
        borderRadius: "4px",
        fontFamily: "'VT323', 'Silkscreen', monospace"
      }}
    >
      <div className="text-lg font-bold tracking-wider mb-2">Weather Averages</div>
      <div className="text-base tracking-wider">Temperature: {typeof weatherData.temp === 'number' ? weatherData.temp.toFixed(1) : weatherData.temp}°C</div>
      <div className="text-base tracking-wider">Humidity: {typeof weatherData.humidity === 'number' ? weatherData.humidity.toFixed(1) : weatherData.humidity}%</div>
      <div className="text-base tracking-wider">Precipitation: {typeof weatherData.precipitation === 'number' ? weatherData.precipitation.toFixed(1) : weatherData.precipitation} mm</div>
      <div className="text-base tracking-wider">Cloud Coverage: {typeof weatherData.cloud === 'number' ? weatherData.cloud.toFixed(1) : weatherData.cloud}%</div>
      <div className="text-base tracking-wider">Wind Speed: {typeof weatherData.wind120m === 'number' ? weatherData.wind120m.toFixed(1) : weatherData.wind120m} m/s</div>
    </div>
    
    <div 
  className="p-4 bg-gray-800 bg-opacity-80 rounded-md pointer-events-auto flex flex-col"
  style={{
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
    border: "1px solid rgba(74, 85, 104, 0.3)",
    fontFamily: "'VT323', 'Silkscreen', monospace",
    height: "40vh"
  }}
>
  <div className="text-white text-center font-bold mb-2">Crop Yield</div>
  
  <div className="flex flex-col items-center flex-1">
    <div className="text-white text-xs mb-1">Best</div>
    
    <div 
      className="w-8 flex-1 rounded-sm" 
      style={{ 
        background: 'linear-gradient(to bottom, #00FF00, #FFFF00, #FF0000)',
        minHeight: '200px' // Minimum height to ensure the gradient is visible
      }} 
    />
    
    <div className="text-white text-xs mt-1">Worst</div>
  </div>
</div>
</div>
  );
};

export default App;
