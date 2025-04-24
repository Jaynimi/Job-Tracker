// 'use client';

// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { doc, setDoc, collection, serverTimestamp } from 'firebase/firestore';
// import { db } from '@/lib/firebase';
// import { useUser } from '@clerk/nextjs';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Label } from '@/components/ui/label';

// export default function AddJobPage() {
//   const { isLoaded, user } = useUser();
//   const router = useRouter();
//   const [form, setForm] = useState({
//     company: '',
//     position: '',
//     status: 'applied',
//     mode: 'full-time',
//     location: '',
//     workType: 'remote',
//   });
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleSelectChange = (name: string, value: string) => {
//     setForm({ ...form, [name]: value });
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError(null);

//     if (!isLoaded || !user) {
//       setError('Please sign in to add jobs');
//       return;
//     }

//     setIsSubmitting(true);

//     try {
//       const newJobId = Date.now().toString();
//       const jobsRef = collection(db, 'users', user.id, 'jobs');
      
//       await setDoc(doc(jobsRef, newJobId), {
//         ...form,
//         id: newJobId,
//         createdAt: serverTimestamp(),
//         updatedAt: serverTimestamp()
//       });

//       router.push('/jobs');
//     } catch (error) {
//       console.error('Error adding job:', error);
//       setError('Failed to save job. Please try again.');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   if (!isLoaded) {
//     return <div className="p-4">Loading...</div>;
//   }

//   return (
//     <div className="p-4 max-w-md mx-auto">
//       <Card>
//         <CardHeader>
//           <CardTitle className="text-xl">Add a New Job</CardTitle>
//         </CardHeader>
//         <CardContent>
//           {error && (
//             <div className="mb-4 p-2 bg-red-100 text-red-700 rounded dark:bg-red-900 dark:text-red-200">
//               {error}
//             </div>
//           )}

//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div className="space-y-2">
//               <Label htmlFor="company">Company</Label>
//               <Input
//                 type="text"
//                 name="company"
//                 id="company"
//                 value={form.company}
//                 onChange={handleChange}
//                 placeholder="Company name"
//                 required
//                 disabled={isSubmitting}
//               />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="position">Position</Label>
//               <Input
//                 type="text"
//                 name="position"
//                 id="position"
//                 value={form.position}
//                 onChange={handleChange}
//                 placeholder="Job position"
//                 required
//                 disabled={isSubmitting}
//               />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="status">Status</Label>
//               <Select
//                 value={form.status}
//                 onValueChange={(value) => handleSelectChange('status', value)}
//                 disabled={isSubmitting}
//               >
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select status" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="applied">Applied</SelectItem>
//                   <SelectItem value="interview">Interview</SelectItem>
//                   <SelectItem value="offer">Offer</SelectItem>
//                   <SelectItem value="rejected">Rejected</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="mode">Job Type</Label>
//               <Select
//                 value={form.mode}
//                 onValueChange={(value) => handleSelectChange('mode', value)}
//                 disabled={isSubmitting}
//               >
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select job type" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="full-time">Full-time</SelectItem>
//                   <SelectItem value="part-time">Part-time</SelectItem>
//                   <SelectItem value="contract">Contract</SelectItem>
//                   <SelectItem value="internship">Internship</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="location">Location</Label>
//               <Input
//                 type="text"
//                 name="location"
//                 id="location"
//                 value={form.location}
//                 onChange={handleChange}
//                 placeholder="Job location"
//                 disabled={isSubmitting}
//               />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="workType">Work Type</Label>
//               <Select
//                 value={form.workType}
//                 onValueChange={(value) => handleSelectChange('workType', value)}
//                 disabled={isSubmitting}
//               >
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select work type" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="remote">Remote</SelectItem>
//                   <SelectItem value="hybrid">Hybrid</SelectItem>
//                   <SelectItem value="onsite">On-site</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>

//             <Button
//               type="submit"
//               className="w-full"
//               disabled={isSubmitting}
//             >
//               {isSubmitting ? 'Saving...' : 'Save Job'}
//             </Button>
//           </form>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }