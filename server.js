const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const FACES_DIR = path.join(__dirname, 'faces');
const CSV_PATH = path.join(FACES_DIR, 'melumatlar.csv');
const JSON_PATH = path.join(FACES_DIR, 'melumatlar.json');

if (!fs.existsSync(FACES_DIR)) fs.mkdirSync(FACES_DIR, { recursive: true });

app.use(express.json({ limit: '25mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Azerbaycan herflerini fayl adi ucun tehlukesiz formaya cevirir
const MAP = {
  'ə': 'e', 'Ə': 'E', 'ı': 'i', 'I': 'I', 'İ': 'I', 'i': 'i',
  'ö': 'o', 'Ö': 'O', 'ü': 'u', 'Ü': 'U', 'ğ': 'g', 'Ğ': 'G',
  'ş': 's', 'Ş': 'S', 'ç': 'c', 'Ç': 'C'
};

function slug(text) {
  return String(text || '')
    .trim()
    .replace(/[əƏıİIiöÖüÜğĞşŞçÇ]/g, (ch) => MAP[ch] || ch)
    .replace(/\s+/g, '-')
    .replace(/[^A-Za-z0-9\-_]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function csvCell(value) {
  const v = String(value == null ? '' : value);
  return /[",\n;]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
}

function uniquePath(baseName, ext) {
  let candidate = path.join(FACES_DIR, baseName + ext);
  let i = 2;
  while (fs.existsSync(candidate)) {
    candidate = path.join(FACES_DIR, baseName + '-' + i + ext);
    i++;
  }
  return candidate;
}

app.post('/api/qeydiyyat', (req, res) => {
  try {
    const { ad, soyad, struktur, vezife, sekil } = req.body || {};

    const required = { ad, soyad, struktur, vezife };
    for (const [key, value] of Object.entries(required)) {
      if (!value || !String(value).trim()) {
        return res.status(400).json({ ok: false, error: 'Bu xana boş qalıb: ' + key });
      }
    }
    if (!sekil || !/^data:image\/(jpeg|png);base64,/.test(sekil)) {
      return res.status(400).json({ ok: false, error: 'Şəkil tapılmadı. Əvvəlcə şəkil çəkin.' });
    }

    const ext = sekil.startsWith('data:image/png') ? '.png' : '.jpeg';
    const buffer = Buffer.from(sekil.split(',')[1], 'base64');

    // Fayl adi: Ad_Soyad_StrukturBolmesi_Vezife.jpeg
    const baseName = [ad, soyad, struktur, vezife].map(slug).filter(Boolean).join('_');
    const filePath = uniquePath(baseName || 'sexs', ext);
    fs.writeFileSync(filePath, buffer);

    const record = {
      ad: String(ad).trim(),
      soyad: String(soyad).trim(),
      struktur: String(struktur).trim(),
      vezife: String(vezife).trim(),
      fayl: path.basename(filePath),
      tarix: new Date().toISOString()
    };

    // CSV
    if (!fs.existsSync(CSV_PATH)) {
      fs.writeFileSync(CSV_PATH, '\uFEFFAd,Soyad,Struktur bölməsi,Vəzifə,Fayl,Tarix\n', 'utf8');
    }
    const row = [record.ad, record.soyad, record.struktur, record.vezife, record.fayl, record.tarix]
      .map(csvCell).join(',') + '\n';
    fs.appendFileSync(CSV_PATH, row, 'utf8');

    // JSON
    let all = [];
    if (fs.existsSync(JSON_PATH)) {
      try { all = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8')) || []; } catch (e) { all = []; }
    }
    all.push(record);
    fs.writeFileSync(JSON_PATH, JSON.stringify(all, null, 2), 'utf8');

    res.json({ ok: true, fayl: record.fayl, say: all.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Server xətası: ' + err.message });
  }
});

app.get('/api/say', (req, res) => {
  let all = [];
  if (fs.existsSync(JSON_PATH)) {
    try { all = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8')) || []; } catch (e) { all = []; }
  }
  res.json({ say: all.length });
});

app.listen(PORT, () => {
  console.log('Server işləyir:  http://localhost:' + PORT);
  console.log('Şəkillər:        ' + FACES_DIR);
});
