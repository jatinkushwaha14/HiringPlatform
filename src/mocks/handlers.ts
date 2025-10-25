import { http, HttpResponse } from 'msw';

// Mock API endpoints for TalentFlow
export const handlers = [
  // Jobs API
  http.get('/api/jobs', () => {
    return HttpResponse.json({
      success: true,
      data: [],
      message: 'Jobs fetched successfully'
    }, { delay: 300 });
  }),

  http.post('/api/jobs', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      success: true,
      data: { id: Date.now(), ...body },
      message: 'Job created successfully'
    }, { delay: 500 });
  }),

  http.put('/api/jobs/:id', async ({ request, params }) => {
    const body = await request.json();
    return HttpResponse.json({
      success: true,
      data: { id: params.id, ...body },
      message: 'Job updated successfully'
    }, { delay: 400 });
  }),

  http.delete('/api/jobs/:id', () => {
    return HttpResponse.json({
      success: true,
      message: 'Job deleted successfully'
    }, { delay: 300 });
  }),

  // Candidates API
  http.get('/api/candidates', () => {
    return HttpResponse.json({
      success: true,
      data: [],
      message: 'Candidates fetched successfully'
    }, { delay: 400 });
  }),

  http.put('/api/candidates/:id/stage', async ({ request, params }) => {
    const body = await request.json();
    return HttpResponse.json({
      success: true,
      data: { id: params.id, stage: body },
      message: 'Candidate stage updated successfully'
    }, { delay: 300 });
  }),

  // Assessments API
  http.get('/api/assessments', () => {
    return HttpResponse.json({
      success: true,
      data: [],
      message: 'Assessments fetched successfully'
    }, { delay: 350 });
  }),

  http.post('/api/assessments', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      success: true,
      data: { id: Date.now(), ...body },
      message: 'Assessment created successfully'
    }, { delay: 600 });
  }),

  http.put('/api/assessments/:id', async ({ request, params }) => {
    const body = await request.json();
    return HttpResponse.json({
      success: true,
      data: { id: params.id, ...body },
      message: 'Assessment updated successfully'
    }, { delay: 500 });
  }),

  http.delete('/api/assessments/:id', () => {
    return HttpResponse.json({
      success: true,
      message: 'Assessment deleted successfully'
    }, { delay: 300 });
  }),

  // Assessment Responses API
  http.post('/api/assessments/:id/responses', async ({ request, params }) => {
    const body = await request.json();
    return HttpResponse.json({
      success: true,
      data: { id: Date.now(), assessmentId: params.id, ...body },
      message: 'Assessment response submitted successfully'
    }, { delay: 800 });
  }),

  // Error simulation (10% chance)
  http.get('/api/*', () => {
    if (Math.random() < 0.1) {
      return HttpResponse.json({
        success: false,
        message: 'Internal server error'
      }, { status: 500 });
    }
    return HttpResponse.json({ success: true });
  })
];
