import { Controller, Get, Res } from '@nestjs/common';
import { AppService } from './app.service';
import type { Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // @Get('welcome')
  // preview(@Res() res: Response) {
  //   return res.render('passwordReset', {
  //     name: 'John Doe',
  //     email: 'john@example.com',
  //     password: 'Tech Hive Innovation',
  //   });
  // }

  // @Get('create')
  // previewCreate(@Res() res: Response) {
  //   return res.render('create', {
  //     name: 'John Doe',
  //     email: 'john@example.com',
  //     password: 'Tech Hive Innovation',
  //     companyName: 'John Doe',
  //   });
  // }
}
