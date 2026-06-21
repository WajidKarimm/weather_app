import { Router } from 'express';
import db from '../db.js';
import {
  geocodeLocation,
  reverseGeocode,
  fetchCurrentWeather,
  fetchHistoricalTemperatures,
  formatForecast,
  formatTemperatureSeries,
  getWeatherDescription,
  fetchYouTubeVideos,
  getMapData,
} from '../services/weatherService.js';
import { validateDateRange, validateLocationQuery, validateUpdatePayload } from '../utils/validation.js';
import { parseRecord, serializeForDb } from '../utils/export.js';

const router = Router();

router.get('/current', async (req, res) => {
  try {
    const { location, lat, lon } = req.query;

    let geo;
    if (lat && lon) {
      geo = await reverseGeocode(parseFloat(lat), parseFloat(lon));
      geo.latitude = parseFloat(lat);
      geo.longitude = parseFloat(lon);
    } else if (location) {
      const locCheck = validateLocationQuery(location);
      if (!locCheck.valid) {
        return res.status(400).json({ error: locCheck.errors.join(' ') });
      }
      geo = await geocodeLocation(location);
    } else {
      return res.status(400).json({ error: 'Provide location query or lat/lon coordinates.' });
    }

    const weather = await fetchCurrentWeather(geo.latitude, geo.longitude);
    const current = weather.current;
    const forecast = formatForecast(weather.daily);

    res.json({
      location: {
        name: geo.name,
        country: geo.country,
        admin1: geo.admin1,
        latitude: geo.latitude,
        longitude: geo.longitude,
      },
      current: {
        temperature: current.temperature_2m,
        feelsLike: current.apparent_temperature,
        humidity: current.relative_humidity_2m,
        windSpeed: current.wind_speed_10m,
        windDirection: current.wind_direction_10m,
        pressure: current.surface_pressure,
        weatherCode: current.weather_code,
        description: getWeatherDescription(current.weather_code),
      },
      forecast,
      timezone: weather.timezone,
      map: getMapData(geo),
    });
  } catch (err) {
    const status = err.message.includes('not found') ? 404 : 502;
    res.status(status).json({ error: err.message });
  }
});

router.post('/records', async (req, res) => {
  try {
    const { location, start_date, end_date } = req.body;

    const locCheck = validateLocationQuery(location);
    if (!locCheck.valid) {
      return res.status(400).json({ error: locCheck.errors.join(' ') });
    }

    const dateCheck = validateDateRange(start_date, end_date);
    if (!dateCheck.valid) {
      return res.status(400).json({ error: dateCheck.errors.join(' ') });
    }

    const geo = await geocodeLocation(location);
    const [weather, historical] = await Promise.all([
      fetchCurrentWeather(geo.latitude, geo.longitude),
      fetchHistoricalTemperatures(geo.latitude, geo.longitude, start_date, end_date),
    ]);

    const temperatures = formatTemperatureSeries(historical.daily);
    const forecast = formatForecast(weather.daily);
    const youtubeVideos = await fetchYouTubeVideos(geo.name, process.env.YOUTUBE_API_KEY);
    const mapData = getMapData(geo);
    const current = weather.current;

    const record = {
      location_query: location.trim(),
      location_name: geo.name,
      latitude: geo.latitude,
      longitude: geo.longitude,
      country: geo.country,
      start_date,
      end_date,
      temperatures,
      current_temp: current.temperature_2m,
      humidity: current.relative_humidity_2m,
      wind_speed: current.wind_speed_10m,
      weather_description: getWeatherDescription(current.weather_code),
      forecast_data: forecast,
      youtube_videos: youtubeVideos,
      map_data: mapData,
      wikipedia_summary: null,
    };

    const serialized = serializeForDb(record);
    const stmt = db.prepare(`
      INSERT INTO weather_records (
        location_query, location_name, latitude, longitude, country,
        start_date, end_date, temperatures, current_temp, humidity,
        wind_speed, weather_description, forecast_data, youtube_videos,
        map_data, wikipedia_summary
      ) VALUES (
        @location_query, @location_name, @latitude, @longitude, @country,
        @start_date, @end_date, @temperatures, @current_temp, @humidity,
        @wind_speed, @weather_description, @forecast_data, @youtube_videos,
        @map_data, @wikipedia_summary
      )
    `);

    const result = stmt.run(serialized);

    res.status(201).json({
      id: result.lastInsertRowid,
      ...record,
    });
  } catch (err) {
    const status = err.message.includes('not found') ? 404 : 502;
    res.status(status).json({ error: err.message });
  }
});

router.get('/records', (req, res) => {
  const rows = db.prepare('SELECT * FROM weather_records ORDER BY created_at DESC').all();
  res.json(rows.map(parseRecord));
});

router.get('/records/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM weather_records WHERE id = ?').get(req.params.id);
  if (!row) {
    return res.status(404).json({ error: 'Record not found.' });
  }
  res.json(parseRecord(row));
});

router.put('/records/:id', async (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM weather_records WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Record not found.' });
    }

    const validation = validateUpdatePayload(req.body);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.errors.join(' ') });
    }

    let updates = { ...req.body };
    let geo = {
      latitude: existing.latitude,
      longitude: existing.longitude,
      name: existing.location_name,
      country: existing.country,
    };

    if (updates.location_query) {
      geo = await geocodeLocation(updates.location_query);
      updates.location_name = geo.name;
      updates.latitude = geo.latitude;
      updates.longitude = geo.longitude;
      updates.country = geo.country;
    }

    const locationChanged = Boolean(updates.location_query);
    const datesChanged = Boolean(updates.start_date && updates.end_date);

    if (datesChanged) {
      const historical = await fetchHistoricalTemperatures(
        geo.latitude,
        geo.longitude,
        updates.start_date,
        updates.end_date
      );
      updates.temperatures = formatTemperatureSeries(historical.daily);
    }

    if (locationChanged || datesChanged) {
      const weather = await fetchCurrentWeather(geo.latitude, geo.longitude);
      updates.current_temp = weather.current.temperature_2m;
      updates.humidity = weather.current.relative_humidity_2m;
      updates.wind_speed = weather.current.wind_speed_10m;
      updates.weather_description = getWeatherDescription(weather.current.weather_code);
      updates.forecast_data = formatForecast(weather.daily);
      updates.map_data = getMapData(geo);
      updates.youtube_videos = await fetchYouTubeVideos(geo.name, process.env.YOUTUBE_API_KEY);
    }

    const fields = Object.keys(updates);
    const setClause = fields.map((f) => `${f} = @${f}`).join(', ');
    const serialized = serializeForDb({ ...parseRecord(existing), ...updates });

    db.prepare(
      `UPDATE weather_records SET ${setClause}, updated_at = datetime('now') WHERE id = @id`
    ).run({ ...serialized, id: req.params.id });

    const updated = db.prepare('SELECT * FROM weather_records WHERE id = ?').get(req.params.id);
    res.json(parseRecord(updated));
  } catch (err) {
    const status = err.message.includes('not found') ? 404 : 502;
    res.status(status).json({ error: err.message });
  }
});

router.delete('/records/:id', (req, res) => {
  const result = db.prepare('DELETE FROM weather_records WHERE id = ?').run(req.params.id);
  if (result.changes === 0) {
    return res.status(404).json({ error: 'Record not found.' });
  }
  res.json({ message: 'Record deleted successfully.', id: Number(req.params.id) });
});

export default router;
