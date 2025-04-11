// app/edit-job/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useUser } from '@clerk/nextjs';

export default function EditJobClientPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isLoaded } = useUser();
  
  const jobId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const [form, setForm] = useState({
    company: '',
    position: '',
    status: 'Applied',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded || !user || !jobId) return;

    const loadJob = async () => {
      try {
        const docRef = doc(db, 'users', user.id, 'jobs', jobId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setForm({
            company: data.company || '',
            position: data.position || '',
            status: data.status || 'Applied',
          });
        }
      } catch (error) {
        console.error("Error loading job:", error);
      } finally {
        setLoading(false);
      }
    };

    loadJob();
  }, [user, jobId, isLoaded]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !jobId) return;

    try {
      await updateDoc(doc(db, 'users', user.id, 'jobs', jobId), {
        ...form,
        updatedAt: serverTimestamp(),
      });
      router.push('/jobs');
    } catch (error) {
      console.error("Error updating job:", error);
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Edit Job</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="company"
          value={form.company}
          onChange={(e) => setForm({...form, company: e.target.value})}
          className="w-full p-2 border rounded"
          placeholder="Company"
          required
        />
        <input
          type="text"
          name="position"
          value={form.position}
          onChange={(e) => setForm({...form, position: e.target.value})}
          className="w-full p-2 border rounded"
          placeholder="Position"
          required
        />
        <select
          name="status"
          value={form.status}
          onChange={(e) => setForm({...form, status: e.target.value})}
          className="w-full p-2 border rounded"
        >
          <option value="Applied">Applied</option>
          <option value="Interviewing">Interviewing</option>
          <option value="Offer">Offer</option>
          <option value="Rejected">Rejected</option>
        </select>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}