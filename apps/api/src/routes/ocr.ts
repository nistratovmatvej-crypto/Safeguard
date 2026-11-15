import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../plugins/auth.js';
import { createWorker } from 'tesseract.js';
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const allowed = new Set(['image/jpeg', 'image/png', 'image/webp']);
export async function ocrRoutes(app: FastifyInstance) {
  app.post('/ocr/receipt', { preHandler: requireAuth }, async (request, reply) => {
    const part = await request.file({ limits: { fileSize: MAX_IMAGE_BYTES, files: 1 } });
    if (!part) return reply.code(400).send({ error: 'IMAGE_REQUIRED' });
    if (!allowed.has(part.mimetype)) return reply.code(415).send({ error: 'UNSUPPORTED_IMAGE_TYPE' });
    const buffer = await part.toBuffer();
    let worker;
    try {
      worker = await createWorker(['eng', 'rus']);
      const result = await worker.recognize(buffer);
      return { text: result.data.text.trim(), confidence: Math.round(result.data.confidence) };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: 'OCR_FAILED' });
    } finally { await worker?.terminate(); }
  });
}
