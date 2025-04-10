'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useUser } from '@clerk/nextjs';

type PageProps = {
  params: {
    id: string;
  };
};

type Job = {
  id: string;
  company: string;
  position: string;
  status: string;
  dateApplied?: string;
};

export default function EditJobPage({ params }: PageProps) {
  const { user } = useUser();
  const router = useRouter();
  const { id } = params;

  const [job, setJob] = useState<Job | null>(null);
  const [form, setForm] = useState({
    company: '',
    position: '',
    status: 'Applied',
  });

  useEffect(() => {
    const fetchJob = async () => {
      if (!user) return;

      const jobRef = doc(db, 'users', user.id, 'jobs', id);
      const jobSnap = await getDoc(jobRef);

      if (jobSnap.exists()) {
        const data = jobSnap.data() as Job;
        setJob(data);
        setForm({
          company: data.company,
          position: data.position,
          status: data.status,
        });
      }
    };

    fetchJob();
  }, [user, id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const jobRef = doc(db, 'users', user.id, 'jobs', id);
    await updateDoc(jobRef, {
      ...form,
      updatedAt: new Date().toISOString(),
    });

    router.push('/jobs');
  };

  if (!user || !job) return <p className="p-4">Loading job...</p>;

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
