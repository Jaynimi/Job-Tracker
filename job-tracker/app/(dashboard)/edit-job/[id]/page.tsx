// // app/edit-job/[id]/page.tsx
// 'use client';

// import { useEffect, useState } from 'react';
// import { useRouter, useParams } from 'next/navigation';
// import { useUser } from '@clerk/nextjs';

// export default function EditJobPage() {
//   const router = useRouter();
//   const params = useParams();
//   const { user, getToken } = useUser();
  
//   const jobId = Array.isArray(params?.id) ? params.id[0] : params?.id;
//   const [form, setForm] = useState({
//     company: '',
//     position: '',
//     status: 'Applied',
//   });
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     if (!user || !jobId) return;

//     const fetchJob = async () => {
//       try {
//         setLoading(true);
//         const token = await getToken();
//         const response = await fetch(`/api/job/${jobId}`, {
//           headers: { 'Authorization': `Bearer ${token}` }
//         });

//         if (!response.ok) {
//           throw new Error(await response.text());
//         }

//         const data = await response.json();
//         setForm({
//           company: data.company,
//           position: data.position,
//           status: data.status,
//         });
//       } catch (err) {
//         console.error('Failed to load job:', err);
//         setError(err.message || 'Failed to load job');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchJob();
//   }, [user, jobId, getToken]);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!user || !jobId) return;

//     try {
//       setLoading(true);
//       const token = await getToken();
//       const response = await fetch(`/api/job/${jobId}`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`
//         },
//         body: JSON.stringify(form)
//       });

//       if (!response.ok) {
//         throw new Error(await response.text());
//       }

//       router.push('/jobs');
//     } catch (err) {
//       console.error('Failed to update job:', err);
//       setError(err.message || 'Failed to update job');
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) return <div className="p-4">Loading job data...</div>;
//   if (error) return <div className="p-4 text-red-500">{error}</div>;

//   return (
//     <div className="p-4 max-w-md mx-auto">
//       <h1 className="text-xl font-bold mb-4">Edit Job</h1>
//       <form onSubmit={handleSubmit} className="space-y-4">
//         <input
//           type="text"
//           name="company"
//           value={form.company}
//           onChange={(e) => setForm({...form, company: e.target.value})}
//           className="w-full p-2 border rounded"
//           placeholder="Company"
//           required
//           disabled={loading}
//         />
//         <input
//           type="text"
//           name="position"
//           value={form.position}
//           onChange={(e) => setForm({...form, position: e.target.value})}
//           className="w-full p-2 border rounded"
//           placeholder="Position"
//           required
//           disabled={loading}
//         />
//         <select
//           name="status"
//           value={form.status}
//           onChange={(e) => setForm({...form, status: e.target.value})}
//           className="w-full p-2 border rounded"
//           disabled={loading}
//         >
//           <option value="Applied">Applied</option>
//           <option value="Interviewing">Interviewing</option>
//           <option value="Offer">Offer</option>
//           <option value="Rejected">Rejected</option>
//         </select>
//         <button
//           type="submit"
//           className={`w-full p-2 rounded text-white ${
//             loading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
//           }`}
//           disabled={loading}
//         >
//           {loading ? 'Saving...' : 'Save Changes'}
//         </button>
//       </form>
//     </div>
//   );
// }



















// app/(dashboard)/edit-job/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@clerk/nextjs';

export default function EditJobPage() {
  const router = useRouter();
  const params = useParams();
  const { userId } = useAuth();
  
  const jobId = params?.id as string;
  const [form, setForm] = useState({
    company: '',
    position: '',
    status: 'Applied',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId || !jobId) return;

    const fetchJob = async () => {
      try {
        setLoading(true);
        const docRef = doc(db, 'users', userId, 'jobs', jobId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setForm({
            company: data.company,
            position: data.position,
            status: data.status,
          });
        } else {
          setError('Job not found');
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Failed to load job');
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [userId, jobId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !jobId) return;

    try {
      setLoading(true);
      const docRef = doc(db, 'users', userId, 'jobs', jobId);
      await updateDoc(docRef, {
        ...form,
        updatedAt: serverTimestamp(),
      });
      router.push('/jobs');
    } catch (err) {
      console.error('Update error:', err);
      setError('Failed to update job');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-4">Loading job data...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

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
          disabled={loading}
        />
        <input
          type="text"
          name="position"
          value={form.position}
          onChange={(e) => setForm({...form, position: e.target.value})}
          className="w-full p-2 border rounded"
          placeholder="Position"
          required
          disabled={loading}
        />
        <select
          name="status"
          value={form.status}
          onChange={(e) => setForm({...form, status: e.target.value})}
          className="w-full p-2 border rounded"
          disabled={loading}
        >
          <option value="Applied">Applied</option>
          <option value="Interviewing">Interviewing</option>
          <option value="Offer">Offer</option>
          <option value="Rejected">Rejected</option>
        </select>
        <button
          type="submit"
          className={`w-full p-2 rounded text-white ${
            loading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
          }`}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}