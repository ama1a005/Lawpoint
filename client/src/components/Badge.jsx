/**
 * Badge — renders a status or court-type pill with the correct design system classes.
 * Props: { status } — one of: pending, approved, active, closed, rejected,
 *                       accepted, declined, criminal, civil, family
 */
const badgeClassMap = {
  // Case status badges
  pending:  'inline-flex px-2.5 py-0.5 rounded-full text-caption font-semibold bg-yellow-100 text-yellow-800',
  approved: 'inline-flex px-2.5 py-0.5 rounded-full text-caption font-semibold bg-sky/40 text-navy',
  active:   'inline-flex px-2.5 py-0.5 rounded-full text-caption font-semibold bg-green-100 text-green-800',
  closed:   'inline-flex px-2.5 py-0.5 rounded-full text-caption font-semibold bg-slate/20 text-slate',
  rejected: 'inline-flex px-2.5 py-0.5 rounded-full text-caption font-semibold bg-red-100 text-red-700',

  // Lawyer request badges
  accepted: 'inline-flex px-2.5 py-0.5 rounded-full text-caption font-semibold bg-green-100 text-green-800',
  declined: 'inline-flex px-2.5 py-0.5 rounded-full text-caption font-semibold bg-red-100 text-red-700',

  // Court type badges
  criminal: 'inline-flex px-2.5 py-0.5 rounded-full text-caption font-semibold bg-navy/10 text-navy',
  civil:    'inline-flex px-2.5 py-0.5 rounded-full text-caption font-semibold bg-steel/15 text-steel',
  family:   'inline-flex px-2.5 py-0.5 rounded-full text-caption font-semibold bg-sky/40 text-navy-mid',
};

const Badge = ({ status }) => {
  if (!status) return null;

  const key = status.toLowerCase();
  const classes = badgeClassMap[key] || 'inline-flex px-2.5 py-0.5 rounded-full text-caption font-semibold bg-slate/20 text-slate';

  return (
    <span className={classes}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default Badge;
