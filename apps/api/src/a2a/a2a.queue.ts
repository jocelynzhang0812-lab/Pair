/**
 * BullMQ queue for running A2A dialogues asynchronously.
 *
 * `POST /matches/:id/send` enqueues a job here and returns immediately; the
 * dialogue + summary are produced by a worker, and the client polls
 * `GET /a2a/:sessionId` (2s interval) until the session completes.
 */
export const DIALOGUE_QUEUE = 'a2a-dialogue';

export interface DialogueJobData {
  sessionId: string;
}
