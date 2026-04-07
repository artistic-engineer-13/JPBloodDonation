import { useMemo, useState } from 'react';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const defaultForm = {
  bloodGroup: 'A+',
  units: 1,
  hospitalId: '',
  date: '',
  note: '',
};

function DonorRequestForm({ isSubmitting, onSubmit, previousHospitals = [] }) {
  const [form, setForm] = useState(defaultForm);
  const [error, setError] = useState('');

  const hospitalOptions = useMemo(() => {
    return previousHospitals.filter((item) => item?.id && item?.name);
  }, [previousHospitals]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: name === 'units' ? Number(value) : value,
    }));

    setError('');
  };

  const validate = () => {
    if (!form.hospitalId.trim()) {
      return 'Hospital is required.';
    }

    if (!Number.isInteger(form.units) || form.units < 1 || form.units > 4) {
      return 'Units must be between 1 and 4.';
    }

    if (!form.date) {
      return 'Donation date is required.';
    }

    if (new Date(form.date).toString() === 'Invalid Date') {
      return 'Donation date is invalid.';
    }

    return '';
  };

  const submitForm = async (event) => {
    event.preventDefault();

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    const isSuccess = await onSubmit({
      bloodGroup: form.bloodGroup,
      units: form.units,
      hospitalId: form.hospitalId.trim(),
      date: form.date,
      note: form.note.trim(),
    });

    if (isSuccess) {
      setForm(defaultForm);
    }
  };

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <h2 className="text-lg font-semibold text-slate-900">Create Donation Request</h2>
      <p className="mt-1 text-sm text-slate-600">Submit a donation request for admin review.</p>

      <form className="mt-4 grid gap-4 sm:grid-cols-2" onSubmit={submitForm}>
        <label>
          <span className="mb-1 block text-sm font-medium text-slate-700">Blood Group</span>
          <select
            name="bloodGroup"
            value={form.bloodGroup}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-brand-300 focus:ring"
          >
            {BLOOD_GROUPS.map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="mb-1 block text-sm font-medium text-slate-700">Units</span>
          <input
            type="number"
            min="1"
            max="4"
            name="units"
            value={form.units}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-brand-300 focus:ring"
          />
        </label>

        <label className="sm:col-span-2">
          <span className="mb-1 block text-sm font-medium text-slate-700">Selected Hospital</span>
          {hospitalOptions.length ? (
            <select
              name="hospitalId"
              value={form.hospitalId}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-brand-300 focus:ring"
            >
              <option value="">Select hospital</option>
              {hospitalOptions.map((hospital) => (
                <option key={hospital.id} value={hospital.id}>
                  {hospital.name} {hospital.code ? `(${hospital.code})` : ''}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              name="hospitalId"
              value={form.hospitalId}
              onChange={handleChange}
              placeholder="Enter hospital ID, code, or exact name"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-brand-300 focus:ring"
            />
          )}
          <p className="mt-1 text-xs text-slate-500">
            If no options are shown yet, enter hospital ID, code, or exact hospital name.
          </p>
        </label>

        <label>
          <span className="mb-1 block text-sm font-medium text-slate-700">Date</span>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-brand-300 focus:ring"
          />
        </label>

        <label>
          <span className="mb-1 block text-sm font-medium text-slate-700">Note (Optional)</span>
          <input
            type="text"
            name="note"
            value={form.note}
            onChange={handleChange}
            placeholder="Any additional note"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-brand-300 focus:ring"
          />
        </label>

        {error ? <p className="sm:col-span-2 text-sm text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="sm:col-span-2 rounded-lg bg-brand-600 px-4 py-2 font-medium text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Donation Request'}
        </button>
      </form>
    </section>
  );
}

export default DonorRequestForm;
