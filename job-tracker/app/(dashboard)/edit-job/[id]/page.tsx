'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useUser } from '@clerk/nextjs';

type JobData = {
  company: string;
  position: string;
  status: string;
  dateApplied?: any;
};

export default function EditJobPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [form, setForm] = useState({
    company: '',
    position: '',
    status: 'Applied',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !user || !id) return;

    const fetchJob = async () => {
      try {
        const jobRef = doc(db, 'users', user.id, 'jobs', id);
        const jobSnap = await getDoc(jobRef);

        if (jobSnap.exists()) {
          const data = jobSnap.data() as JobData;
          setForm({
            company: data.company,
            position: data.position,
            status: data.status,
          });
        } else {
          setError('Job not found');
        }
      } catch (error) {
        console.error('Error fetching job:', error);
        setError('Failed to load job');
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [user, id, isLoaded]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id) return;

    try {
      const jobRef = doc(db, 'users', user.id, 'jobs', id);
      await updateDoc(jobRef, {
        ...form,
        updatedAt: serverTimestamp(),
      });
      router.push('/jobs');
    } catch (error) {
      console.error('Error updating job:', error);
      setError('Failed to update job');
    }
  };

  if (!isLoaded || loading) {
    return <div className="p-4">Loading job data...</div>;
  }

  if (error) {
    return (
      <div className="p-4">
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => router.push('/jobs')}
          className="mt-2 text-blue-600 underline"
        >
          Back to Jobs
        </button>
      </div>
    );
  }

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
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded w-full"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}