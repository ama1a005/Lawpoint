const STATUS_CLASSES = {
  pending:   'inline-flex px-2.5 py-0.5 rounded-full text-caption font-semibold bg-yellow-100 text-yellow-800',
  approved:  'inline-flex px-2.5 py-0.5 rounded-full text-caption font-semibold bg-sky/40 text-navy',
  active:    'inline-flex px-2.5 py-0.5 rounded-full text-caption font-semibold bg-green-100 text-green-800',
  closed:    'inline-flex px-2.5 py-0.5 rounded-full text-caption font-semibold bg-slate/20 text-slate',
  rejected:  'inline-flex px-2.5 py-0.5 rounded-full text-caption font-semibold bg-red-100 text-red-700',
  accepted:  'inline-flex px-2.5 py-0.5 rounded-full text-caption font-semibold bg-green-100 text-green-800',
  declined:  'inline-flex px-2.5 py-0.5 rounded-full text-caption font-semibold bg-red-100 text-red-700',
  sent:      'inline-flex px-2.5 py-0.5 rounded-full text-caption font-semibold bg-green-100 text-green-800',
  failed:    'inline-flex px-2.5 py-0.5 rounded-full text-caption font-semibold bg-red-100 text-red-700',
  criminal:  'inline-flex px-2.5 py-0.5 rounded-full text-caption font-semibold bg-navy/10 text-navy',
  civil:     'inline-flex px-2.5 py-0.5 rounded-full text-caption font-semibold bg-steel/15 text-steel',
  family:    'inline-flex px-2.5 py-0.5 rounded-full text-caption font-semibold bg-sky/40 text-navy-mid',
};

export default function Badge({ status }) {
  const classes = STATUS_CLASSES[status?.toLowerCase()] || STATUS_CLASSES.pending;
  return <span className={classes}>{status}</span>;
}
