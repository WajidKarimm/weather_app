import { useState, useEffect } from 'react';
import { getRecords, createRecord, updateRecord, deleteRecord, getExportUrl } from '../api';
import { formatTemp, getWeatherIcon } from '../utils/weather';

export default function RecordsPanel() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({ location: '', start_date: '', end_date: '' });

  const loadRecords = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getRecords();
      setRecords(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRecords(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (editingId) {
        await updateRecord(editingId, {
          location_query: form.location,
          start_date: form.start_date,
          end_date: form.end_date,
        });
      } else {
        await createRecord(form);
      }
      setForm({ location: '', start_date: '', end_date: '' });
      setShowForm(false);
      setEditingId(null);
      loadRecords();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (record) => {
    setForm({
      location: record.location_query,
      start_date: record.start_date,
      end_date: record.end_date,
    });
    setEditingId(record.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this record?')) return;
    try {
      await deleteRecord(id);
      loadRecords();
    } catch (err) {
      setError(err.message);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

  return (
    <section className="records-panel card" aria-label="Saved weather records">
      <div className="records-header">
        <h3>Saved Records (CRUD)</h3>
        <div className="records-actions">
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ location: '', start_date: today, end_date: nextWeek }); }}>
            {showForm ? 'Cancel' : '+ Save Query'}
          </button>
          <ExportDropdown />
        </div>
      </div>

      {error && <div className="error-alert inline" role="alert"><p>{error}</p></div>}

      {showForm && (
        <form className="record-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label>
              Location
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="City, zip, coordinates…"
                required
              />
            </label>
            <label>
              Start Date
              <input
                type="date"
                value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                required
              />
            </label>
            <label>
              End Date
              <input
                type="date"
                value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                required
              />
            </label>
          </div>
          <button type="submit" className="btn btn-primary btn-sm">
            {editingId ? 'Update Record' : 'Create Record'}
          </button>
        </form>
      )}

      {loading ? (
        <p className="loading-text">Loading records…</p>
      ) : records.length === 0 ? (
        <p className="empty-text">No saved records yet. Create one to persist weather data.</p>
      ) : (
        <div className="records-list">
          {records.map((r) => (
            <article key={r.id} className="record-item">
              <div className="record-main">
                <span className="record-icon" aria-hidden="true">
                  {getWeatherIcon(r.forecast_data?.[0]?.weatherCode ?? 0)}
                </span>
                <div>
                  <strong>{r.location_name}{r.country ? `, ${r.country}` : ''}</strong>
                  <p className="record-meta">
                    {r.start_date} → {r.end_date} · {formatTemp(r.current_temp)} · {r.weather_description}
                  </p>
                  {r.temperatures?.length > 0 && (
                    <p className="record-temps">
                      {r.temperatures.length} day(s) of temperature data stored
                    </p>
                  )}
                </div>
              </div>
              <div className="record-btns">
                <button type="button" className="btn btn-sm" onClick={() => handleEdit(r)}>Edit</button>
                <button type="button" className="btn btn-sm btn-danger" onClick={() => handleDelete(r.id)}>Delete</button>
              </div>
              {r.map_data && (
                <div className="record-extras">
                  <strong>Map:</strong>{' '}
                  <a href={r.map_data.googleMapsUrl} target="_blank" rel="noopener noreferrer">Google Maps</a>
                  {' · '}
                  <a href={r.map_data.openStreetMapUrl} target="_blank" rel="noopener noreferrer">OpenStreetMap</a>
                </div>
              )}
              {r.youtube_videos?.videos?.length > 0 ? (
                <div className="record-extras">
                  <strong>YouTube:</strong>{' '}
                  {r.youtube_videos.videos.map((v) => (
                    <a key={v.videoId} href={v.url} target="_blank" rel="noopener noreferrer">{v.title}</a>
                  ))}
                </div>
              ) : r.youtube_videos?.searchUrl ? (
                <div className="record-extras">
                  <strong>YouTube:</strong>{' '}
                  <a href={r.youtube_videos.searchUrl} target="_blank" rel="noopener noreferrer">
                    Search travel videos for {r.location_name}
                  </a>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function ExportDropdown() {
  const formats = ['json', 'csv', 'xml', 'markdown', 'pdf'];
  return (
    <div className="export-dropdown">
      <label htmlFor="export-select">Export:</label>
      <select
        id="export-select"
        defaultValue=""
        onChange={(e) => {
          if (e.target.value) {
            window.open(getExportUrl(e.target.value), '_blank');
            e.target.value = '';
          }
        }}
      >
        <option value="" disabled>Choose format</option>
        {formats.map((f) => (
          <option key={f} value={f}>{f.toUpperCase()}</option>
        ))}
      </select>
    </div>
  );
}
