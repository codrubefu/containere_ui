# Producție containere — aplicație demo

Aplicație React + Vite, optimizată pentru mobil, cu Tailwind CSS. Toate datele sunt fictive și trăiesc în state-ul React — nu există API sau backend; la refresh, se reinițializează din `src/data/mockData.js`.

## Rulare locală

```bash
npm install
npm run dev
```

Deschide adresa afișată (implicit `http://localhost:5173`). Pentru cea mai bună experiență, deschide unealta de developer tools a browser-ului și comută pe emularea unui telefon (responsive mode).

## Structură

- `src/data/mockData.js` — utilizatori, secții, materiale și proiecte (date fictive)
- `src/screens/LoginScreen.jsx` — selectare utilizator (simulează autentificarea pe rol)
- `src/screens/AdminHome.jsx` + `ProjectDetail.jsx` — flux Admin/Designer: creare proiect, căutare și adăugare materiale, alocare secție
- `src/screens/WorkerHome.jsx` + `SectionWork.jsx` — flux Executant: vede doar secțiile alocate, selectează materialul, marchează progres și introduce cantitatea reală
- `src/components/` — Header, BottomNav, StatusBadge (reutilizabile)

## Autentificare (demo)

Ecranul de login cere email + parolă, apoi un cod de confirmare SMS. Nu există server real — codul SMS e fix (`123456`) și afișat direct pe ecran, iar din "Vezi conturi demo" poți completa automat email + parolă pentru orice utilizator din tabelul de mai jos.

| Nume | Rol | Email | Parolă | Secții alocate |
| --- | --- | --- | --- | --- |
| Andrei Popescu | Admin | andrei.popescu@befu-containere.ro | admin123 | — |
| Ioana Marin | Designer | ioana.marin@befu-containere.ro | design123 | — |
| Vasile Ionescu | Executant | vasile.ionescu@befu-containere.ro | exec123 | Sudură |
| Mihai Radu | Executant | mihai.radu@befu-containere.ro | exec123 | Sudură, Vopsitorie |
| Elena Dumitru | Executant | elena.dumitru@befu-containere.ro | exec123 | Asamblare |
| Cristian Neagu | Executant | cristian.neagu@befu-containere.ro | exec123 | Control calitate |

## Următorii pași posibili

- Înlocuirea `mockData.js` cu apeluri reale către un API (Laravel, de exemplu)
- Persistarea alegerilor în `localStorage` sau într-un backend
- Autentificare reală în locul selectării din listă
