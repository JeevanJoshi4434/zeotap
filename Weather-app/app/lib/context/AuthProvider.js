"use client";

import React, { createContext, useContext, useEffect, useReducer } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie'; // for handling cookies
import Cookies from 'js-cookie'; // alternative for setting cookie options

// Initial state with two fields: Authorize and OpenMapAPI
const initialState = {
  Authorize: false,
  OpenMapAPI: '',
};

// Create the AuthContext
const AuthContext = createContext({
  authState: initialState,
  dispatch: () => null,
});

// Reducer function to handle state updates
const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_API':
      return {
        ...state,
        Authorize: action.Authorize,
        OpenMapAPI: action.OpenMapAPI,
      };
    case 'LOGOUT':
      return initialState;
    default:
      return state;
  }
};

// Function to validate the OpenWeatherMap API key
const validateAPI = async (apiKey) => {
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=London&appid=${apiKey}`
    );
    return response.status === 200;
  } catch (error) {
    return false;
  }
};

// AuthProvider component
const AuthProvider = ({ children }) => {
  const [authState, dispatch] = useReducer(authReducer, initialState);
  const [cookies, setCookie] = useCookies(['Authorize', 'OpenMapAPI']);

  // Function to set data in cookies for 30 days
  const setAuthCookies = (Authorize, OpenMapAPI) => {
    const expires = 30;
    Cookies.set('Authorize', Authorize, { expires });
    Cookies.set('OpenMapAPI', OpenMapAPI, { expires });
  };

  // Check API validity when the app loads
  useEffect(() => {
    const apiKey = cookies.OpenMapAPI;
    if (apiKey) {
      validateAPI(apiKey).then((isValid) => {
        if (isValid) {
          dispatch({ type: 'SET_API', Authorize: true, OpenMapAPI: apiKey });
        } else {
          dispatch({ type: 'LOGOUT' });
        }
      });
    }
  }, [cookies]);

  // Function to handle LOGIN action with API check
  const login = async (apiKey) => {
    const isValid = await validateAPI(apiKey);
    if (isValid) {
      dispatch({ type: 'SET_API', Authorize: true, OpenMapAPI: apiKey });
      setAuthCookies(true, apiKey);
      return true;
    }
    return false;
  };

  return (
    <AuthContext.Provider value={{ authState, dispatch, login }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use AuthContext
const useAuth = () => {
  return useContext(AuthContext);
};

export { AuthProvider, useAuth };
