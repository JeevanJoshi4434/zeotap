"use client";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { convertUnixToDate, getDateTime, getTimeOnly } from "../utils/functions";
import { useAuth } from "@/lib/context/AuthProvider";


const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];


export function WeatherHome() {
  let todayTitle = "Today's Temperatures";
  const [location, setLocation] = useState({ lat: null, lon: null });
  const [error, setError] = useState(null);

  const { authState } = useAuth();

  const WEATHER_API_KEY = authState.OpenMapAPI;

  const [settings, setSettings] = useState({
    fahrenheit: false,
    threshold: 35.0
  })
  const [data, setData] = useState({
    temp: null,
    humidity: null,
    feels_like: null,
    pressure: null,
    maxTemp: null,
    minTemp: null,
    windSpeed: null,
    weatherMain: null,
    weatherDescription: null,
    loading: true,
    currentData: null
  });

  const [metroData, setMetroData] = useState({
    delhi: null,
    mumbai: null,
    bangalore: null,
    chennai: null,
    hyderabad: null,
    kolkata: null,
  })

  const [lastUpdated, setLastUpdated] = useState(null);


  async function fetchMetroCityWeather() {

    const res = await fetch("https://api.openweathermap.org/data/2.5/weather?q=delhi&appid=" + WEATHER_API_KEY + "&units=metric");
    const res2 = await fetch("https://api.openweathermap.org/data/2.5/weather?q=mumbai&appid=" + WEATHER_API_KEY + "&units=metric");
    const res3 = await fetch("https://api.openweathermap.org/data/2.5/weather?q=bangalore&appid=" + WEATHER_API_KEY + "&units=metric");
    const res4 = await fetch("https://api.openweathermap.org/data/2.5/weather?q=chennai&appid=" + WEATHER_API_KEY + "&units=metric");
    const res5 = await fetch("https://api.openweathermap.org/data/2.5/weather?q=hyderabad&appid=" + WEATHER_API_KEY + "&units=metric");
    const res6 = await fetch("https://api.openweathermap.org/data/2.5/weather?q=kolkata&appid=" + WEATHER_API_KEY + "&units=metric");
    const data = await res.json();
    const data2 = await res2.json();
    const data3 = await res3.json();
    const data4 = await res4.json();
    const data5 = await res5.json();
    const data6 = await res6.json();
    setMetroData({
      delhi: data,
      mumbai: data2,
      bangalore: data3,
      chennai: data4,
      hyderabad: data5,
      kolkata: data6
    });
    setLastUpdated(new Date().toLocaleTimeString());
  }

  const [forecastData, setForecastData] = useState(null);


  async function forecast(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`;
    const response = await fetch(url);
    const data = await response.json();

    console.log(data);
    setForecastData(data);
  }

  async function fetchCurrentWeather(lat, lon) {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`
      );
      const data = await response.json();
      console.log(data);

      setData({
        temp: data.main.temp,
        humidity: data.main.humidity,
        feels_like: data.main.feels_like,
        pressure: data.main.pressure,
        maxTemp: data.main.temp_max,
        minTemp: data.main.temp_min,
        windSpeed: data.wind.speed,
        weatherMain: data.weather[0].main,
        weatherDescription: data.weather[0].description,
        loading: false,
        currentData: data
      });
    } catch (error) {
      setError("Failed to fetch weather data.");
    }
  }

  useEffect(() => {
    if (!authState.Authorize || !authState.OpenMapAPI.length > 0) {
      // redirect to login page
      window.location.href = "/auth";
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
          fetchCurrentWeather(
            position.coords.latitude,
            position.coords.longitude
          );

          fetchMetroCityWeather();
          forecast(position.coords.latitude, position.coords.longitude);

          const interval = setInterval(() => {
            fetchCurrentWeather(position.coords.latitude, position.coords.longitude);
            fetchMetroCityWeather();
          }, 300000);

          return () => clearInterval(interval);
        },
        (err) => {
          setError(err.message);
        }
      );
    } else {
      setError("Geolocation is not supported by this browser.");
    }
  }, []);



  const changeTemp = (fr) => {
    if (settings.fahrenheit === fr) return;
    setSettings({ ...settings, fahrenheit: fr });
  }


  if (data.loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-background text-foreground p-6 rounded-lg shadow-lg w-full max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
        <div className="flex flex-col items-center md:items-start">
          <div className="text-6xl flex font-bold">
            <span className={`${settings.threshold <= data.temp ? 'text-red-600' : 'text-primary'}`}>{<TempText fahrenheit={settings.fahrenheit} Num={data.temp} />}</span>
            <span className="text-muted-foreground flex">&deg;{settings.fahrenheit ? 'F' : 'C'}</span>
          </div>
          <div className="text-2xl font-medium text-muted-foreground">{data.currentData.weather[0].main} <br /> <span className="text-muted-foreground text-xs">{data.currentData.weather[0].description} | {data.currentData.name}, {data.currentData.sys.country}</span></div>
          <div className="text-sm text-muted-foreground">{`Last updated: ${getTimeOnly(convertUnixToDate(data.currentData.dt))}`}</div>
        </div>
        <div className="flex flex-col items-center md:items-end gap-2">
          <div className="flex items-center gap-2">
            <Button onClick={() => changeTemp(false)} variant="ghost" className={` ${!settings.fahrenheit && ' bg-gray-200'} p-1 `} size="icon">
              <ThermometerIcon className="h-6 w-6" /> &deg;C
            </Button>
            <Button variant="ghost" onClick={() => changeTemp(true)} size="icon" className={` ${settings.fahrenheit && ' bg-gray-200'} p-1 `}>
              <ThermometerIcon className="h-6 w-6" />&deg;F
            </Button>
          </div>
          <div className="text-muted-foreground flex items-center "> Feels like {<TempText fahrenheit={settings.fahrenheit} Num={data.feels_like} />} &deg; {settings.fahrenheit ? 'F' : 'C'}</div>
        </div>
      </div>
      <Separator className="my-6" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex flex-col gap-2">
          <div className="text-sm font-medium text-muted-foreground">{todayTitle}</div>
          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col items-center">
              <div className={`${settings.threshold <= data.temp && 'text-red-600'} flex text-2xl font-bold`}>{<TempText fahrenheit={settings.fahrenheit} Num={data.temp} />}&deg;</div>
              <div className="text-sm text-muted-foreground">Current</div>
            </div>
            <div className="flex flex-col items-center">
              <div className={`${settings.threshold <= data.maxTemp && 'text-red-600'} flex text-2xl font-bold`}>{<TempText fahrenheit={settings.fahrenheit} Num={data.maxTemp} />}&deg;</div>
              <div className="text-sm text-muted-foreground">Max</div>
            </div>
            <div className="flex flex-col items-center">
              <div className={`${settings.threshold <= data.minTemp && 'text-red-600'} flex text-2xl font-bold`}>{<TempText fahrenheit={settings.fahrenheit} Num={data.minTemp} />}&deg;</div>
              <div className="text-sm text-muted-foreground">Min</div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="text-sm font-medium text-muted-foreground">Weather Conditions</div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div>Humidity</div>
              <div className="text-2xl font-bold">{data.humidity}%</div>
            </div>
            <div className="flex items-center justify-between">
              <div>Wind Speed</div>
              <div className="text-2xl font-bold">{data.windSpeed} m/s</div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="text-sm font-medium text-muted-foreground">Temperature Preferences</div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div>Alert Threshold</div>
              <Input type="number" onChange={(e) => setSettings({ ...settings, threshold: e.target.value })} value={settings.threshold} className="w-20 h-8 text-right" />
            </div>
          </div>
        </div>

      </div>
      <Separator className="my-6" />
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {
          forecastData &&
          forecastData.list?.slice(0, 5)?.map((item, index) => (
            <ForecastCard data={item} key={index} settings={settings} />
          ))
        }
      </div>

      <Separator className="my-6" />
      <div className="grid grid-cols-1 items-center justify-between">
        <div className="text-sm font-medium text-muted-foreground">Metro Area Temperature</div>
        <div className="flex items-center hide-scrollbar overflow-x-auto gap-2 p-2">
          <MetroCard fr={settings.fahrenheit} src={"/image/delhi.jpeg"} alt={"delhi"} obj={metroData.delhi} />
          <MetroCard fr={settings.fahrenheit} src={"/image/chennai.png"} alt={"Chennai"} obj={metroData.chennai} />
          <MetroCard fr={settings.fahrenheit} src={"/image/bangalore.png"} alt={"bangalore"} obj={metroData.bangalore} />
          <MetroCard fr={settings.fahrenheit} src={"/image/hyderabad.png"} alt={"Hyderabad"} obj={metroData.hyderabad} />
          <MetroCard fr={settings.fahrenheit} src={"/image/kolkata.png"} alt={"kolkata"} obj={metroData.kolkata} />
          <MetroCard fr={settings.fahrenheit} src={"/image/mumbai.png"} alt={"mumbai"} obj={metroData.mumbai} />
        </div>
      </div>
    </div>
  );
}


const ForecastCard = ({ data, settings }) => {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`${settings.threshold <= data.main.temp && 'text-red-600'} flex text-2xl font-bold`}>{<TempText fahrenheit={settings.fahrenheit} Num={data.main.temp} />}&deg;</div>
      <div className="text-sm text-muted-foreground">{getDateTime(convertUnixToDate(data.dt))}</div>
      <div className="text-sm text-muted-foreground">{data.weather[0].description}</div>
    </div>
  )
}


const MetroCard = ({ src = "", alt = "", obj, fr=false }) => {
  if(obj !== null)
  return (
    <>
      <div className=" min-w-64 shadow-md rounded-lg p-2">
        <img src={src} className=" aspect-[7/4] w-60 rounded-md object-cover" alt={alt} />
        <p className=" text-2xl flex mt-2"> <p className=" text-4xl"><TempText fahrenheit={fr} Num={obj.main.temp} /></p>&deg;{fr ? 'F' : 'C'}</p>
        <p className="flex items-center text-muted-foreground"><p className=" text-black font-semibold mx-1">{daysOfWeek[new Date().getDay()]},</p>{getTimeOnly(convertUnixToDate(obj.dt))}</p>
        <Separator className="my-3" />
        <p className="flex items-center"><Cloud /> <span className="ml-2 font-semibold text-muted-foreground">{obj.weather[0].description}</span></p>
      </div>
    </>
    
  )
}


function ThermometerIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z" />
    </svg>
  )
}


const TempText = ({ fahrenheit = false, Num = 0 }) => {
  return fahrenheit ? <p> {Math.round(Num * 1.8 + 32)} </p> : <>{Math.round(Num)}</>;
}

const Cloud = () => {
  return <svg width="18px" height="18px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 14.3529C22 17.4717 19.4416 20 16.2857 20H11M14.381 9.02721C14.9767 8.81911 15.6178 8.70588 16.2857 8.70588C16.9404 8.70588 17.5693 8.81468 18.1551 9.01498M7.11616 11.6089C6.8475 11.5567 6.56983 11.5294 6.28571 11.5294C3.91878 11.5294 2 13.4256 2 15.7647C2 18.1038 3.91878 20 6.28571 20H7M7.11616 11.6089C6.88706 10.9978 6.7619 10.3369 6.7619 9.64706C6.7619 6.52827 9.32028 4 12.4762 4C15.4159 4 17.8371 6.19371 18.1551 9.01498M7.11616 11.6089C7.68059 11.7184 8.20528 11.9374 8.66667 12.2426M18.1551 9.01498C18.8381 9.24853 19.4623 9.60648 20 10.0614" stroke="#1C274C" stroke-width="1.5" stroke-linecap="round" />
    <path d="M11.0004 4C10.0882 2.78555 8.63582 2 7 2C4.23858 2 2 4.23858 2 7C2 9.05032 3.2341 10.8124 5 11.584" stroke="#1C274C" stroke-width="1.5" />
  </svg>;
}