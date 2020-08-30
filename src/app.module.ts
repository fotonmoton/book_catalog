import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Author } from './author/author.entity';
import { Book } from './book/book.entity';
import { AuthorModule } from './author/author.module';

// For the sake of simplicity we doesn't retrieve credentials from environment.
// Ideally credentials should be stored in secure place and passed by env.
const DatabaseModule = TypeOrmModule.forRoot({
  type: 'mysql',
  host: '0.0.0.0',
  port: 3306,
  username: 'test',
  password: 'test',
  database: 'test',
  entities: [Author, Book],
  synchronize: true,
});

@Module({
  imports: [DatabaseModule, AuthorModule],
})
export class AppModule {}
