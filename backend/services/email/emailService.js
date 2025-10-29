import { Resend } from 'resend';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url'
import fs from 'fs';



dotenv.config({ path: '../../.env' });

const resend = new Resend(process.env.RESEND_API_KEY);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TemplateDirectory = path.join(__dirname, "..", "..", ".." , "email-templates")

const templates = {
    booking_confirmation : {
        file : "booking-confirmation.html",
        subject : 'Appointment Booking Confirmation - MedCare Clinic',
        from : 'bookings@splitsol.tech'
    },

    appointment_confirmed : {
        file : "appointment-confirmed.html",
        subject : 'Appointment Confirmed - MedCare Clinic',
        from : 'appointments@splitsol.tech'
    },

    appointment_rescheduled : {
        file : "appointment-rescheduled.html",
        subject : 'Appointment Rescheduled - MedCare Clinic',
        from : 'appointments@splitsol.tech'
    },

    appointment_cancelled : {
        file : "appointment-cancelled.html",
        subject : 'Appointment Cancelled - MedCare Clinic',
        from : 'appointments@splitsol.tech'
    },

    appointment_reminder : {
        file : "appointment-reminder.html",
        subject : 'Appointment Reminder - MedCare Clinic',
        from : 'reminders@splitsol.tech'
    },

    prescription_email: {
        file: 'prescription_email.html',
        subject: 'Your Prescription Details - MedCare Clinic',
        from : 'prescriptions@splitsol.tech'
    },
    
    pharmacy_bill: {
        file: 'pharmacy_bill.html',
        subject: 'Your Pharmacy Bill and Receipt - MedCare Clinic',
        from : 'pharmacy@splitsol.tech'
      },
}

    
const getTemplate =  (type) => {
    const template = templates[type];

    if(!template) {
        console.error(`Template ${type} not found`);
        return null;
    }

    return template;
}
const fillDetails = (emailHtml, data) => {

    return emailHtml.replace(/{{(.*?)}}/g, (_,key) => {
        const value = data[key.trim()];
        return value || '';
    });
}

export const sendEmail = async (type, to , data) => {
     const template = getTemplate(type);

     const filePath = path.join(TemplateDirectory, template.file);

     let emailHtml = fs.readFileSync(filePath, 'utf-8');

     if(!emailHtml) {
        console.error(`Failed to read template file ${filePath}`);
        return null;
     }

     emailHtml = fillDetails(emailHtml, data);

     try{
        
        
        const {data, error} = await resend.emails.send({
            from: template.from,
            to: to,
            subject: template.subject,
            html: emailHtml,
        });

        if(error) {
            console.error(error);
        }
        console.log("Email Service: Email Sent Successfully:");
        console.log(data);

        
     }catch(error){
        console.error('Error sending email:', error);
        throw error;
     }

}



