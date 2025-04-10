'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

type Job = {
  id: string;
  company: string;
  position: string;
  status: string;
};

export default function EditJobPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;
  const [job, setJob] = useState<Job | null>(null);
  const [form, setForm] = useState({
    company: '',
    position: '',
    status: 'Applied',
  });

  useEffect(() => {
    const jobs: Job[] = JSON.parse(localStorage.getItem('jobs') || '[]');
    const current = jobs.find((j) => j.id === id);
    if (current) {
      setJob(current);
      setForm({
        company: current.company,
        position: current.position,
        status: current.status,
      });
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const jobs: Job[] = JSON.parse(localStorage.getItem('jobs') || '[]');
    const updatedJobs = jobs.map((j) =>
      j.id === id ? { ...j, ...form } : j
    );
    localStorage.setItem('jobs', JSON.stringify(updatedJobs));
    router.push('/jobs');
  };

  if (!job) return <p className="p-4">Loading job...</p>;

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">Edit Job</h2>
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
        <select name="status" value={form.status} onChange={handleChange} className="w-full border p-2 rounded">
          <option value="Applied">Applied</option>
          <option value="Interviewing">Interviewing</option>
          <option value="Offer">Offer</option>
          <option value="Rejected">Rejected</option>
        </select>
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
          Save Changes
        </button>
      </form>
    </div>
  );
}
