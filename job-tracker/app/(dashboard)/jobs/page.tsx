// 'use client';

// import { useEffect, useState } from 'react';
// import Link from 'next/link';

// type Job = {
//   id: string;
//   company: string;
//   position: string;
//   status: string;
//   dateApplied?: string;
// };

// export default function JobsPage() {
//   const [jobs, setJobs] = useState<Job[]>([]);

//   useEffect(() => {
//     const storedJobs = JSON.parse(localStorage.getItem('jobs') || '[]');
//     setJobs(storedJobs);
//   }, []);

//   return (
//     <div className="p-4 max-w-2xl mx-auto">
//       <h2 className="text-xl font-semibold mb-4">Your Job Applications</h2>
//       {jobs.length === 0 ? (
//         <p>No jobs added yet.</p>
//       ) : (
//         <ul className="space-y-3">
//           {jobs.map((job) => (
//             <li key={job.id} className="border rounded p-3 shadow-sm">
//               <h3 className="font-bold">{job.position} @ {job.company}</h3>
//               <p className="text-sm">Status: {job.status}</p>
//               <p className="text-xs text-gray-500">
//                 Applied on: {job.dateApplied ? new Date(job.dateApplied).toLocaleDateString() : 'N/A'}
//               </p>
//               <Link
//                 href={`/edit-job/${job.id}`}
//                 className="text-blue-600 text-sm underline mt-2 inline-block"
//               >
//                 Edit
//               </Link>
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// }
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useUser } from '@clerk/nextjs';

type FirestoreTimestamp = {
  seconds: number;
  nanoseconds: number;
  toDate: () => Date;
};

type Job = {
  id: string;
  company: string;
  position: string;
  status: string;
  createdAt?: FirestoreTimestamp;
  updatedAt?: FirestoreTimestamp;
};

export default function JobsPage() {
  const { isLoaded, user } = useUser();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !user) {
      setLoading(false);
      return;
    }

    const fetchJobs = async () => {
      try {
        setLoading(true);
        const jobsRef = collection(db, 'users', user.id, 'jobs');
        const querySnapshot = await getDocs(jobsRef);
        const jobsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Job[];

        // Sort jobs by createdAt descending
        jobsData.sort((a, b) => {
          const dateA = parseDate(a.createdAt);
          const dateB = parseDate(b.createdAt);
          return dateB.getTime() - dateA.getTime();
        });

        setJobs(jobsData);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch jobs:", err);
        setError("Failed to load jobs. Please try again.");
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [isLoaded, user]);

  const parseDate = (timestamp?: FirestoreTimestamp): Date => {
    if (!timestamp || typeof timestamp.toDate !== 'function') return new Date(NaN);
    return timestamp.toDate();
  };

  const formatDate = (timestamp?: FirestoreTimestamp): string => {
    const parsed = parseDate(timestamp);
    return isNaN(parsed.getTime()) ? 'N/A' : parsed.toLocaleDateString();
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!user || !confirm('Are you sure you want to delete this job?')) return;

    try {
      setDeletingId(jobId);
      const jobRef = doc(db, 'users', user.id, 'jobs', jobId);
      await deleteDoc(jobRef);
      setJobs(prev => prev.filter(job => job.id !== jobId));
      alert('Job deleted successfully.');
    } catch (error) {
      console.error("Error deleting job:", error);
      setError("Failed to delete job. Please try again.");
      alert("Failed to delete job.");
    } finally {
      setDeletingId(null);
    }
  };

  if (!isLoaded || loading) {
    return <p className="p-4">Loading...</p>;
  }

  if (!user) {
    return <p className="p-4">Please sign in to view jobs</p>;
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        {error}
        <button
          onClick={() => window.location.reload()}
          className="ml-2 text-blue-500"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Your Job Applications</h2>

      {jobs.length === 0 ? (
        <div>
          <p>No jobs found. Add your first job application!</p>
          <p className="text-sm text-gray-500 mt-2">
            Debug info: User ID - {user.id}
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {jobs.map((job) => (
            <li key={job.id} className="border rounded p-3 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold">{job.position} @ {job.company}</h3>
                  <p className="text-sm">Status: {job.status}</p>
                  <p className="text-xs text-gray-500">
                    Applied on: {formatDate(job.createdAt)}
                  </p>
                </div>
                <div className="flex gap-3">
                  <Link
                    href={`/edit-job/${job.id}`}
                    className="text-blue-600 text-sm underline"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDeleteJob(job.id)}
                    disabled={deletingId === job.id}
                    className={`text-red-600 text-sm underline ${
                      deletingId === job.id ? 'opacity-50' : ''
                    }`}
                  >
                    {deletingId === job.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
