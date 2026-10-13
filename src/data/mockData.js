// Proiectele, contractele și materialele vin din API (vezi src/api/). Aici rămân doar conturile demo
// afișate pe ecranul de login și lista secțiilor (aceeași ordine ca în seeder-ul API: s1–s4 → 1–4).

export const USERS = [
  { id: 'u1', name: 'Andrei Popescu', role: 'admin', email: 'andrei.popescu@befu-containere.ro', password: 'admin123', phone: '+40 722 104 551' },
  { id: 'u2', name: 'Ioana Marin', role: 'designer', email: 'ioana.marin@befu-containere.ro', password: 'design123', phone: '+40 733 218 902' },
  { id: 'u3', name: 'Vasile Ionescu', role: 'executant', sectionIds: ['s1'], email: 'vasile.ionescu@befu-containere.ro', password: 'exec123', phone: '+40 744 556 213' },
  { id: 'u4', name: 'Mihai Radu', role: 'executant', sectionIds: ['s1', 's2'], email: 'mihai.radu@befu-containere.ro', password: 'exec123', phone: '+40 755 902 187' },
  { id: 'u5', name: 'Elena Dumitru', role: 'executant', sectionIds: ['s3'], email: 'elena.dumitru@befu-containere.ro', password: 'exec123', phone: '+40 766 341 029' },
  { id: 'u6', name: 'Cristian Neagu', role: 'executant', sectionIds: ['s4'], email: 'cristian.neagu@befu-containere.ro', password: 'exec123', phone: '+40 777 488 650' },
]

export const SECTIONS = [
  { id: 's1', name: 'Sudură' },
  { id: 's2', name: 'Vopsitorie' },
  { id: 's3', name: 'Asamblare' },
  { id: 's4', name: 'Control calitate' },
]
