'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddJobPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    company: '',
    position: '',
    status: 'Applied',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const jobs = JSON.parse(localStorage.getItem('jobs') || '[]');

    const newJob = {
      ...form,
      id: Date.now().toString(),
      dateApplied: new Date().toISOString(), // Automatically store the date
    };

    localStorage.setItem('jobs', JSON.stringify([...jobs, newJob]));
    router.push('/jobs');
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">Add a New Job</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="company"
          value={form.company}
          onChange={handleChange}
          placeholder="Company"
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="text"
          name="position"
          value={form.position}
          onChange={handleChange}
          placeholder="Position"
          className="w-full border p-2 rounded"
          required
        />
        <select
          name="status"
          value={form.status}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        >
          <option value="Applied">Applied</option>
          <option value="Interviewing">Interviewing</option>
          <option value="Offer">Offer</option>
          <option value="Rejected">Rejected</option>
        </select>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Save Job
        </button>
      </form>
    </div>
  );
}
