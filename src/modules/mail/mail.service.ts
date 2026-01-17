import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
    
    constructor(private mailerService: MailerService) { }

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
        });
    }
}
