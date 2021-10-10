const DBCTRL = (() => {
  const PUBLIC_API_ENDPOINT = "https://geo.ipify.org/api/v2/country,city";
  const PUBLIC_API_KEY = "at_ijiJlgIqz8KVtv2dR6O2cLluakagH";

  state = {
    ip: "",
    isp: "",
    location: {},
  };

  const setState = (data) => (state = { ...state, ...data });

  const fetchApi = async (value) => {
    let ipRegex = /[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}/;
    let domainRegex =
      /[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+/;
    let ip = value?.match(ipRegex);
    let domain = value?.match(domainRegex);

    const res = await fetch(
      `${PUBLIC_API_ENDPOINT}?apiKey=${PUBLIC_API_KEY}&ipAddress=${
        ip || ""
      }&domain=${domain || ""}`
    );
    return await res.json();
  };

  return {
    setState,
    getState: () => state,
    fetchApi,
  };
})();

const UICTRL = (() => {
  const domElements = {
    map: document.querySelector("#map"),
    searchForm: document.querySelector(".main-header__form"),
    searchInput: document.querySelector(".main-header__form #searchInput"),
    ip: document.querySelector("#ip"),
    location: document.querySelector("#location"),
    timezone: document.querySelector("#timezone"),
    isp: document.querySelector("#isp"),
    loader: document.querySelector("#loader"),
  };

  const setUILoading = (bool) => {
    if (bool) domElements.loader.classList.add("active");
    else domElements.loader.classList.remove("active");
  };

  const setUIContent = (data) => {
    const { ip, isp, location } = data;
    domElements.ip.innerText = ip;
    domElements.location.innerText = `${
      location?.city ? location.city + "," : ""
    } ${location?.region} ${location?.postalCode || location?.country}`;
    domElements.isp.innerText = isp;
    domElements.timezone.innerText = `${"UTC" + location?.timezone || ""}`;
    updateUIMap(location);
  };

  const updateUIMap = ({
    lat,
    lng,
    city,
    region,
    country,
    postalCode,
    timezone,
  }) => {
    myMap.flyTo([lat, lng]);
    const popupContent = `
      ${city ? city + "," : city} ${region}
      <br />
      ${postalCode || country}
      <br />
      ${timezone}
    `;
    const marker = L.marker([lat, lng], markerOptions).addTo(myMap);
    marker.bindPopup(popupContent);
  };

  return {
    domElements,
    setUILoading,
    setUIContent,
    updateUIMap,
  };
})();

const APPCTRL = ((ui, db) => {
  const handleFetchApiData = (val) => {
    ui.setUILoading(true);
    db.fetchApi(val)
      .then((data) => {
        db.setState(data);
        ui.setUIContent(data);
      })
      .catch((err) => {
        window.alert(`Sorry, it seems like my puplic api_key is Expired!`);
      })
      .finally(() => {
        ui.setUILoading(false);
      });
  };
  document.addEventListener("DOMContentLoaded", () => {
    handleFetchApiData();
  });

  ui.domElements.searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const searchValue = ui.domElements.searchInput.value?.trim();
    handleFetchApiData(searchValue);
  });
})(UICTRL, DBCTRL);
