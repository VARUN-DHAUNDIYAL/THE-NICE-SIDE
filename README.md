# The Nice Side-Sun Seat Recommendation Web App

## Project Overview
This web application helps airline passengers choose the best seat (left or right side) to enjoy sunrise or sunset views during their flight. By entering your source and destination cities, flight departure time, and total flight duration, the app calculates the sun's position along your route and recommends the optimal side for the best view. It also provides an interactive map showing your flight path and the sun's real-time position.

---

## Features
- **User Inputs:**
  - Source City (with autocomplete)
  - Destination City (with autocomplete)
  - Flight Departure Date & Time
  - Total Flight Time (hours/minutes)
- **Outputs:**
  - Seat Recommendation (Left or Right side, with explanation)
  - Interactive Map Visualization (flight path, sun position, recommended side)
- **Works for:**
  - All major cities worldwide (with international airports)
  - Any date, month, year, and time
- **Assumptions:**
  - Flights between two cities follow the same air path
  - Flight time is provided by the user

---

## Technology Stack
| Feature         | Best Choice         | Alternatives         | Why Best?                        |
|-----------------|--------------------|----------------------|----------------------------------|
| Frontend        | React              | Vue, Svelte          | Ecosystem, mapping support       |
| Map             | Leaflet            | Mapbox, Google Maps  | Free, easy, open-source          |
| Sun Position    | suncalc            | API                  | Fast, local, accurate            |
| Geocoding       | Nominatim          | Mapbox, Google       | Free, no key, easy               |
| Styling         | Matrial Ui          | TailwindCSS          | Fast, modern, flexible           |

### Explanations
- **React:** Most popular frontend framework, large ecosystem, easy integration with mapping libraries.
- **Leaflet:** Lightweight, open-source, easy to use for interactive maps.
- **suncalc:** Local, fast, and accurate sun position calculations.
- **Nominatim (OpenStreetMap):** Free geocoding (city to coordinates), no API key required.
- **Material Ui:** Modern, utility-first CSS framework for custom and responsive design.



## System Architecture Diagram

```mermaid
graph TD
  A[User Input Form] --> B[Geocoding Service (Nominatim)]
  B --> C[Flight Path Calculation]
  C --> D[Sun Position Calculation (suncalc)]
  D --> E[Seat Recommendation Logic]
  C --> F[Map Visualization (Leaflet)]
  D --> F
  E --> G[Seat Recommendation Output]
  F --> H[Interactive Map Output]
  A --> G
  A --> H
```

---

## Why This App is Frontend-Only (No Backend Required)

This application is designed to be fully client-side, meaning all logic and calculations happen directly in your web browser. There is no backend server or database involved. Here's why this approach is ideal for the current project:

- **All Calculations are Local:**
  - Sun position, flight path, and seat recommendation logic are performed entirely in the browser using JavaScript libraries (such as suncalc and Leaflet).
- **Public APIs:**
  - Geocoding (city-to-coordinates) is handled by public APIs like OpenStreetMap Nominatim, which can be accessed directly from the browser for moderate usage.
- **No User Data Storage:**
  - The app does not require user accounts or saving any personal data. All user input is processed locally and is not stored or transmitted.
- **Privacy and Simplicity:**
  - Users' data never leaves their device, ensuring privacy and reducing complexity. There is no need to manage servers, databases, or backend security.

**When Would a Backend Be Needed?**
- If you want to add features like user accounts, saving routes, analytics, or notifications.
- If you need to handle very high volumes of geocoding requests (to avoid public API rate limits).
- If you need to use paid APIs that require secret keys (which should not be exposed in the frontend).

**Conclusion:**
For the current scope and features, a frontend-only app is not just sufficient, but optimal. You can always add a backend later if your requirements grow.

---

## Detailed System Architecture & Data Flow

1. **User Input Form:**
   - Users enter source city, destination city, departure date/time, and total flight time.
2. **Geocoding Service:**
   - The app uses the Nominatim API to convert city names into latitude and longitude coordinates.
3. **Flight Path Calculation:**
   - The app calculates the great-circle (shortest) path between the two cities, generating intermediate points along the route for each time step of the flight.
4. **Sun Position Calculation:**
   - For each point and time along the flight path, the app uses the suncalc library to determine the sun's azimuth (direction) and altitude (height above the horizon).
5. **Seat Recommendation Logic:**
   - By comparing the sun's position to the direction of the flight, the app determines whether the sun will be more visible from the left or right side of the plane during sunrise or sunset.
6. **Map Visualization:**
   - The app displays the flight path on an interactive map (Leaflet), overlays the sun's position, and highlights the recommended side for the best view.
7. **Outputs:**
   - The app presents a clear seat recommendation and an interactive map to the user.

---

## How the App Works (Step-by-Step)
1. **User opens the app** and sees a simple, friendly form.
2. **User enters:**
   - Source city (e.g., "New York")
   - Destination city (e.g., "London")
   - Flight departure date and time (e.g., "2024-07-01 18:00")
   - Total flight time (e.g., "7 hours")
3. **App geocodes** the cities to get their coordinates.
4. **App calculates** the flight path and divides it into time steps (e.g., every 10 minutes).
5. **For each time step:**
   - The app calculates the plane's position.
   - The app calculates the sun's position at that location and time.
   - The app determines if the sun is on the left or right side of the plane (relative to the direction of travel).
6. **App aggregates** the results to recommend the best side for sunrise/sunset views.
7. **App displays:**
   - A clear recommendation (e.g., "Sit on the left side for the best sunset views!")
   - An interactive map showing the flight path, sun position, and highlighted side.

---

## How to Run the Project
1. **Clone the repository** to your local machine.
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Start the development server:**
   ```bash
   npm run dev
   ```
4. **Open your browser** and go to `http://localhost:3000` (or the port shown in your terminal).

---

## Notes for Non-Technical Readers
- **What does this app do?**
  - It helps you pick the best seat on a plane to enjoy the sunrise or sunset, based on your flight details.
- **How does it work?**
  - It uses public data to figure out where the sun will be during your flight and tells you which side of the plane to sit on.
- **Is my data private?**
  - Yes! All calculations happen in your browser. No personal data is sent to any server.
- **Do I need to know anything about astronomy or geography?**
  - No! The app does all the hard work for you and gives you a simple answer.

---

## FAQ
- **Does this work for all flights?**
  - Yes, as long as you know your source and destination cities and flight time.
- **What if my city isn't found?**
  - Try entering a nearby major city or airport.
- **Can I use this for any date and time?**
  - Yes, the app works for any date, month, year, and time.

---

## Further Improvements (Ideas)
- Add support for more detailed flight paths (using real airline data)
- Show sunrise/sunset times at each point along the route
- Allow users to save or share their recommendations
- Add dark mode and accessibility features

---

## Contact & Credits
- Developed using open-source tools and data (OpenStreetMap, suncalc, Leaflet, React)
- For questions or feedback, please contact the project maintainer.

## Seat Recommendation Logic

1. The app calculates the great-circle path between the source and destination cities, dividing the route into time steps based on the total flight time.
2. For each point and time along the path:
   - The direction of travel (bearing) is calculated using the current and next point.
   - The sun's position (azimuth and altitude) is calculated using the suncalc library, which is based on precise astronomical algorithms.
   - The relative angle between the sun and the plane's heading is determined.
   - If the sun is to the left (relative angle 90°–270°), it counts as "left side"; if to the right (relative angle -90°–90°), as "right side."
   - Only times when the sun is above the horizon (altitude > 0) are considered.
3. The app aggregates the results and recommends the side with the most "sun time" for the best sunset/sunrise view.
4. If the sun is mostly in front or behind, or below the horizon, the app provides a suitable message.

**This logic is based on real-world aviation and astronomy principles, not just hypothetical rules. The great-circle path is the standard for long-haul flights, and the sun's position is calculated with high accuracy for any date, time, and location.** 