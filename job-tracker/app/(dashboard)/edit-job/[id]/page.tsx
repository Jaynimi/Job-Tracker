// 'use client';

// import { useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { doc, getDoc, updateDoc } from 'firebase/firestore';
// import { db } from '@/lib/firebase';
// import { useUser } from '@clerk/nextjs';

// type Job = {
//   id: string;
//   company: string;
//   position: string;
//   status: string;
//   dateApplied?: string;
// };

// export default function EditJobPage({ params }: { params: { id: string } }) {
//   const { user } = useUser();
//   const router = useRouter();
//   const { id } = params;

//   const [job, setJob] = useState<Job | null>(null);
//   const [form, setForm] = useState({
//     company: '',
//     position: '',
//     status: 'Applied',
//   });

//   useEffect(() => {
//     if (!user) return;

//     const fetchJob = async () => {
//       try {
//         const jobRef = doc(db, 'users', user.id, 'jobs', id);
//         const jobSnap = await getDoc(jobRef);

//         if (jobSnap.exists()) {
//           const data = jobSnap.data() as Job;
//           setJob(data);
//           setForm({
//             company: data.company,
//             position: data.position,
//             status: data.status,
//           });
//         }
//       } catch (error) {
//         console.error('Error fetching job:', error);
//       }
//     };

//     fetchJob();
//   }, [user, id]);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!user) return;

//     try {
//       const jobRef = doc(db, 'users', user.id, 'jobs', id);
//       await updateDoc(jobRef, {
//         ...form,
//         updatedAt: new Date().toISOString(),
//       });
//       router.push('/jobs');
//     } catch (error) {
//       console.error('Error updating job:', error);
//     }
//   };

//   if (!user || !job) return <p className="p-4">Loading job...</p>;

//   return (
//     <div className="p-4 max-w-md mx-auto">
//       <h2 className="text-xl font-semibold mb-4">Edit Job</h2>
//       <form onSubmit={handleSubmit} className="space-y-4">
//         <input
//           type="text"
//           name="company"
//           value={form.company}
//           onChange={handleChange}
//           placeholder="Company"
//           className="w-full border p-2 rounded"
//           required
//         />
//         <input
//           type="text"
//           name="position"
//           value={form.position}
//           onChange={handleChange}
//           placeholder="Position"
//           className="w-full border p-2 rounded"
//           required
//         />
//         <select
//           name="status"
//           value={form.status}
//           onChange={handleChange}
//           className="w-full border p-2 rounded"
//         >
//           <option value="Applied">Applied</option>
//           <option value="Interviewing">Interviewing</option>
//           <option value="Offer">Offer</option>
//           <option value="Rejected">Rejected</option>
//         </select>
//         <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
//           Save Changes
//         </button>
//       </form>
//     </div>
//   );
// }

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useUser } from '@clerk/nextjs';

type Job = {
  id: string;
  company: string;
  position: string;
  status: string;
  dateApplied?: {
    seconds?: number;
    nanoseconds?: number;
    toDate?: () => Date;
  } | string | Date;
};

export default function EditJobPage({ params }: { params: { id: string } }) {
  const { isLoaded, user } = useUser();
  const router = useRouter();
  const { id } = params;

  const [job, setJob] = useState<Job | null>(null);
  const [form, setForm] = useState({
    company: '',
    position: '',
    status: 'Applied',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoaded || !user) {
      setLoading(false);
      return;
    }

    const fetchJob = async () => {
      try {
        setLoading(true);
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
          setError(null);
        } else {
          setError('Job not found');
        }
      } catch (error) {
        console.error('Error fetching job:', error);
        setError('Failed to load job. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [isLoaded, user, id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setIsSubmitting(true);
      const jobRef = doc(db, 'users', user.id, 'jobs', id);
      await updateDoc(jobRef, {
        ...form,
        updatedAt: serverTimestamp(), // Using serverTimestamp for consistency
      });
      router.push('/jobs');
    } catch (error) {
      console.error('Error updating job:', error);
      setError('Failed to update job. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoaded || loading) {
    return <p className="p-4">Loading job...</p>;
  }

  if (!user) {
    return <p className="p-4">Please sign in to edit jobs</p>;
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

  if (!job) {
    return (
      <div className="p-4">
        <p>Job not found</p>
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
      
      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="company"
          value={form.company}
          onChange={handleChange}
          placeholder="Company"
          className="w-full border p-2 rounded"
          required
          disabled={isSubmitting}
        />
        <input
          type="text"
          name="position"
          value={form.position}
          onChange={handleChange}
          placeholder="Position"
          className="w-full border p-2 rounded"
          required
          disabled={isSubmitting}
        />
        <select
          name="status"
          value={form.status}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          disabled={isSubmitting}
        >
          <option value="Applied">Applied</option>
          <option value="Interviewing">Interviewing</option>
          <option value="Offer">Offer</option>
          <option value="Rejected">Rejected</option>
        </select>
        <button
          type="submit"
          className={`bg-green-600 text-white px-4 py-2 rounded w-full ${
            isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}