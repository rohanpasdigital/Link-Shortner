import { Module } from '@nestjs/common';
// import { LinksController } from '../modules/links/links.controller';
// import { LinksService } from '../modules/links/links.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Link, LinkSchema } from 'src/database/mongo/schema/link.schema';
import { Click, ClickSchema } from 'src/database/mongo/schema/click.schema';
import { LinksController } from './links.controller';
import { LinksService } from './links.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Link.name, schema: LinkSchema },
      { name: Click.name, schema: ClickSchema },
    ]),
  ],
  controllers: [LinksController],
  providers: [LinksService]
})
export class LinksModule {}
