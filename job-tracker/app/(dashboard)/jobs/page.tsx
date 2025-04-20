'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useUser } from '@clerk/nextjs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';

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

const statusColors: Record<string, string> = {
  applied: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  interview: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  offer: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

export default function JobsPage() {
  const { isLoaded, user } = useUser();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isFiltered, setIsFiltered] = useState(false);

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

        jobsData.sort((a, b) => {
          const dateA = parseDate(a.createdAt);
          const dateB = parseDate(b.createdAt);
          return dateB.getTime() - dateA.getTime();
        });

        setJobs(jobsData);
        setFilteredJobs(jobsData);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch jobs:", err);
        setError("Failed to load jobs. Please try again.");
        setJobs([]);
        setFilteredJobs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [isLoaded, user]);

  useEffect(() => {
    let results = jobs;
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(job => 
        job.company.toLowerCase().includes(term) || 
        job.position.toLowerCase().includes(term)
      );
    }
    
    if (statusFilter !== 'all') {
      results = results.filter(job => 
        job.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    setIsFiltered(searchTerm !== '' || statusFilter !== 'all');
    setFilteredJobs(results);
  }, [searchTerm, statusFilter, jobs]);

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

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
  };

  if (!isLoaded || loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (!user) {
    return <div className="p-4">Please sign in to view jobs</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-destructive">
        {error}
        <Button
          variant="ghost"
          onClick={() => window.location.reload()}
          className="ml-2"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Your Job Applications</h2>
      
      <div className="mb-4">
        <p className="text-lg font-medium">
          {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'} found
        </p>
      </div>
      
      <Card className="mb-6">
  <CardContent className="p-4">
    <div className="flex flex-col md:flex-row gap-4 w-full">
      {/* Search - Takes most space */}
      <div className="flex-[2] min-w-0"> {/* flex-[2] gives this 2 parts of available space */}
        <label htmlFor="search" className="block text-sm font-medium mb-1">
          Search Jobs
        </label>
        <Input
          type="text"
          id="search"
          placeholder="Search by company or position"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
      </div>

      {/* Status Filter - Medium size */}
      <div className="flex-1 min-w-0"> {/* flex-1 gives this 1 part of available space */}
        <label htmlFor="status" className="block text-sm font-medium mb-1">
          Filter by Status
        </label>
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="applied">Applied</SelectItem>
            <SelectItem value="interview">Interview</SelectItem>
            <SelectItem value="offer">Offer</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Button - Fits neatly */}
      <div className="flex-none self-end w-full md:w-auto"> {/* flex-none prevents growing */}
        <Button
          onClick={isFiltered ? handleClearFilters : () => setFilteredJobs(filteredJobs)}
          variant={isFiltered ? "outline" : "default"}
          className="w-full md:w-[120px]"
        >
          {isFiltered ? "Clear Filters" : "Search"}
        </Button>
      </div>
    </div>
  </CardContent>
</Card>

      {filteredJobs.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No jobs match your search criteria</p>
            {jobs.length > 0 && (
              <Button
                variant="link"
                onClick={handleClearFilters}
                className="mt-2"
              >
                Clear filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredJobs.map((job) => (
            <Card key={job.id} className="hover:bg-accent/50 transition-colors h-full">
              <CardContent className="p-4 flex flex-col h-full">
                <div className="flex-grow">
                  <h3 className="font-bold">{job.position} @ {job.company}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm">Status:</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${statusColors[job.status.toLowerCase()] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'}`}>
                      {job.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Applied on: {formatDate(job.createdAt)}
                  </p>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button asChild variant="ghost" size="sm" className="flex-1">
                    <Link href={`/edit-job/${job.id}`}>
                      Edit
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 text-destructive hover:text-destructive"
                    onClick={() => handleDeleteJob(job.id)}
                    disabled={deletingId === job.id}
                  >
                    {deletingId === job.id ? 'Deleting...' : 'Delete'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}