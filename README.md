# Şəkil qeydiyyatı

Yalnız Ad, Soyad, Struktur bölməsi və Vəzifə tələb olunur.

Bütün xanalar doldurulmadan Göndər düyməsi aktiv olmur. Göndərildikdə şəkil və JSON məlumatı `faces/` qovluğuna yazılır.

Quraşdırma:
```bash
npm install
npm start
```
Sonra `http://localhost:3000` açın.

Şəkil adı:
`Ad_Soyad_StructurBolmesi_Vezife.jpeg`

Eyni ad varsa `_2`, `_3` və s. əlavə olunur.

Qeyd: üz aşkarlanması üçün brauzerin FaceDetector API-si istifadə edilir; dəstəklənməyən brauzerdə şəkil düyməsi aktivləşmir.
