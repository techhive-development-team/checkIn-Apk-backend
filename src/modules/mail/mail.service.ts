import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {

    constructor(private mailerService: MailerService) { }

    async sendResetPasswordMail(
        to: string,
        name: string,
        email: string,
        password: string,
    ) {
        await this.mailerService.sendMail({
            to,
            subject: 'Your account password is reset.',
            template: 'passwordReset',
            context: {
                name,
                email,
                password,
            },
        }).then(() => {
            console.log('Account creation email sent successfully');
        }).catch((error) => {
            console.error('Error sending account creation email:', error);
        });
    }

    async sendAccountCreateMail(
        to: string,
        name: string,
        email: string,
        password: string,
        companyName: string
    ) {
        await this.mailerService.sendMail({
            to,
            subject: 'Your account has been created',
            template: 'create',
            context: {
                name,
                email,
                password,
                companyName
            },
        }).then(() => {
            console.log('Account creation email sent successfully');
        }).catch((error) => {
            console.error('Error sending account creation email:', error);
        });
    }
}
