import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from './book.model';
import { BookResolver } from './book.resolver';
import { Author } from 'src/author/author.model';

@Module({
  imports: [
    TypeOrmModule.forFeature([Book]),
    TypeOrmModule.forFeature([Author]),
  ],
  providers: [BookResolver],
})
export class BookModule {}
