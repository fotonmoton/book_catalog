import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Author } from './author.model';
import { AuthroResolver } from './author.resolver';
import { Book } from 'src/book/book.model';

@Module({
  imports: [
    // this two lines are repeated in multiple places
    TypeOrmModule.forFeature([Author]),
    TypeOrmModule.forFeature([Book]),
  ],
  providers: [AuthroResolver],
})
export class AuthorModule {}
