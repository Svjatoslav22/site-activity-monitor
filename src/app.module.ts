import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config'; // 👈 Додали модуль для .env
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MonitorsModule } from './monitors/monitors.module';
// import { MonitorsModule } from './monitors/monitors.module';
import { ChecksModule } from './checks/checks.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { ScheduleModule } from '@nestjs/schedule';
@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client'), // Вказуємо на папку public
      exclude: ['/monitors(.*)'], // Важливо: API-запити не повинні перехоплюватися статикою
    }),
    ConfigModule.forRoot({
      isGlobal: true, // 👈 Робимо модуль доступним глобально
    }),
    MongooseModule.forRoot(process.env.DB_URL!),

    MonitorsModule,

    ChecksModule,

    SchedulerModule, // 👈 Додали MonitorsModule
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
