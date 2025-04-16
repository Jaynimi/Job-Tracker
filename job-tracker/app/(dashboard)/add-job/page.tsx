// 'use client';

// import { useState } from 'react';
// import { useRouter } from 'next/navigation';

// export default function AddJobPage() {
//   const router = useRouter();
//   const [form, setForm] = useState({
//     company: '',
//     position: '',
//     status: 'Applied',
//   });

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     const jobs = JSON.parse(localStorage.getItem('jobs') || '[]');

//     const newJob = {
//       ...form,
//       id: Date.now().toString(),
//       dateApplied: new Date().toISOString(), // Automatically store the date
//     };

//     localStorage.setItem('jobs', JSON.stringify([...jobs, newJob]));
//     router.push('/jobs');
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!user) {
//       console.log("No user found!");
//       return;
//     }
  
//     console.log("Current user ID:", user.id); // Should match the ID shown earlier
    
//     try {
//       const newJobId = Date.now().toString();
//       const jobsRef = collection(db, 'users', user.id, 'jobs');
//       console.log("Attempting to save to:", jobsRef.path);
      
//       await setDoc(doc(jobsRef, newJobId), {
//         company: form.company,
//         position: form.position,
//         status: form.status,
//         dateApplied: new Date().toISOString(),
//         createdAt: serverTimestamp() // Change to this
//       });
      
//       console.log("Successfully saved job!");
//       router.push('/jobs');
//     } catch (error) {
//       console.error('Full error:', error);
//     }
//   };

//   return (
//     <div className="p-4 max-w-md mx-auto">
//       <h2 className="text-xl font-semibold mb-4">Add a New Job</h2>
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
//         <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
//           Save Job
//         </button>
//       </form>
//     </div>
//   );
// }



'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, setDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useUser } from '@clerk/nextjs';

export default function AddJobPage() {
  const { isLoaded, user } = useUser();
  const router = useRouter();
  const [form, setForm] = useState({
    company: '',
    position: '',
    status: 'Applied',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setError(null);
    
  //   if (!isLoaded || !user) {
  //     setError('Please sign in to add jobs');
  //     return;
  //   }

  //   setIsSubmitting(true);

  //   try {
  //     const newJobId = Date.now().toString();
  //     const jobsRef = collection(db, 'users', user.id, 'jobs');
      
  //     await setDoc(doc(jobsRef, newJobId), {
  //       ...form,
  //       id: newJobId,
  //       dateApplied: serverTimestamp(),
  //       createdAt: serverTimestamp(),
  //       updatedAt: serverTimestamp()
  //     });

  //     router.push('/jobs');
  //   } catch (error) {
  //     console.error('Error adding job:', error);
  //     setError('Failed to save job. Please try again.');
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      setError('User not authenticated');
      return;
    }

    console.log("User ID:", user.id); // Verify this matches your Clerk ID

    try {
      const newJobId = Date.now().toString();
      const jobsRef = collection(db, 'users', user.id, 'jobs');
      console.log("Full path:", jobsRef.path);

      await setDoc(doc(jobsRef, newJobId), {
        company: form.company,
        position: form.position,
        status: form.status,
        testField: "TEST_VALUE", // Simple test field
        createdAt: serverTimestamp()
      });

      console.log("Document written successfully!");
      router.push('/jobs');
    } catch (error) {
      console.error("Full error details:", error);

      if (error instanceof Error) {
        setError(`Failed: ${error.message}`);
      } else {
        setError('Something went wrong');
      }
    }
  };

  if (!isLoaded) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">Add a New Job</h2>
      
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
          className={`bg-blue-600 text-white px-4 py-2 rounded w-full ${
            isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save Job'}
        </button>
      </form>
    </div>
  );
}