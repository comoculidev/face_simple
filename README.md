# Foto qeydiyyatı (sadə versiya)

Tək səhifəli sayt: brauzerin içində canlı şəkil çəkir, arxa planda üz tanıma işləyir, üz tapılmayanda "Şəkli çək" düyməsi işləmir. Yalnız **Ad, Soyad, Struktur bölməsi, Vəzifə** soruşulur — tələbə kartı təsdiqi yoxdur. Bütün xanalar doldurulub şəkil çəkiləndə "Göndər" aktivləşir.

## İşə salmaq

Node.js 18+ lazımdır. Heç bir API açarı, heç bir `.env` faylı lazım deyil.

```bash
npm install
npm start
```

Sonra brauzerdə açın: **http://localhost:3000**

## Necə işləyir

1. Sayt açılanda 4 addımlıq qaydalar pop-upı çıxır (eynək/papaq yox, təmiz arxa plan, yaxşı işıq, düz kameraya baxmaq). Pop-up bağlananda kamera açılır.
2. Üz tanıma modeli (face-api.js, TinyFaceDetector) hər ~0.2 saniyədə kadrı yoxlayır. "Şəkli çək" düyməsi yalnız kadrda tam bir üz olanda, üz kifayət qədər böyük olanda və mərkəzdə duranda aktivləşir.
3. "Şəkli çək" basılanda **yenidən** yoxlama gedir. Üz yoxdursa şəkil ümumiyyətlə çəkilmir.
4. Formu doldurub "Göndər" basılır — Ad, Soyad, Struktur bölməsi, Vəzifə. Göndər düyməsi şəkil çəkilməyincə və bütün xanalar dolmayınca aktivləşmir.

## Fayllar harada saxlanılır

Hamısı `faces/` qovluğunda:

- `Ad_Soyad_Struktur_Vezife.jpeg` — şəkillər
- `melumatlar.csv` — Excel-də açılan cədvəl (UTF-8 BOM ilə, Azərbaycan hərfləri düzgün görünür)
- `melumatlar.json` — eyni məlumatların JSON variantı

Fayl adında Azərbaycan hərfləri latın qarşılığına çevrilir (ə→e, ş→s, ç→c, ğ→g, ö→o, ü→u, ı→i), boşluqlar `-` olur. Eyni adlı fayl varsa sona `-2`, `-3` əlavə olunur.

Nümunə: `Elvin_Hesenov_IT-Departamenti_Muhendis.jpeg`

## Vacib qeydlər

- **Kamera yalnız `localhost`-da və ya HTTPS-də işləyir.** Saytı serverə qoyanda mütləq SSL sertifikatı olsun, yoxsa brauzer kameranı açmayacaq.
- Üz tanıma modeli jsDelivr CDN-dən yüklənir, yəni ilk açılışda internet lazımdır. Model brauzerdə keşlənir.
- Bütün tanıma istifadəçinin öz brauzerində gedir; serverə yalnız son şəkil göndərilir. Heç bir xarici AI xidmətinə sorğu getmir.

## Nəyi asanlıqla dəyişmək olar

`public/app.js` faylında `evaluate()` funksiyası — üzün minimum ölçüsü və mərkəzə nə qədər yaxın olmalı olduğu rəqəmləri oradadır.

`server.js` faylında `FACES_DIR` — qovluğun yerini dəyişmək üçün.

Yeni xana əlavə etmək üçün üç yerdə dəyişiklik lazımdır: `public/index.html`-də `<input>`, `public/app.js`-də `fields` obyekti, `server.js`-də `required` obyekti və CSV başlığı.
