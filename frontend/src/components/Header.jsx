import { useLocation, useNavigate, useParams } from "react-router";
import { useState } from "react";
import { useForecastContext } from "../contexts/ForecastContext";
import SelectButton from "./SelectButton";
import generateServiceColor from "../utils/serviceColorGenerator";
import useFetch from "../hooks/useFetch";
import useDebounce from "../hooks/useDebounce";

const Header = () => {
  const [partialCity, setPartialCity] = useState("");

  const debouncedPartialCity = useDebounce(partialCity.trim());
  const shouldFetchPartialCity = debouncedPartialCity.trim();

  const {
    data: optionsData,
    loading: loadingCityOptions,
    error: errorCityOptions,
  } = useFetch(
    `partial_city_helper?partial_city=${debouncedPartialCity}`,
    shouldFetchPartialCity
  );

  const { city, setUsedAPIs, availableAPIs, usedAPIs, forecast } =
    useForecastContext();

  const navigate = useNavigate();

  const location = useLocation();

  const { date } = useParams();

  const isDayOpened = !!date;
  const isDynamicsPage = location.pathname.includes("/dynamics");
  let resultAPIs = [];

  if (forecast) {
    const firstDay = Object.keys(forecast)[0];
    const indicators = forecast[firstDay].indicators;

    Object.values(indicators).forEach((APIGroup) => {
      Object.keys(APIGroup).forEach((API) => {
        if (!resultAPIs.includes(API)) {
          resultAPIs.push(API);
        }
      });
    });
  }

  const onOptionClick = (option) => {
    setPartialCity("");

    navigate(`/${option}`);
  };

  const OnAPIButtonClicked = (e) => {
    if (e.target.checked) {
      setUsedAPIs((prev) => [...prev, e.target.id]);
    } else if (usedAPIs.length > 1) {
      setUsedAPIs((prev) => prev.filter((API) => API !== e.target.id));
    }
  };

  return (
    <header className="flex justify-around gap-2 mt-5 mb-12">
      <div className="flex-1">
        {isDayOpened && (
          <SelectButton onClick={() => navigate(`/${city}`)}>
            <h1 className="w-12 text-xs sm:w-28 sm:text-sm lg:text-lg lg:w-32">
              Back to daily forecast
            </h1>
          </SelectButton>
        )}
      </div>

      <div className="flex flex-col items-center flex-[4]">
        <input
          className="p-0.5 border border-black rounded-lg w-2/3 sm:w-auto"
          type="text"
          placeholder="City name"
          onChange={(e) => setPartialCity(e.target.value)}
          value={partialCity}
        />

        <div className="flex flex-col gap-1 mt-1 text-center">
          {loadingCityOptions && <div>Loading...</div>}

          {errorCityOptions && <div>Error: {errorCityOptions}</div>}

          {partialCity.trim() &&
            [...new Set(optionsData?.options)].map((option) => (
              <SelectButton key={option} onClick={() => onOptionClick(option)}>
                {option}
              </SelectButton>
            ))}
        </div>

        <div className="flex flex-col gap-2 mt-3">
          {availableAPIs.length > 0 ? (
            availableAPIs.map((API) => (
              <div key={API}>
                <input
                  type="checkbox"
                  id={API}
                  className="scale-125 sm:scale-150"
                  checked={usedAPIs.includes(API)}
                  onChange={OnAPIButtonClicked}
                />
                <label htmlFor={API} className="m-2 text-xs sm:text-lg">
                  {API}
                </label>
              </div>
            ))
          ) : (
            <div>No APIs available</div>
          )}
        </div>

        {city.trim() && (
          <div>
            <h1 className="mt-5 text-2xl text-center">
              Weather for <span className="font-bold">{city}</span>
            </h1>

            <div className="flex justify-center gap-1 mt-2">
              <SelectButton
                onClick={() => navigate(`/${city}`)}
                selected={!isDynamicsPage}
              >
                Forecast
              </SelectButton>

              <SelectButton
                onClick={() => navigate(`/${city}/dynamics`)}
                selected={isDynamicsPage}
              >
                Dynamics
              </SelectButton>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1">
        {resultAPIs.map(
          (API) =>
            API !== "average" && (
              <h1
                key={API}
                style={{ backgroundColor: generateServiceColor(API) }}
                className="w-20 p-1 mt-1 overflow-scroll text-xs text-center rounded-2xl no-scrollbar sm:text-sm sm:w-auto lg:text-lg"
              >
                {API}
              </h1>
            )
        )}
      </div>
    </header>
  );
};

export default Header;
