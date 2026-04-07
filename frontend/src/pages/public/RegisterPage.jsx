import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { clearAuthError, registerUser } from '../../store/slices/authSlice';
import { ROLES } from '../../utils/roles';
import { getDashboardPathByRole } from '../../utils/authRouting';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const GENDERS = ['MALE', 'FEMALE', 'OTHER'];

function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    role: ROLES.DONOR,
    hospitalName: '',
    licenseNumber: '',
    bloodGroup: 'A+',
    bloodGroupNeeded: 'A+',
    age: '',
    gender: 'MALE',
    medicalEligibility: false,
  });
  const [localError, setLocalError] = useState('');

  const roleLabel = useMemo(() => {
    if (form.role === ROLES.BLOOD_REQUESTER) {
      return 'Blood Requester';
    }
    return form.role;
  }, [form.role]);

  const onChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    setLocalError('');
    dispatch(clearAuthError());
  };

  const validateRoleSpecificFields = () => {
    if (form.role === ROLES.HOSPITAL) {
      if (!form.hospitalName.trim() || !form.licenseNumber.trim()) {
        return 'Hospital name and license number are required for hospital role.';
      }
    }

    if (form.role === ROLES.DONOR) {
      if (!form.age || !form.gender || !form.bloodGroup) {
        return 'Donor registration requires age, gender, and blood group.';
      }

      if (!form.medicalEligibility) {
        return 'Medical eligibility confirmation is required for donor role.';
      }
    }

    if (form.role === ROLES.BLOOD_REQUESTER) {
      if (!form.age || !form.gender || !form.bloodGroupNeeded) {
        return 'Blood requester registration requires age, gender, and needed blood group.';
      }
    }

    return '';
  };

  const onSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.password || !form.phone.trim() || !form.address.trim()) {
      setLocalError('Please fill all required base fields.');
      return;
    }

    const roleError = validateRoleSpecificFields();
    if (roleError) {
      setLocalError(roleError);
      return;
    }

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
      phone: form.phone.trim(),
      address: form.address.trim(),
      role: form.role,
    };

    if (form.role === ROLES.HOSPITAL) {
      payload.hospitalName = form.hospitalName.trim();
      payload.licenseNumber = form.licenseNumber.trim();
    }

    if (form.role === ROLES.DONOR) {
      payload.bloodGroup = form.bloodGroup;
      payload.age = Number(form.age);
      payload.gender = form.gender;
      payload.medicalEligibility = form.medicalEligibility;
    }

    if (form.role === ROLES.BLOOD_REQUESTER) {
      payload.neededBloodGroup = form.bloodGroupNeeded;
      payload.age = Number(form.age);
      payload.gender = form.gender;
    }

    try {
      const response = await dispatch(registerUser(payload)).unwrap();
      navigate(getDashboardPathByRole(response?.user?.role), { replace: true });
    } catch (requestError) {
      // Error message is handled in redux state.
    }
  };

  return (
    <section className="mx-auto max-w-2xl rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
      <h1 className="text-2xl font-semibold text-slate-900">Register</h1>
      <p className="mt-2 text-sm text-slate-600">Create your {roleLabel} account.</p>

      <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={onSubmit}>
        <label className="sm:col-span-2">
          <span className="mb-1 block text-sm font-medium text-slate-700">Full Name</span>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={onChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-brand-300 focus:ring"
          />
        </label>

        <label>
          <span className="mb-1 block text-sm font-medium text-slate-700">Email</span>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={onChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-brand-300 focus:ring"
          />
        </label>

        <label>
          <span className="mb-1 block text-sm font-medium text-slate-700">Password</span>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={onChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-brand-300 focus:ring"
          />
        </label>

        <label>
          <span className="mb-1 block text-sm font-medium text-slate-700">Phone</span>
          <input
            type="text"
            name="phone"
            value={form.phone}
            onChange={onChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-brand-300 focus:ring"
          />
        </label>

        <label>
          <span className="mb-1 block text-sm font-medium text-slate-700">Role</span>
          <select
            name="role"
            value={form.role}
            onChange={onChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-brand-300 focus:ring"
          >
            <option value={ROLES.DONOR}>Donor</option>
            <option value={ROLES.BLOOD_REQUESTER}>Blood Requester</option>
            <option value={ROLES.HOSPITAL}>Hospital</option>
            <option value={ROLES.ADMIN}>Admin</option>
          </select>
        </label>

        <label className="sm:col-span-2">
          <span className="mb-1 block text-sm font-medium text-slate-700">Address</span>
          <input
            type="text"
            name="address"
            value={form.address}
            onChange={onChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-brand-300 focus:ring"
          />
        </label>

        {form.role === ROLES.HOSPITAL ? (
          <>
            <label>
              <span className="mb-1 block text-sm font-medium text-slate-700">Hospital Name</span>
              <input
                type="text"
                name="hospitalName"
                value={form.hospitalName}
                onChange={onChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-brand-300 focus:ring"
              />
            </label>

            <label>
              <span className="mb-1 block text-sm font-medium text-slate-700">License Number</span>
              <input
                type="text"
                name="licenseNumber"
                value={form.licenseNumber}
                onChange={onChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-brand-300 focus:ring"
              />
            </label>
          </>
        ) : null}

        {form.role === ROLES.DONOR || form.role === ROLES.BLOOD_REQUESTER ? (
          <>
            <label>
              <span className="mb-1 block text-sm font-medium text-slate-700">Age</span>
              <input
                type="number"
                name="age"
                value={form.age}
                onChange={onChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-brand-300 focus:ring"
              />
            </label>

            <label>
              <span className="mb-1 block text-sm font-medium text-slate-700">Gender</span>
              <select
                name="gender"
                value={form.gender}
                onChange={onChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-brand-300 focus:ring"
              >
                {GENDERS.map((gender) => (
                  <option key={gender} value={gender}>
                    {gender}
                  </option>
                ))}
              </select>
            </label>
          </>
        ) : null}

        {form.role === ROLES.DONOR ? (
          <>
            <label>
              <span className="mb-1 block text-sm font-medium text-slate-700">Blood Group</span>
              <select
                name="bloodGroup"
                value={form.bloodGroup}
                onChange={onChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-brand-300 focus:ring"
              >
                {BLOOD_GROUPS.map((group) => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex items-center gap-2 self-end pb-2 text-sm text-slate-700">
              <input
                type="checkbox"
                name="medicalEligibility"
                checked={form.medicalEligibility}
                onChange={onChange}
                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              I am medically eligible to donate blood.
            </label>
          </>
        ) : null}

        {form.role === ROLES.BLOOD_REQUESTER ? (
          <label>
            <span className="mb-1 block text-sm font-medium text-slate-700">Blood Group Needed</span>
            <select
              name="bloodGroupNeeded"
              value={form.bloodGroupNeeded}
              onChange={onChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-brand-300 focus:ring"
            >
              {BLOOD_GROUPS.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {localError ? <p className="sm:col-span-2 text-sm text-red-600">{localError}</p> : null}
        {error ? <p className="sm:col-span-2 text-sm text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={isLoading}
          className="sm:col-span-2 rounded-lg bg-brand-600 px-4 py-2 font-medium text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isLoading ? 'Creating account...' : 'Register'}
        </button>
      </form>

      <p className="mt-4 text-sm text-slate-600">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-brand-700 hover:underline">
          Login
        </Link>
      </p>
    </section>
  );
}

export default RegisterPage;
