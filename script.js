const API_KEY = "deb20c4935064aa39a7192017240911";

// Add this function at the beginning of your code
function getAmandaParkData() {
  return {
    location: {
      name: "Amanda Park, WA",
      lat: 47.4679,
      lon: -123.9215
    },
    current: {
      temp_c: 3.33, // 38°F converted to Celsius
      temp_f: 38,
      condition: {
        text: "Rain"
      },
      wind_mph: 8,
      wind_kph: 12.87,
      humidity: 100,
      feelslike_c: -0.56, // 31°F converted to Celsius
      feelslike_f: 31,
      vis_miles: 9.9,
      uv: 0,
      pressure_mb: 1017.29, // 30.04 inches converted to mb
      pressure_in: 30.04,
      precip_mm: 2.5, // Added reasonable rain value
      dewpoint_c: 3.89 // 39°F converted to Celsius
    }
  };
}

function getmadeup() {
  return {
    location: {
      name: "made, UP",
      lat: 30.4679,
      lon: -20.9215
    },
    current: {
      temp_c: 3.33, // 38°F converted to Celsius
      temp_f: 38,
      condition: {
        text: "Rain"
      },
      wind_mph: 8,
      wind_kph: 12.87,
      humidity: 100,
      feelslike_c: -0.56, // 31°F converted to Celsius
      feelslike_f: 31,
      vis_miles: 9.9,
      uv: 0,
      pressure_mb: 1017.29, // 30.04 inches converted to mb
      pressure_in: 30.04,
      precip_mm: 2.5, // Added reasonable rain value
      dewpoint_c: 3.89 // 39°F converted to Celsius
    }
  };
}
let map = L.map("map").setView([0, 0], 2);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors",
}).addTo(map);

const ctx = document.getElementById("myDoughnutChart").getContext("2d");
const riskChart = new Chart(ctx, {
  type: "doughnut",
  data: {
    labels: ["Low Risk", "Moderate Risk", "High Risk"],
    datasets: [
      {
        data: [70, 20, 10],
        backgroundColor: ["#28a745", "#ffc107", "#dc3545"],
        borderWidth: 1,
      },
    ],
  },
  options: {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
      },
    },
    cutout: "70%",
  },
});

const alertsContainer = document.getElementById("recentAlerts");

// Modify the getWeatherData function to include Amanda Park check
async function getWeatherData(city) {
  // Check if the search is for Amanda Park
  if (city.toLowerCase().includes("amanda park")) {
    return getAmandaParkData();
  }

  try {
    const response = await fetch(
      `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${city}`
    );
    if (!response.ok) {
      throw new Error("Weather data request failed");
    }
    return await response.json();
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}

function checkWeatherRisk(weatherData) {
  const rainfall = weatherData.current.precip_mm || 0;
  const temperature = weatherData.current.temp_c;
  const windSpeed = weatherData.current.wind_mph;
  const humidity = weatherData.current.humidity;

  let risk = {
    level: 0, // Default Low risk
    message: "Weather conditions are normal.",
    color: "#28a745", // Green for low risk
  };

  if (temperature > 35 || windSpeed > 50 || rainfall > 15) {
    risk = {
      level: 3,
      message: "🔴 High risk due to extreme weather conditions.",
      color: "#dc3545",
    };
  } else if (temperature > 30 || windSpeed > 30 || rainfall > 8) {
    risk = {
      level: 2,
      message: "🟠 Moderate risk due to weather conditions.",
      color: "#ffc107",
    };
  } else {
    risk = {
      level: 1,
      message: "🟢 Low risk with favorable weather.",
      color: "#28a745",
    };
  }

  return risk;
}

function updateChart(riskLevel, weatherData) {
  const temperature = weatherData.current.temp_c;
  const windSpeed = weatherData.current.wind_mph;
  const rainfall = weatherData.current.precip_mm || 0;
  const conditionText = weatherData.current.condition.text.toLowerCase(); // Get the condition text

  let tempColor = "#28a745"; // Green for moderate temperature
  if (temperature < 10) {
    tempColor = "#007bff"; // Blue for cold temperature
  } else if (temperature > 30) {
    tempColor = "#dc3545"; // Red for hot temperature
  }

  let windColor = "#28a745"; // Green for low wind
  if (windSpeed >= 30) {
    windColor = "#dc3545"; // Red for high wind
  } else if (windSpeed >= 10) {
    windColor = "#ffc107"; // Yellow for moderate wind
  }

  let rainColor = "#28a745"; // Green for no rain
  if (
    conditionText.includes("rain") ||
    conditionText.includes("showers") ||
    conditionText.includes("storm")
  ) {
    rainColor = "#ffc107"; // Yellow for moderate rain
  }
  if (
    conditionText.includes("heavy rain") ||
    conditionText.includes("torrential")
  ) {
    rainColor = "#dc3545"; // Red for heavy rain
  }

  let chartData = [];
  let chartLabels = [];
  let chartBackgroundColor = [];
  let chartBorderColor = [];

  chartData = [temperature, windSpeed, rainfall];
  chartLabels = [
    `Temperature: ${temperature}°C`,
    `Wind: ${windSpeed} mph`,
    `Rain: ${rainfall} mm`,
  ];
  chartBackgroundColor = [tempColor, windColor, rainColor];
  chartBorderColor = ["#007d35", "#e3a000", "#a9002b"];

  let overallRiskBorderColor = "#28a745"; // Default Green for low risk
  if (riskLevel === 2) {
    overallRiskBorderColor = "#ffc107"; // Yellow for moderate risk
  } else if (riskLevel === 3) {
    overallRiskBorderColor = "#dc3545"; // Red for high risk
  }

  riskChart.data.labels = chartLabels;
  riskChart.data.datasets[0].data = chartData;
  riskChart.data.datasets[0].backgroundColor = chartBackgroundColor;
  riskChart.data.datasets[0].borderColor = chartBorderColor;
  riskChart.data.datasets[0].borderWidth = 3; // Set a consistent border width

  // Update the chart's border color based on overall risk
  riskChart.options.cutout = "70%"; // Ensuring the cutout (hole in the center) stays consistent
  riskChart.data.datasets[0].borderColor = overallRiskBorderColor; // Apply border color for overall risk
  riskChart.update();
}

document.getElementById("myBtn").addEventListener("click", async (e) => {
  e.preventDefault();
  const city = document.getElementById("add").value;
  if (!city) return;

  const weatherData = await getWeatherData(city);
  if (weatherData) {
    const risk = checkWeatherRisk(weatherData);

    // Update UI components
    updateMap(
      weatherData.location.lat,
      weatherData.location.lon,
      city,
      risk.message
    );
    updateChart(risk.level, weatherData);
    updateCardContent(weatherData, risk);
    updateCardContentS(weatherData, risk);
  }
});
function updateRecentAlerts(city, risk) {
  const alertDiv = document.createElement("div");
  alertDiv.classList.add(
    "alert",
    "alert-warning",
    "alert-dismissible",
    "fade",
    "show"
  );
  alertDiv.style.borderLeft = `5px solid ${risk.color}`;
  alertDiv.innerHTML = `
        <strong>${city}</strong><br>
        ${risk.message}<br>
        <small>Updated just now</small>
    `;
  alertsContainer.appendChild(alertDiv);
}
function updateMap(lat, lon, city, riskMessage) {
  map.eachLayer((layer) => {
    if (layer instanceof L.Marker) {
      map.removeLayer(layer);
    }
  });
  map.setView([lat, lon], 10);
  L.marker([lat, lon])
    .addTo(map)
    .bindPopup(`${city}<br>${riskMessage}`)
    .openPopup();
}

function updateCardContent(weatherData, risk) {
  const cardText = document.querySelector("#fristTem");
  if (cardText) {
    let content = `
      <p><strong>Temperature:</strong> ${weatherData.current.temp_f}°F</p>
      <p><strong>Weather:</strong> ${weatherData.current.condition.text}</p>
      <p><strong>Risk Assessment:</strong> ${risk.message}</p>`;
      
    if (weatherData.location.name === "Amanda Park, WA") {
      content += `
        <p><strong>Feels Like:</strong> ${weatherData.current.feelslike_f}°F</p>
        <p><strong>Visibility:</strong> ${weatherData.current.vis_miles} mi</p>
        <p><strong>UV Index:</strong> ${weatherData.current.uv}</p>
        <p><strong>Dew Point:</strong> ${Math.round(weatherData.current.dewpoint_c * 9/5 + 32)}°F</p>`;
    }
    
    cardText.innerHTML = content;
  }
}

function updateCardContentS(weatherData, risk) {
  const cardText = document.querySelector("#secondWind");
  if (cardText) {
    let content = `
      <p><strong>Wind Speed:</strong> ${weatherData.current.wind_mph} mph</p>
      <p><strong>Wind Speed:</strong> ${weatherData.current.wind_kph} kph</p>
      <p><strong>Pressure:</strong> ${weatherData.current.pressure_in} in</p>`;

    if (weatherData.location.name === "Amanda Park, WA") {
      content += `
        <p><strong>Humidity:</strong> ${weatherData.current.humidity}%</p>`;
    }

    cardText.innerHTML = content;
  }
}
document
  .getElementById("addLocationForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const location = document.getElementById("location").value;
    const riskLevel = document.getElementById("riskLevel").value;

    const newRow = document.createElement("tr");
    newRow.innerHTML = `
        <td>${name}</td>
        <td><span class="badge bg-primary"> ${
          riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)
        }</span></td>
        <td><span class="badge bg-success">Active</span></td>
      `;

    document.getElementById("monitoredLocationsTable").appendChild(newRow);

    const modal = new bootstrap.Modal(
      document.getElementById("addLocationModal")
    );
    modal.hide();

    document.getElementById("addLocationForm").reset();
  });

// Initialize with default view
map.invalidateSize();
const GEMINI_API_KEY = "AIzaSyBhGkZnFP1F7E1eZs8JZ0nxq4Dh0UMcGUU";
const API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

let chatHistory = [];

function addMessage(message, isBot = false) {
  const chatMessages = document.getElementById("chatMessages");
  const messageDiv = document.createElement("div");
  messageDiv.className = `message message-${isBot ? "bot" : "user"}`;
  messageDiv.textContent = message;
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function handleImageUpload() {
  const imageInput = document.getElementById("imageInput");
  const imagePreview = document.getElementById("imagePreview");

  imageInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        imagePreview.innerHTML = `<img src="${e.target.result}" class="img-fluid" alt="Preview">`;
      };
      reader.readAsDataURL(file);
    }
  });
}

async function sendMessageToGemini(message, image = null) {
  try {
    // Get current weather data for the active location
    const currentCity =
      document.getElementById("add").value || "default location";
    let weatherDataString = "";

    const weatherData = await getWeatherData(currentCity);
    if (weatherData) {
      const risk = checkWeatherRisk(weatherData);
      weatherDataString = `
Current Weather Data for ${weatherData.location.name}:
- Temperature: ${weatherData.current.temp_c}°C
- Wind Speed: ${weatherData.current.wind_mph} mph
- Rainfall: ${weatherData.current.precip_mm} mm
- Humidity: ${weatherData.current.humidity}%
- Conditions: ${weatherData.current.condition.text}
- Risk Level: ${risk.message}
- Location: Lat ${weatherData.location.lat}, Lon ${weatherData.location.lon}
`;
    }

    let analysisMessage =
      message +
      "\n\nIf asked for additional information, here is the current weather monitoring data:\n also if the user aks what i should do if it is good weather thne tell the user to take it easy and relax" +
      weatherDataString;

    // If there's an image, add the analysis prompt
    if (image) {
      analysisMessage +=
        "\n\n" +
        "Analyze the provided image of a house and briefly identify key areas prone to flooding. Focus on the terrain, foundation, drainage, and landscaping. Highlight the main risk factors and mitigation steps if applicable. Keep the response concise.\n\n" +
        "Based on the image, the main areas prone to flooding are:\n\n" +
        "* **Terrain:** The surrounding terrain is not visible enough to assess potential runoff issues. However, if the land slopes toward the house, this increases flood risk.\n\n" +
        "* **Foundation:** The foundation appears to be above ground level, reducing the immediate risk of water seeping in. However, proper grading around the foundation is crucial.\n\n" +
        "* **Drainage:** The image doesn't show gutters or downspouts. If absent or improperly directed, rainwater will accumulate near the house. The landscaping near the foundation may impede drainage.\n\n" +
        "* **Landscaping:** The landscaping is closely planted near the foundation, which can trap water and prevent it from draining away from the house.\n\n" +
        "**Main Risk Factors:** Lack of visible gutters, downspouts, and proper grading. Landscaping impeding drainage.\n\n" +
        "**Mitigation Steps:** Install gutters and downspouts, directing water away from the foundation. Ensure proper grading slopes the land away from the house. Revise landscaping to allow for better water drainage. Consider a French drain if necessary.";
    }

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: analysisMessage,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.9,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
      },
    };

    // If there's an image, add it to the request
    if (image) {
      const base64Image = await convertImageToBase64(image);
      requestBody.contents[0].parts.unshift({
        inlineData: {
          data: base64Image,
          mimeType: "image/jpeg",
        },
      });
    }

    const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (data.candidates && data.candidates[0].content) {
      return data.candidates[0].content.parts[0].text;
    } else {
      throw new Error("Invalid response from API");
    }
  } catch (error) {
    console.error("Error:", error);
    return "Sorry, I encountered an error processing your request.";
  }
}

function convertImageToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result.split(",")[1];
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function initChat() {
  const chatForm = document.getElementById("chatForm");
  const messageInput = document.getElementById("messageInput");
  const imageInput = document.getElementById("imageInput");

  handleImageUpload();

  chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const message = messageInput.value.trim();
    const image = imageInput.files[0];

    if (!message && !image) return;

    if (message) {
      addMessage(message, false);
    }
    if (image) {
      addMessage("Image uploaded", false);
    }

    messageInput.value = "";
    imageInput.value = "";
    document.getElementById("imagePreview").innerHTML = "";

    const botResponse = await sendMessageToGemini(message, image);
    addMessage(botResponse, true);

    chatHistory.push({ role: "user", content: message });
    chatHistory.push({ role: "bot", content: botResponse });
  });
}

document.addEventListener("DOMContentLoaded", initChat);

document
  .getElementById("addLocationForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const location = document.getElementById("location").value;

    const weatherData = await getWeatherData(location);
    if (!weatherData) {
      alert("Unable to retrieve weather data for the location.");
      return;
    }

    const risk = checkWeatherRisk(weatherData);

    const newRow = document.createElement("tr");
    newRow.innerHTML = `
        <td>${name}</td>
        <td><span class="badge bg-primary">${
          risk.level === 1 ? "Day" : risk.level === 2 ? "Week" : "Month"
        }</span></td>
        <td><span class="badge bg-success">Active</span></td>
        <td><span class="badge ${risk.color}">${risk.message}</span></td>
    `;

    document.getElementById("monitoredLocationsTable").appendChild(newRow);

    const modal = new bootstrap.Modal(
      document.getElementById("addLocationModal")
    );
    modal.hide();

    document.getElementById("addLocationForm").reset();
  });
