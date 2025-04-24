'use client';


import { useEffect, useState } from 'react';
import Link from 'next/link';
import { collection, getDocs, doc, deleteDoc, setDoc, serverTimestamp  } from 'firebase/firestore';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, CalendarDays, MapPin, Home, Pencil, Trash2, Plus, X } from "lucide-react";
import { Label } from '@/components/ui/label';

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
  mode?: string;
  location?: string;
  workType?: string;
  createdAt?: FirestoreTimestamp;
  updatedAt?: FirestoreTimestamp;
};

const statusColors: Record<string, string> = {
  applied: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  interview: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  offer: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

function AddJobPopup({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const { isLoaded, user } = useUser();
  const [form, setForm] = useState({
    company: '',
    position: '',
    status: 'applied',
    mode: 'full-time',
    location: '',
    workType: 'remote',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isLoaded || !user) {
      setError('Please sign in to add jobs');
      return;
    }

    setIsSubmitting(true);

    try {
      const newJobId = Date.now().toString();
      const jobsRef = collection(db, 'users', user.id, 'jobs');
      
      await setDoc(doc(jobsRef, newJobId), {
        ...form,
        id: newJobId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error adding job:', error);
      setError('Failed to save job. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoaded) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="fixed inset-0 flex items-start justify-center z-50 pt-20">
      <Card className="w-full max-w-md relative mx-4 shadow-lg border">
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 p-1 h-8 w-8"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
        
        <CardHeader>
          <CardTitle className="text-xl">Add a New Job</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-2 bg-red-100 text-red-700 rounded dark:bg-red-900 dark:text-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                type="text"
                name="company"
                id="company"
                value={form.company}
                onChange={handleChange}
                placeholder="Company name"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <Input
                type="text"
                name="position"
                id="position"
                value={form.position}
                onChange={handleChange}
                placeholder="Job position"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={form.status}
                onValueChange={(value) => handleSelectChange('status', value)}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="applied">Applied</SelectItem>
                  <SelectItem value="interview">Interview</SelectItem>
                  <SelectItem value="offer">Offer</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mode">Job Type</Label>
              <Select
                value={form.mode}
                onValueChange={(value) => handleSelectChange('mode', value)}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select job type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full-time">Full-time</SelectItem>
                  <SelectItem value="part-time">Part-time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                type="text"
                name="location"
                id="location"
                value={form.location}
                onChange={handleChange}
                placeholder="Job location"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="workType">Work Type</Label>
              <Select
                value={form.workType}
                onValueChange={(value) => handleSelectChange('workType', value)}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select work type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="remote">Remote</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                  <SelectItem value="onsite">On-site</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Job'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function JobsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const { isLoaded, user } = useUser();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isFiltered, setIsFiltered] = useState(false);
  const [showAddJobPopup, setShowAddJobPopup] = useState(false);

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
    let updatedJobs = [...jobs];
  
    if (searchQuery) {
      updatedJobs = updatedJobs.filter((job) =>
        job.company.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
  
    if (statusFilter !== "All") {
      updatedJobs = updatedJobs.filter((job) => job.status === statusFilter);
    }
  
    setFilteredJobs(updatedJobs);
  }, [searchQuery, statusFilter, jobs]);
  

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

  const refreshJobs = async () => {
    if (!user) return;
    
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
    } catch (err) {
      console.error("Failed to refresh jobs:", err);
    } finally {
      setLoading(false);
    }
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Your Job Applications</h2>
        <Button onClick={() => setShowAddJobPopup(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Job
        </Button>
      </div>
      
      <div className="mb-4">
        <p className="text-lg font-medium">
          {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'} found
        </p>
      </div>
      
      <Card className="mb-6 bg-card">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 w-full items-end">
            <div className="flex-1 min-w-0 w-full">
              <Label htmlFor="search" className="sr-only">Search Jobs</Label>
              <Input
                type="text"
                id="search"
                placeholder="Search by company or position"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
  
            <div className="flex-1 min-w-0 w-full">
              <Label htmlFor="status" className="sr-only">Filter by Status</Label>
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filter by status" />
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
  
            <div className="w-full md:w-auto">
              <Button
                onClick={isFiltered ? handleClearFilters : () => setFilteredJobs(filteredJobs)}
                variant={isFiltered ? "outline" : "default"}
                className="w-full"
              >
                {isFiltered ? "Clear Filters" : "Search"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
  
      {filteredJobs.length === 0 ? (
        <Card className="bg-gray-50 dark:bg-card">
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
            <Card 
              key={job.id} 
              className="bg-gray-100 dark:bg-card hover:bg-gray-100 dark:hover:bg-card/80 transition-colors h-full group border"
            >
              <CardContent className="p-4 flex flex-col h-full gap-3">
                <div className="space-y-1">
                  <h3 className="font-bold text-lg leading-tight text-foreground group-hover:text-primary transition-colors">
                    {job.position}
                  </h3>
                  <p className="text-sm text-muted-foreground">@{job.company}</p>
                </div>
            
                <div className="grid gap-3 mt-1">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="inline-flex items-center gap-1.5 text-sm text-foreground">
                        <Briefcase className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="capitalize font-medium">{job.mode || 'full-time'}</span>
                      </div>
                      <div className="inline-flex items-center gap-1.5 text-sm text-foreground">
                        <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span>{job.location || 'Remote'}</span>
                      </div>
                    </div>
                  </div>
            
                  <div className="flex justify-between items-center">
                    <div className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                      <CalendarDays className="h-4 w-4 flex-shrink-0" />
                      <span>{formatDate(job.createdAt)}</span>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[job.status.toLowerCase()]}`}>
                      {job.status}
                    </span>
                  </div>
                </div>
            
                <div className="flex justify-between items-center mt-auto pt-2 border-t border-border/50">
                  <div className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Home className="h-4 w-4 flex-shrink-0" />
                    <span className="capitalize">{job.workType || 'remote'}</span>
                  </div>
                  
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                      asChild
                    >
                      <Link href={`/edit-job/${job.id}`} title="Edit">
                        <Pencil className="h-[1.15rem] w-[1.15rem]" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive/80 hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeleteJob(job.id)}
                      disabled={deletingId === job.id}
                      title="Delete"
                    >
                      <Trash2 className="h-[1.15rem] w-[1.15rem]" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showAddJobPopup && (
        <AddJobPopup 
          onClose={() => setShowAddJobPopup(false)}
          onSuccess={refreshJobs}
        />
      )}
    </div>
  );
}