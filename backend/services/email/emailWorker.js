import { Worker } from 'bullmq';
import { Redis } from 'ioredis';
import { sendEmail } from './emailService.js'

const connection = new Redis({maxRetriesPerRequest:null});

export const emailWorker = new Worker("emailQueue", async (job) => {
    console.log('Email worker received new job');

    const {template, to, data} = job.data;

    try {
        await sendEmail(template, to, data);
        console.log('Email sent successfully');
    }catch(error){
        console.error('Error processing email job:', error);
        throw error;
    }

}, {connection});


emailWorker.on('error', (error) => {
    console.error('Email worker error:', error);
    throw error;
});

emailWorker.on('completed', (job) => {
    console.log('Email job completed:', job.id);
});

emailWorker.on('closed', () => {
    console.log('Email worker closed');
});


