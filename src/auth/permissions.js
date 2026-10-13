// Permisiunile vin de la API (`user.permissions`), derivate din rol:
// admin = toate; designer = projects.*, project_items.manage, comments.create, sections.view;
// executant = projects.view, project_items.work, comments.create, sections.view.

export function can(user, permission) {
  return Boolean(user?.permissions?.includes(permission))
}

// API-ul folosește id-uri numerice; datele demo din UI folosesc 'u3' / 's1'.
// Seeder-ul păstrează aceeași ordine (u1–u6 → 1–6, s1–s4 → 1–4).
export function normalizeUser(apiUser) {
  return {
    ...apiUser,
    id: `u${apiUser.id}`,
    sectionIds: (apiUser.sectionIds ?? []).map((id) => `s${id}`),
    permissions: apiUser.permissions ?? [],
  }
}

// Ce poate face utilizatorul în fiecare zonă a aplicației.
export function accessFor(user) {
  const workOnAnySection = user.role === 'admin'
  return {
    projects: {
      visible: can(user, 'projects.view') && (can(user, 'projects.create') || can(user, 'project_items.manage')),
      create: can(user, 'projects.create'),
      close: can(user, 'projects.close'),
      manageItems: can(user, 'project_items.manage'),
      changeStatus: can(user, 'project_items.work') && workOnAnySection,
      comment: can(user, 'comments.create'),
    },
    sections: {
      visible: can(user, 'sections.view') && can(user, 'project_items.work'),
      work: can(user, 'project_items.work'),
      comment: can(user, 'comments.create'),
    },
  }
}
