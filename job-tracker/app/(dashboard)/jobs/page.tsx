'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Job = {
  id: string;
  company: string;
  position: string;
  status: string;
  dateApplied?: string;
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    const storedJobs = JSON.parse(localStorage.getItem('jobs') || '[]');
    setJobs(storedJobs);
  }, []);

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Your Job Applications</h2>
      {jobs.length === 0 ? (
        <p>No jobs added yet.</p>
      ) : (
        <ul className="space-y-3">
          {jobs.map((job) => (
            <li key={job.id} className="border rounded p-3 shadow-sm">
              <h3 className="font-bold">{job.position} @ {job.company}</h3>
              <p className="text-sm">Status: {job.status}</p>
              <p className="text-xs text-gray-500">
                Applied on: {job.dateApplied ? new Date(job.dateApplied).toLocaleDateString() : 'N/A'}
              </p>
              <Link
                href={`/edit-job/${job.id}`}
                className="text-blue-600 text-sm underline mt-2 inline-block"
              >
                Edit
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
