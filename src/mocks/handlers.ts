import { http, HttpResponse, delay } from 'msw';

// Mock API endpoints for TalentFlow
export const handlers = [
  // Jobs API
  http.get('/api/jobs', async () => {
    await delay(300);
    return HttpResponse.json({
      success: true,
      data: [],
      message: 'Jobs fetched successfully'
    });
  }),

  http.post('/api/jobs', async ({ request }) => {
    const body = await request.json();
    await delay(500);
    return HttpResponse.json({
      success: true,
      data: { id: Date.now(), ...(body as object) },
      message: 'Job created successfully'
    });
  }),

  http.put('/api/jobs/:id', async ({ request, params }) => {
    const body = await request.json();
    await delay(400);
    return HttpResponse.json({
      success: true,
      data: { id: params.id, ...(body as object) },
      message: 'Job updated successfully'
    });
  }),

  http.delete('/api/jobs/:id', async () => {
    await delay(300);
    return HttpResponse.json({
      success: true,
      message: 'Job deleted successfully'
    });
  }),

  // Candidates API
  http.get('/api/candidates', async () => {
    await delay(400);
    return HttpResponse.json({
      success: true,
      data: [],
      message: 'Candidates fetched successfully'
    });
  }),

  http.put('/api/candidates/:id/stage', async ({ request, params }) => {
    const body = await request.json();
    await delay(300);
    return HttpResponse.json({
      success: true,
      data: { id: params.id, stage: body },
      message: 'Candidate stage updated successfully'
    });
  }),

  // Assessments API
  http.get('/api/assessments', async () => {
    await delay(350);
    return HttpResponse.json({
      success: true,
      data: [],
      message: 'Assessments fetched successfully'
    });
  }),

  http.post('/api/assessments', async ({ request }) => {
    const body = await request.json();
    await delay(600);
    return HttpResponse.json({
      success: true,
      data: { id: Date.now(), ...(body as object) },
      message: 'Assessment created successfully'
    });
  }),

  http.put('/api/assessments/:id', async ({ request, params }) => {
    const body = await request.json();
    await delay(500);
    return HttpResponse.json({
      success: true,
      data: { id: params.id, ...(body as object) },
      message: 'Assessment updated successfully'
    });
  }),

  http.delete('/api/assessments/:id', async () => {
    await delay(300);
    return HttpResponse.json({
      success: true,
      message: 'Assessment deleted successfully'
    });
  }),

  // Assessment Responses API
  http.post('/api/assessments/:id/responses', async ({ request, params }) => {
    const body = await request.json();
    await delay(800);
    return HttpResponse.json({
      success: true,
      data: { id: Date.now(), assessmentId: params.id, ...(body as object) },
      message: 'Assessment response submitted successfully'
    });
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
