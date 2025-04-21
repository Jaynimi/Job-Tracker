'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, PieChart } from '@mui/x-charts';
import { Briefcase, CalendarCheck, Handshake, X } from 'lucide-react';


type Job = {
  id: string;
  status: string;
  mode: string;
  location: string;
  workType: string;
  createdAt?: {
    seconds: number;
    nanoseconds: number;
    toDate: () => Date;
  };
};

export default function StatsPage() {
  const { isLoaded, user } = useUser();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

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
        const jobsData = querySnapshot.docs.map(doc => doc.data() as Job);
        setJobs(jobsData);
      } catch (err) {
        console.error("Failed to fetch jobs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [isLoaded, user]);

  if (!isLoaded || loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (!user) {
    return <div className="p-4">Please sign in to view stats</div>;
  }

  // Count jobs by status
  const statusCounts = {
    applied: jobs.filter(job => job.status === 'applied').length,
    interview: jobs.filter(job => job.status === 'interview').length,
    offer: jobs.filter(job => job.status === 'offer').length,
    rejected: jobs.filter(job => job.status === 'rejected').length
  };

  // Prepare monthly application data
  const monthlyData = Array(12).fill(0);
  jobs.forEach(job => {
    if (job.createdAt) {
      const date = new Date(job.createdAt.seconds * 1000);
      const month = date.getMonth();
      monthlyData[month]++;
    }
  });

  // Prepare pie chart data
  const statusData = [
    { id: 0, value: statusCounts.applied, label: 'Applied' },
    { id: 1, value: statusCounts.interview, label: 'Interview' },
    { id: 2, value: statusCounts.offer, label: 'Offer' },
    { id: 3, value: statusCounts.rejected, label: 'Rejected' }
  ];

  const workTypeData = [
    { id: 0, value: jobs.filter(j => j.workType === 'remote').length, label: 'Remote' },
    { id: 1, value: jobs.filter(j => j.workType === 'hybrid').length, label: 'Hybrid' },
    { id: 2, value: jobs.filter(j => j.workType === 'onsite').length, label: 'On-site' }
  ];

  const jobTypeData = [
    { id: 0, value: jobs.filter(j => j.mode === 'full-time').length, label: 'Full-time' },
    { id: 1, value: jobs.filter(j => j.mode === 'part-time').length, label: 'Part-time' },
    { id: 2, value: jobs.filter(j => j.mode === 'contract').length, label: 'Contract' },
    { id: 3, value: jobs.filter(j => j.mode === 'internship').length, label: 'Internship' }
  ];

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Job Application Statistics</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Briefcase className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.applied}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Interviews</CardTitle>
            <CalendarCheck className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.interview}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Offers</CardTitle>
            <Handshake className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.offer}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <X className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.rejected}</div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Applications Chart */}
      <Card>
  <CardHeader>
    <CardTitle>Monthly Applications</CardTitle>
  </CardHeader>
  <CardContent className="h-[300px] p-0">
    <div className="flex justify-center items-center w-full h-full">
      <BarChart
        height={300}
        xAxis={[
          {
            scaleType: 'band',
            data: [
              'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
              'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
            ]
          }
        ]}
        series={[{ data: monthlyData }]}
        margin={{ top: 10, bottom: 20, left: 10, right: 10 }}
        sx={{
          width: '100%',
          maxWidth: '100%',
        }}
        
      />
    </div>
  </CardContent>
</Card>



      {/* Pie Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Application Status</CardTitle>
          </CardHeader>
          <CardContent className="h-36">
          <PieChart
              height={150}
              width={300} 
              series={[
                {
                  data: statusData,
                  innerRadius: 0,
                  outerRadius: 80,
                  paddingAngle: 0,
                  cornerRadius: 5,
                  // cx: 150, // half of width
                  // cy: 125, // half of height
                },
              ]}
          />

          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Work Type</CardTitle>
          </CardHeader>
          <CardContent className="h-52">
          <PieChart
              height={150}
              width={300} 
              series={[
                {
                  data: workTypeData,
                  innerRadius: 0,
                  outerRadius: 80,
                  paddingAngle: 0,
                  cornerRadius: 5,
                  // cx: 150, // half of width
                  // cy: 125, // half of height
                },
              ]}
          />

          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Job Type</CardTitle>
          </CardHeader>
          <CardContent className="h-36">
          <PieChart
              height={150}
              width={300} 
              series={[
                {
                  data: jobTypeData,
                  innerRadius: 0,
                  outerRadius: 80,
                  paddingAngle: 0,
                  cornerRadius: 5,
                  // cx: 150, // half of width
                  // cy: 125, // half of height
                },
              ]}
          />

          </CardContent>
        </Card>
      </div>
    </div>
  );
}