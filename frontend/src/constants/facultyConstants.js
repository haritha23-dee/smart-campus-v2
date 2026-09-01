export const RESOURCE_TYPE_OPTIONS = [
  { value: 'syllabus', label: 'Syllabus' },
  { value: 'blueprint', label: 'Blueprints' },
  { value: 'previous_year_qp', label: 'Previous Year QP' },
  { value: 'notes', label: 'Notes' },
  { value: 'study_material', label: 'Study Materials' },
];

export const RESOURCE_TYPE_LABELS = Object.fromEntries(
  RESOURCE_TYPE_OPTIONS.map((o) => [o.value, o.label])
);