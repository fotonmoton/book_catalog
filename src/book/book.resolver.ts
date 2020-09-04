import { Repository, Like } from 'typeorm';
import { Book, BOOK_AUTHORS_RELATION } from './book.model';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Resolver,
  Query,
  Args,
  ID,
  InputType,
  Field,
  Mutation,
  Int,
} from '@nestjs/graphql';
import { Author } from 'src/author/author.model';

@InputType()
class BookInput {
  @Field()
  title: string;

  @Field(() => [ID])
  authorIds: number[];
}

@Resolver(() => Book)
export class BookResolver {
  constructor(
    @InjectRepository(Book)
    private bookRepository: Repository<Book>,
    @InjectRepository(Author)
    private authorRepository: Repository<Author>,
  ) {}

  @Mutation(() => Book)
  async createBook(@Args('book') { title, authorIds }: BookInput) {
    const authors = await this.authorRepository.findByIds(authorIds);
    const book = new Book();
    book.title = title;
    book.authors = authors;
    return this.bookRepository.save(book);
  }

  @Mutation(() => Int)
  async deleteBook(@Args('id', { type: () => ID }) id: number) {
    return (await this.bookRepository.delete({ id })).affected || 0;
  }

  // Not sure about location of this method. Maybe it should be in some
  // common resolver because of multiple
  // dependencies: (author and book repositories)
  @Mutation(() => Book)
  async addAuthor(
    @Args('bookId', { type: () => ID }) bookId: number,
    @Args('authorId', { type: () => ID }) authorId: number,
  ) {
    const book = await this.bookRepository.findOne(bookId, {
      relations: [BOOK_AUTHORS_RELATION],
    });
    const author = await this.authorRepository.findOne(authorId);

    // because signature of GraphQL mutation this method should always return
    // Book type even if there is no existing book or author:
    // addAuthor(bookId: ID!, authorId: ID!): Book!
    if (!book || !author) {
      const stubBook = new Book();
      stubBook.id = -1;
      stubBook.title = '';
      return stubBook;
    }

    book[BOOK_AUTHORS_RELATION].push(author);
    return this.bookRepository.save(book);
  }

  @Query(() => Book, { nullable: true })
  async getBook(@Args('id', { type: () => ID }) id: number) {
    return this.bookRepository.findOne({
      where: { id },
      // We load authors eagerly to make sure that query with authors doesn't
      // fail
      relations: [BOOK_AUTHORS_RELATION],
    });
  }

  // can't execute arbitrary deep query. At 2 level of recursion can't get
  // authors relation. I think, if there is a need for deeper query,
  // realtion can be written as 'authors.books.authors....'
  @Query(() => [Book])
  async getBooks(@Args('title') title: string) {
    return this.bookRepository.find({
      where: { title: Like(`${title}`) },
      relations: [`${BOOK_AUTHORS_RELATION}`],
    });
  }
}
