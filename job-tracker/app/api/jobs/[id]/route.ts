// // app/api/jobs/[id]/route.ts
// import { NextResponse } from 'next/server';
// import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
// import { db } from '@/lib/firebase';
// import { auth } from '@clerk/nextjs/server';

// export async function GET(
//   request: Request,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     // Authenticate user
//     const { userId } = auth();
//     if (!userId) {
//       return NextResponse.json(
//         { error: 'Unauthorized' }, 
//         { status: 401 }
//       );
//     }

//     // Validate job ID
//     const jobId = params.id;
//     if (!jobId) {
//       return NextResponse.json(
//         { error: 'Job ID is required' },
//         { status: 400 }
//       );
//     }

//     // Fetch job from Firestore
//     const docRef = doc(db, 'users', userId, 'jobs', jobId);
//     const docSnap = await getDoc(docRef);

//     if (!docSnap.exists()) {
//       return NextResponse.json(
//         { error: 'Job not found' },
//         { status: 404 }
//       );
//     }

//     // Prepare response data
//     const jobData = {
//       id: docSnap.id,
//       company: docSnap.data().company,
//       position: docSnap.data().position,
//       status: docSnap.data().status,
//       dateApplied: docSnap.data().dateApplied?.toDate?.() || docSnap.data().dateApplied,
//       createdAt: docSnap.data().createdAt?.toDate?.() || docSnap.data().createdAt
//     };

//     return NextResponse.json(jobData, {
//       status: 200,
//       headers: {
//         'Content-Type': 'application/json',
//         'Access-Control-Allow-Origin': '*',
//         'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
//         'Access-Control-Allow-Headers': 'Content-Type, Authorization',
//       }
//     });

//   } catch (error) {
//     console.error('GET Error:', error);
//     return NextResponse.json(
//       { error: 'Internal Server Error' },
//       { status: 500 }
//     );
//   }
// }

// export async function PUT(
//   request: Request,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     // Authenticate user
//     const { userId } = auth();
//     if (!userId) {
//       return NextResponse.json(
//         { error: 'Unauthorized' }, 
//         { status: 401 }
//       );
//     }

//     // Validate job ID
//     const jobId = params.id;
//     if (!jobId) {
//       return NextResponse.json(
//         { error: 'Job ID is required' },
//         { status: 400 }
//       );
//     }

//     // Parse and validate request body
//     const body = await request.json();
//     if (!body.company || !body.position || !body.status) {
//       return NextResponse.json(
//         { error: 'Missing required fields (company, position, status)' },
//         { status: 400 }
//       );
//     }

//     // Update job in Firestore
//     const docRef = doc(db, 'users', userId, 'jobs', jobId);
//     await updateDoc(docRef, {
//       company: body.company,
//       position: body.position,
//       status: body.status,
//       updatedAt: serverTimestamp()
//     });

//     return NextResponse.json(
//       { success: true },
//       { 
//         status: 200,
//         headers: {
//           'Content-Type': 'application/json',
//           'Access-Control-Allow-Origin': '*',
//           'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
//           'Access-Control-Allow-Headers': 'Content-Type, Authorization',
//         }
//       }
//     );

//   } catch (error) {
//     console.error('PUT Error:', error);
//     return NextResponse.json(
//       { error: 'Internal Server Error' },
//       { status: 500 }
//     );
//   }
// }

// export async function OPTIONS() {
//   return NextResponse.json({}, {
//     headers: {
//       'Access-Control-Allow-Origin': '*',
//       'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
//       'Access-Control-Allow-Headers': 'Content-Type, Authorization',
//     }
//   });
// }



import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const docRef = doc(db, 'jobs', id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json({ id: docSnap.id, ...docSnap.data() });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch job' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const data = await request.json();

  try {
    const docRef = doc(db, 'jobs', id);
    await updateDoc(docRef, data);

    return NextResponse.json({ message: 'Job updated successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update job' }, { status: 500 });
  }
}
