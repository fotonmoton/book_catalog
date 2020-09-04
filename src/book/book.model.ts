import { Author } from 'src/author/author.model';
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';

// to prevent state where column names are out of sync
// with db query parameters we can use constant for relations.
export const BOOK_AUTHORS_RELATION = 'authors';

@ObjectType()
@Entity()
export class Book {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  // To achieve case insensitive character comparsion we can set collation to
  // UTF8_GENERAL_CI (assuming strings will be in utf8)
  // https://stackoverflow.com/a/2876820/3175823
  @Field()
  @Column({ collation: 'UTF8_GENERAL_CI' })
  title: string;

  @Field(() => [Author])
  @ManyToMany(() => Author, (author) => author.books)
  [BOOK_AUTHORS_RELATION]: Author[];
}
