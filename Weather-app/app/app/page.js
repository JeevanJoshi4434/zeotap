"use client";
import { WeatherHome } from "@/components/component/weather-home";
import { useAuth } from "@/lib/context/AuthProvider";
import Login from "./auth/page";

export default function Home() {
  const {authState} = useAuth();
  return  authState.Authorize ? <WeatherHome /> : <Login />;
}
