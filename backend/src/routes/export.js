import { Router } from 'express';
import db from '../db.js';
import { toJSON, toCSV, toXML, toMarkdown, toPDF, parseRecord } from '../utils/export.js';

const router = Router();

const FORMATS = {
  json: { contentType: 'application/json', ext: 'json', fn: toJSON },
  csv: { contentType: 'text/csv', ext: 'csv', fn: toCSV },
  xml: { contentType: 'application/xml', ext: 'xml', fn: toXML },
  markdown: { contentType: 'text/markdown', ext: 'md', fn: toMarkdown },
  md: { contentType: 'text/markdown', ext: 'md', fn: toMarkdown },
};

router.get('/:format', async (req, res) => {
  try {
    const format = req.params.format.toLowerCase();
    const rows = db.prepare('SELECT * FROM weather_records ORDER BY created_at DESC').all();
    const records = rows.map(parseRecord);

    if (format === 'pdf') {
      const buffer = await toPDF(records);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=weather_records.pdf');
      return res.send(buffer);
    }

    const handler = FORMATS[format];
    if (!handler) {
      return res.status(400).json({
        error: `Unsupported format "${format}". Supported: json, csv, xml, markdown, pdf`,
      });
    }

    const output = handler.fn(records);
    res.setHeader('Content-Type', handler.contentType);
    res.setHeader('Content-Disposition', `attachment; filename=weather_records.${handler.ext}`);
    res.send(output);
  } catch (err) {
    res.status(500).json({ error: 'Export failed: ' + err.message });
  }
});

export default router;
