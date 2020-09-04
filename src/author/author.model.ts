import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Book } from 'src/book/book.model';
import { ObjectType, Field, ID } from '@nestjs/graphql';

export const AUTHOR_BOOKS_RELATION = 'books';

@ObjectType()
@Entity()
export class Author {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  firstName: string;

  @Field()
  @Column()
  lastName: string;

  @Field(() => [Book])
  @ManyToMany(() => Book, (book) => book.authors)
  @JoinTable()
  [AUTHOR_BOOKS_RELATION]: Book[];
}
