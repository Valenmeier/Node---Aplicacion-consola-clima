import fs from "fs";
import axios from "axios";
export class Busquedas {
  historial = [];
  dbPath = "./db/database.json";

  constructor() {
    this.leerDB();
  }
  get paramsMapbox() {
    return {
      language: "es",
      access_token: process.env.MAPBOX_KEY,
      limit: 5,
    };
  }
  get paramsWheater() {
    return {
      appid: process.env.OPENWEATHER_KEY,
      units: `metric`,
      lang: "es",
    };
  }
  get historialCapitalizado() {
    // Capitalizar
    const capitalizar = this.historial.map((lugar) => {
      let palabras = lugar.split(" ");
      palabras = palabras.map(
        (palabra) => palabra[0].toUpperCase() + palabra.substring(1)
      );
      return palabras.join(" ");
    });

    return capitalizar;
  }

  async ciudad(lugar = "") {
    //petición http
    try {
      const instance = axios.create({
        baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${lugar}.json`,
        params: this.paramsMapbox,
      });

      const resp = await instance.get();
      return resp.data.features.map((lugar) => ({
        id: lugar.id,
        nombre: lugar.place_name,
        lng: lugar.center[0],
        lat: lugar.center[1],
      }));
    } catch (error) {
      return [];
    }
  }

  async climaLugar(lat, lon) {
    try {
      const instance = axios.create({
        baseURL: `https://api.openweathermap.org/data/2.5/weather`,
        params: { ...this.paramsWheater, lat, lon },
      });

      const resp = await instance.get();
      const { main, weather } = resp.data;

      return {
        temp: main.temp,
        min: main.temp_min,
        max: main.temp_max,
        desc: weather[0].description,
      };
    } catch (error) {
      return console.log(error);
    }
  }

  agregarHistorial(lugar = "") {
    //duplicidad
    if (this.historial.includes(lugar.toLocaleLowerCase())) {
      return;
    } else {
      this.historial.unshift(lugar.toLocaleLowerCase());
    }
    //grabar en DB
    this.guardarDB();
  }

  guardarDB() {
    const payload = {
      historial: this.historial,
    };
    fs.writeFileSync(this.dbPath, JSON.stringify(payload));
  }
  leerDB() {
    if (fs.existsSync(this.dbPath)) {
      const historial = JSON.parse(
        fs.readFileSync(this.dbPath, { encoding: "utf-8" })
      );

      this.historial = historial.historial;
    }
  }
}
