import { Queue } from 'bullmq';
import { Redis } from 'ioredis';

const connection = new Redis();

export const queue = new Queue("emailQueue", {connection});