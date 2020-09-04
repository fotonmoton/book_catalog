import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Author } from './author/author.model';
import { Book } from './book/book.model';
import { AuthorModule } from './author/author.module';
import { GraphQLModule } from '@nestjs/graphql';
import { BookModule } from './book/book.module';

// For the sake of simplicity we doesn't retrieve credentials from environment.
// Ideally credentials should be stored in secure place and passed by env.
const DatabaseModule = TypeOrmModule.forRoot({
  type: 'mysql',
  host: 'db',
  port: 3306,
  username: 'test',
  password: 'test',
  database: 'test',
  entities: [Author, Book],
  synchronize: true,
});

const GQLModule = GraphQLModule.forRoot({
  debug: true,
  playground: true,
  autoSchemaFile: true,
});

@Module({
  imports: [DatabaseModule, GQLModule, AuthorModule, BookModule],
})
export class AppModule {}
