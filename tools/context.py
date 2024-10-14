"""
title: Context
description: Gives context information like date, time, username, weather. API key needs to be set in valves
author: chris
author_url: https://github.com/cp0153
funding_url: https://github.com/open-webui
version: 0.1
"""

from typing import Optional
from datetime import datetime, timedelta
import pytz
from pydantic import BaseModel, Field
import requests


class Filter:
    class Valves(BaseModel):
        TIMEZONE: str = Field(
            default="America/Montreal",
            description="The timezone to use for current time calculations.",
        )
        LAT: int = Field(
            default=42.38055,
            description="latitude of Union Sq, Somerville, MA",
        )
        LON: int = Field(
            default=-71.0952,
            description="longitude of Union Sq, Somerville, MA",
        )
        OPENWEATHER_API_KEY: str = Field(
            default="",
            description="https://home.openweathermap.org/ api key",
        )
        UNITS: str = Field(
            default="imperial",
            description="The units to use for weather API request.",
        )

    def __init__(self):
        # Indicates custom file handling logic. This flag helps disengage default routines in favor of custom
        # implementations, informing the WebUI to defer file-related operations to designated methods within this class.
        # Alternatively, you can remove the files directly from the body in from the inlet hook
        # self.file_handler = True

        # Initialize 'valves' with specific configurations. Using 'Valves' instance helps encapsulate settings,
        # which ensures settings are managed cohesively and not confused with operational flags like 'file_handler'.
        self.valves = self.Valves()

    def get_current_time(self) -> str:
        """
        Get the current time in a more human-readable format.
        :return: The current time.
        """
        timezone = pytz.timezone(self.valves.TIMEZONE)
        now = datetime.now(timezone)
        current_time = now.strftime("%H:%M:%S")
        current_date = now.strftime("%A, %B %d, %Y")
        result = f"Current Date is {current_date}, current time is {current_time}."

        return result

    def format_date(self, timestamp: int) -> str:
        """
        Convert a Unix timestamp to a readable date format.
        """
        # Convert timestamp to datetime object
        dt_object = datetime.utcfromtimestamp(timestamp)

        # Format the datetime object into a readable string
        return dt_object.strftime("%A, %B %d, %Y, %I:%M %p")

    def get_lat_lon_from_city(self, city_name: str) -> Optional[tuple]:
        """
        Get the latitude and longitude for a given city name using the OpenWeatherMap Geocoding API.
        If no city name is provided, use the default latitude and longitude from the valves.
        """
        if not city_name:
            # Return the default lat/lon if no city is provided
            return self.valves.LAT, self.valves.LON

        api_key = self.valves.OPENWEATHER_API_KEY
        if not api_key:
            return None

        base_url = "http://api.openweathermap.org/geo/1.0/direct"
        params = {
            "q": city_name,
            "appid": api_key,
            "limit": 1,  # Limit results to the first city found
        }

        try:
            response = requests.get(base_url, params=params)
            response.raise_for_status()
            data = response.json()

            if not data:
                return None  # No city found
            lat = data[0]["lat"]
            lon = data[0]["lon"]

            return lat, lon

        except requests.RequestException as e:
            print(f"Error fetching location data: {str(e)}")
            return None

    def get_weather_forecast(self, city_name: Optional[str] = None) -> str:
        """
        Get the weather forecast for a given city by its name.
        If no city name is provided, it uses the default latitude and longitude from the valves.
        """
        location = self.get_lat_lon_from_city(city_name)
        if location is None:
            return f"Could not find the location for {city_name}. Please try again."

        lat, lon = location

        api_key = self.valves.OPENWEATHER_API_KEY
        if not api_key:
            return (
                "API key is not set in the environment variable 'OPENWEATHER_API_KEY'."
            )

        base_url = "https://api.openweathermap.org/data/2.5/forecast"
        params = {
            "lat": lat,
            "lon": lon,
            "appid": api_key,
            "units": self.valves.UNITS,
        }

        try:
            response = requests.get(base_url, params=params)
            response.raise_for_status()  # Raise HTTPError for bad responses (4xx and 5xx)
            data = response.json()

            if data.get("cod") != "200":
                return f"Error fetching weather forecast: {data.get('message')} {data.get('cod')}"

            # Construct a human-readable forecast
            readable_forecast = []
            for item in data["list"][:5]:  # Limiting to the next 5 timestamps
                date_time = self.format_date(item["dt"])
                weather_desc = item["weather"][0]["description"].capitalize()
                temp = f"{item['main']['temp']}°F"
                humidity = f"{item['main']['humidity']}%"
                wind_speed = f"{item['wind']['speed']} mph"

                forecast_text = (
                    f"At {date_time}, the weather will be {weather_desc} with a temperature of "
                    f"{temp}. Humidity will be {humidity}, and wind speed will be {wind_speed}."
                )
                readable_forecast.append(forecast_text)

            forecast_output = "\n\n".join(readable_forecast)
            return forecast_output

        except requests.RequestException as e:
            return f"Error fetching weather forecast: {str(e)}"

    def inlet(self, body: dict, __user__: Optional[dict] = None) -> dict:
        context_parts = []

        # Add user name to the context.
        if __user__ is not None:
            context_parts.append(f"User name is {__user__.get('name')}.")

        # Add current time to the context.
        filter_instance = Filter()
        context_parts.append(filter_instance.get_current_time())

        # Add current weather and forecast.
        # context_parts.append(filter_instance.get_weather_forecast())

        # Combine context into a single string and inject into the first message.
        inject = " ".join(context_parts)
        messages = body.get("messages", [])
        if messages:
            messages[0]["content"] = inject + " " + messages[0]["content"]

        return body

    def outlet(self, body: dict, __user__: Optional[dict] = None) -> dict:
        # Modify or analyze the response body after processing by the API.
        # This function is the post-processor for the API, which can be used to modify the response.

        # Log for debugging purposes
        print(f"outlet:{__name__}")
        print(f"outlet:body:{body}")
        print(f"outlet:user:{__user__}")

        # Check if user asked for weather data in the response
        if any(
            "weather" in message.get("content", "").lower()
            for message in body.get("messages", [])
        ):
            filter_instance = Filter()
            weather_forecast = filter_instance.get_weather_forecast()

            # Add weather information to the response.
            if "choices" in body:
                for choice in body["choices"]:
                    if "text" in choice:
                        choice["text"] += "\n\n" + weather_forecast

        return body
