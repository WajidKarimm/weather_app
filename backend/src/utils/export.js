import PDFDocument from 'pdfkit';

export function toJSON(records) {
  return JSON.stringify(records, null, 2);
}

export function toCSV(records) {
  if (!records.length) return 'id,location_name,country,start_date,end_date,current_temp,humidity,wind_speed,weather_description,created_at\n';

  const headers = [
    'id', 'location_query', 'location_name', 'country', 'latitude', 'longitude',
    'start_date', 'end_date', 'current_temp', 'humidity', 'wind_speed',
    'weather_description', 'created_at', 'updated_at',
  ];

  const escape = (val) => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = records.map((r) => headers.map((h) => escape(r[h])).join(','));
  return [headers.join(','), ...rows].join('\n');
}

export function toXML(records) {
  const escapeXml = (str) =>
    String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

  const items = records
    .map(
      (r) => `  <record>
    <id>${r.id}</id>
    <location_query>${escapeXml(r.location_query)}</location_query>
    <location_name>${escapeXml(r.location_name)}</location_name>
    <country>${escapeXml(r.country)}</country>
    <latitude>${r.latitude}</latitude>
    <longitude>${r.longitude}</longitude>
    <start_date>${r.start_date}</start_date>
    <end_date>${r.end_date}</end_date>
    <current_temp>${r.current_temp ?? ''}</current_temp>
    <humidity>${r.humidity ?? ''}</humidity>
    <wind_speed>${r.wind_speed ?? ''}</wind_speed>
    <weather_description>${escapeXml(r.weather_description)}</weather_description>
    <created_at>${r.created_at}</created_at>
    <updated_at>${r.updated_at}</updated_at>
  </record>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<weather_records>\n${items}\n</weather_records>`;
}

export function toMarkdown(records) {
  if (!records.length) return '# Weather Records\n\nNo records found.\n';

  let md = '# Weather Records Export\n\n';
  md += `Exported: ${new Date().toISOString()}\n\n`;
  md += `Total records: ${records.length}\n\n---\n\n`;

  for (const r of records) {
    md += `## ${r.location_name}${r.country ? `, ${r.country}` : ''}\n\n`;
    md += `| Field | Value |\n|-------|-------|\n`;
    md += `| ID | ${r.id} |\n`;
    md += `| Query | ${r.location_query} |\n`;
    md += `| Coordinates | ${r.latitude}, ${r.longitude} |\n`;
    md += `| Date Range | ${r.start_date} to ${r.end_date} |\n`;
    md += `| Current Temp | ${r.current_temp ?? 'N/A'}°C |\n`;
    md += `| Humidity | ${r.humidity ?? 'N/A'}% |\n`;
    md += `| Wind Speed | ${r.wind_speed ?? 'N/A'} km/h |\n`;
    md += `| Conditions | ${r.weather_description ?? 'N/A'} |\n`;
    md += `| Created | ${r.created_at} |\n\n`;
  }

  return md;
}

export function toPDF(records) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(20).text('Weather Records Export', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`Generated: ${new Date().toISOString()}`, { align: 'center' });
    doc.moveDown(2);

    if (!records.length) {
      doc.fontSize(12).text('No records found.');
    } else {
      records.forEach((r, i) => {
        if (i > 0) doc.moveDown();
        doc.fontSize(14).text(`${r.location_name}${r.country ? `, ${r.country}` : ''}`, { underline: true });
        doc.fontSize(10);
        doc.text(`ID: ${r.id}  |  Query: ${r.location_query}`);
        doc.text(`Coordinates: ${r.latitude}, ${r.longitude}`);
        doc.text(`Date Range: ${r.start_date} to ${r.end_date}`);
        doc.text(`Temperature: ${r.current_temp ?? 'N/A'}°C  |  Humidity: ${r.humidity ?? 'N/A'}%`);
        doc.text(`Wind: ${r.wind_speed ?? 'N/A'} km/h  |  Conditions: ${r.weather_description ?? 'N/A'}`);
        doc.text(`Created: ${r.created_at}`);
        if (i < records.length - 1) {
          doc.moveDown(0.5);
          doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        }
      });
    }

    doc.end();
  });
}

export function parseRecord(row) {
  return {
    ...row,
    temperatures: row.temperatures ? JSON.parse(row.temperatures) : [],
    forecast_data: row.forecast_data ? JSON.parse(row.forecast_data) : [],
    youtube_videos: row.youtube_videos ? JSON.parse(row.youtube_videos) : null,
    map_data: row.map_data ? JSON.parse(row.map_data) : null,
    wikipedia_summary: row.wikipedia_summary ? JSON.parse(row.wikipedia_summary) : null,
  };
}

export function serializeForDb(record) {
  return {
    ...record,
    temperatures: JSON.stringify(record.temperatures ?? []),
    forecast_data: JSON.stringify(record.forecast_data ?? []),
    youtube_videos: record.youtube_videos ? JSON.stringify(record.youtube_videos) : null,
    map_data: record.map_data ? JSON.stringify(record.map_data) : null,
    wikipedia_summary: record.wikipedia_summary ? JSON.stringify(record.wikipedia_summary) : null,
  };
}
