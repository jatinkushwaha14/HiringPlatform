import { http, HttpResponse, delay } from 'msw';
import { db } from '../services/database';
import type { Job, Candidate, Assessment, AssessmentResponse, QuestionResponseValue } from '../types';

function randomLatency() {
  return 200 + Math.floor(Math.random() * 1000); // 200–1200ms
}

function maybeFailWrite() {
  // 8% failure rate
  if (Math.random() < 0.08) {
    return true;
  }
  return false;
}

// Mock API endpoints for TalentFlow
export const handlers = [
  // Jobs API
  http.get('/api/jobs', async ({ request }) => {
    await delay(randomLatency());

    const url = new URL(request.url);
    const search = (url.searchParams.get('search') || '').toLowerCase();
    const status = url.searchParams.get('status') || '';
    const tagsParam = url.searchParams.get('tags') || '';
    const page = Number(url.searchParams.get('page') || '1');
    const pageSize = Number(url.searchParams.get('pageSize') || '10');
    const sort = url.searchParams.get('sort') || 'order';

    let jobs = await db.jobs.toArray();

    if (search) {
      jobs = jobs.filter(j =>
        j.title.toLowerCase().includes(search) ||
        j.tags.some(t => t.toLowerCase().includes(search))
      );
    }
    if (status && status !== 'all') {
      jobs = jobs.filter(j => j.status === status);
    }
    if (tagsParam) {
      const selected = tagsParam.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
      if (selected.length > 0) {
        jobs = jobs.filter(j => j.tags.some(t => selected.includes(t.toLowerCase())));
      }
    }

    // sort by 'order' (default) or '-createdAt' etc.
    const desc = sort.startsWith('-');
    const sortKey = desc ? sort.slice(1) : sort;
    jobs.sort((a: Job, b: Job) => {
      const va = a[sortKey as keyof Job] as unknown as string | number;
      const vb = b[sortKey as keyof Job] as unknown as string | number;
      if (va === vb) return 0;
      return (va > vb ? 1 : -1) * (desc ? -1 : 1);
    });

    const total = jobs.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const items = jobs.slice(start, end);

    return HttpResponse.json({
      success: true,
      data: { items, total, page, pageSize },
      message: 'Jobs fetched successfully'
    });
  }),

  http.post('/api/jobs', async ({ request }) => {
    await delay(randomLatency());
    if (maybeFailWrite()) {
      return HttpResponse.json({ success: false, message: 'Random write failure' }, { status: 500 });
    }
    const body = (await request.json()) as Omit<Job, 'id' | 'createdAt' | 'updatedAt'>;

    // Unique slug validation
    const existing = await db.jobs.where('slug').equals(body.slug).first();
    if (existing) {
      return HttpResponse.json({ success: false, message: 'Slug must be unique' }, { status: 409 });
    }

    const job: Job = {
      ...body,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Job;
    await db.jobs.add(job);

    return HttpResponse.json({
      success: true,
      data: job,
      message: 'Job created successfully'
    });
  }),

  http.patch('/api/jobs/:id', async ({ request, params }) => {
    await delay(randomLatency());
    if (maybeFailWrite()) {
      return HttpResponse.json({ success: false, message: 'Random write failure' }, { status: 500 });
    }
    const id = params.id as string;
    const updates = (await request.json()) as Partial<Job>;

    // If slug is changing, ensure unique
    if (updates.slug) {
      const conflict = await db.jobs
        .where('slug')
        .equals(updates.slug)
        .filter(j => j.id !== id)
        .first();
      if (conflict) {
        return HttpResponse.json({ success: false, message: 'Slug must be unique' }, { status: 409 });
      }
    }

    await db.jobs.update(id, { ...updates, updatedAt: new Date().toISOString() });
    const saved = await db.jobs.get(id);
    if (!saved) {
      return HttpResponse.json({ success: false, message: 'Job not found' }, { status: 404 });
    }
    return HttpResponse.json({ success: true, data: saved, message: 'Job updated successfully' });
  }),

  // Reorder endpoint accepts fromOrder and toOrder, and updates order across affected jobs
  http.patch('/api/jobs/:id/reorder', async ({ request }) => {
    await delay(randomLatency());
    // Higher failure chance to test rollback
    if (maybeFailWrite()) {
      return HttpResponse.json({ success: false, message: 'Reorder failed' }, { status: 500 });
    }
    const { fromOrder, toOrder } = (await request.json()) as { fromOrder: number; toOrder: number };
    if (fromOrder === toOrder) {
      return HttpResponse.json({ success: true, data: null, message: 'No change' });
    }

    const all = await db.jobs.orderBy('order').toArray();
    const moving = all.find(j => j.order === fromOrder);
    if (!moving) {
      return HttpResponse.json({ success: false, message: 'Source order not found' }, { status: 400 });
    }

    // Remove moving and insert at new index
    const list = all.sort((a, b) => a.order - b.order);
    const oldIdx = list.findIndex(j => j.id === moving.id);
    const newIdx = Math.max(0, Math.min(list.length - 1, toOrder - 1));
    list.splice(oldIdx, 1);
    list.splice(newIdx, 0, moving);

    // Re-number orders starting at 1
    for (let i = 0; i < list.length; i++) {
      if (list[i].order !== i + 1) {
        await db.jobs.update(list[i].id, { order: i + 1, updatedAt: new Date().toISOString() });
      }
    }

    const updated = await db.jobs.orderBy('order').toArray();
    return HttpResponse.json({ success: true, data: updated, message: 'Reordered successfully' });
  }),

  // Candidates API
  http.get('/api/candidates', async ({ request }) => {
    await delay(randomLatency());
    const url = new URL(request.url);
    const search = (url.searchParams.get('search') || '').toLowerCase();
    const stage = url.searchParams.get('stage') || '';
    const page = Number(url.searchParams.get('page') || '1');
    const pageSize = Number(url.searchParams.get('pageSize') || '25');

    let items = await db.candidates.toArray();
    if (search) {
      items = items.filter(c =>
        c.name.toLowerCase().includes(search) ||
        c.email.toLowerCase().includes(search)
      );
    }
    if (stage && stage !== 'all') {
      items = items.filter(c => c.stage === stage);
    }
    const total = items.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paged = items.slice(start, end);

    return HttpResponse.json({ success: true, data: { items: paged, total, page, pageSize }, message: 'Candidates fetched successfully' });
  }),

  http.put('/api/candidates/:id/stage', async ({ request, params }) => {
    await delay(randomLatency());
    if (maybeFailWrite()) {
      return HttpResponse.json({ success: false, message: 'Random write failure' }, { status: 500 });
    }
    const id = params.id as string;
    const { stage } = (await request.json()) as { stage: Candidate['stage'] };
    const now = new Date().toISOString();
    await db.candidates.update(id, { stage, updatedAt: now });
    // append timeline event
    const timelineKey = `timeline:${id}`;
    const existingRaw = localStorage.getItem(timelineKey);
    const existing = existingRaw ? JSON.parse(existingRaw) as Array<{ type: string; at: string; stage?: string }> : [];
    existing.unshift({ type: 'stage_change', at: now, stage });
    localStorage.setItem(timelineKey, JSON.stringify(existing.slice(0, 100)));
    return HttpResponse.json({ success: true, data: { id, stage }, message: 'Candidate stage updated successfully' });
  }),

  // Candidate timeline API (frontend-only via localStorage)
  http.get('/api/candidates/:id/timeline', async ({ params }) => {
    await delay(randomLatency());
    const id = params.id as string;
    const timelineKey = `timeline:${id}`;
    const existingRaw = localStorage.getItem(timelineKey);
    const items = existingRaw ? JSON.parse(existingRaw) as Array<{ type: string; at: string; stage?: string }> : [];
    return HttpResponse.json({ success: true, data: items, message: 'Timeline fetched' });
  }),

  // Assessments API
  http.get('/api/assessments', async ({ request }) => {
    await delay(randomLatency());
    const url = new URL(request.url);
    const jobId = url.searchParams.get('jobId');
    const items = jobId
      ? await db.assessments.where('jobId').equals(jobId).toArray()
      : await db.assessments.toArray();
    return HttpResponse.json({ success: true, data: items, message: 'Assessments fetched successfully' });
  }),

  http.post('/api/assessments', async ({ request }) => {
    await delay(randomLatency());
    if (maybeFailWrite()) return HttpResponse.json({ success: false, message: 'Random write failure' }, { status: 500 });
    const body = await request.json();
    const now = new Date().toISOString();
    const assessment = { id: crypto.randomUUID(), createdAt: now, updatedAt: now, ...(body as object) } as Assessment;
    await db.assessments.add(assessment as Assessment);
    return HttpResponse.json({ success: true, data: assessment, message: 'Assessment created successfully' });
  }),

  http.put('/api/assessments/:id', async ({ request, params }) => {
    await delay(randomLatency());
    if (maybeFailWrite()) return HttpResponse.json({ success: false, message: 'Random write failure' }, { status: 500 });
    const body = await request.json();
    const id = params.id as string;
    const updated = { ...(body as object), updatedAt: new Date().toISOString() };
    await db.assessments.update(id, updated);
    const saved = await db.assessments.get(id);
    if (!saved) return HttpResponse.json({ success: false, message: 'Assessment not found' }, { status: 404 });
    return HttpResponse.json({ success: true, data: saved, message: 'Assessment updated successfully' });
  }),

  http.delete('/api/assessments/:id', async ({ params }) => {
    await delay(randomLatency());
    if (maybeFailWrite()) return HttpResponse.json({ success: false, message: 'Random write failure' }, { status: 500 });
    const id = params.id as string;
    await db.assessments.delete(id);
    return HttpResponse.json({ success: true, data: null, message: 'Assessment deleted successfully' });
  }),

  // Assessment Responses API (submit via jobId as per spec)
  http.post('/api/assessments/:jobId/submit', async ({ request }) => {
    await delay(randomLatency());
    if (maybeFailWrite()) return HttpResponse.json({ success: false, message: 'Random write failure' }, { status: 500 });
    const body = (await request.json()) as { assessmentId: string; candidateId: string; responses: Record<string, unknown> };
    const response: AssessmentResponse = {
      id: crypto.randomUUID(),
      assessmentId: body.assessmentId,
      candidateId: body.candidateId,
      responses: body.responses as Record<string, QuestionResponseValue>,
      submittedAt: new Date().toISOString(),
    };
    await db.assessmentResponses.put(response as AssessmentResponse);
    return HttpResponse.json({ success: true, data: response, message: 'Assessment response submitted successfully' });
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
