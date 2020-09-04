import {
  Resolver,
  Query,
  Args,
  ID,
  Mutation,
  InputType,
  Field,
  Int,
} from '@nestjs/graphql';
import { Author, AUTHOR_BOOKS_RELATION } from './author.model';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { BOOK_AUTHORS_RELATION, Book } from 'src/book/book.model';

@InputType()
class AuthorInput {
  @Field()
  firstName: string;

  @Field()
  lastName: string;
}

// We can abstract out data retrieving logic via some "service" but for
// this small use case I use database repository directrly.
@Resolver(() => Author)
export class AuthroResolver {
  constructor(
    @InjectRepository(Author)
    private authorRepository: Repository<Author>,
    @InjectRepository(Book)
    private bookRepository: Repository<Book>,
  ) {}

  @Mutation(() => Author)
  async createAuthor(@Args('author') { firstName, lastName }: AuthorInput) {
    const author = new Author();
    author.firstName = firstName;
    author.lastName = lastName;
    return this.authorRepository.save(author);
  }

  @Mutation(() => Int)
  async deleteAuthor(@Args('id', { type: () => ID }) id: number) {
    return (await this.authorRepository.delete({ id })).affected || 0;
  }

  // definitely candidate for seperate function/class
  @Mutation(() => Int)
  async deleteAuthorWithBooks(@Args('id', { type: () => ID }) id: number) {
    const bookAlias = 'books';
    const authorAlias = 'authors';

    // this subquery needed to get all authors for
    // the book where current author is co-author
    // https://stackoverflow.com/questions/3395339/sql-how-do-i-query-a-many-to-many-relationship
    const authorBookIds = this.authorRepository
      .createQueryBuilder(authorAlias)
      .leftJoinAndSelect(
        `${authorAlias}.${AUTHOR_BOOKS_RELATION}`,
        AUTHOR_BOOKS_RELATION,
        `${authorAlias}.id = :id`,
        { id },
      )
      .select(`${AUTHOR_BOOKS_RELATION}.id`);

    const booksWithAllCoAuthors = await this.bookRepository
      .createQueryBuilder(bookAlias)
      .leftJoinAndSelect(
        `${bookAlias}.${BOOK_AUTHORS_RELATION}`,
        BOOK_AUTHORS_RELATION,
      )
      .where(`${bookAlias}.id in (${authorBookIds.getQuery()})`)
      .setParameters(authorBookIds.getParameters())
      .getMany();

    const { toRemove, toUpdate } = booksWithAllCoAuthors.reduce<{
      toRemove: Book[];
      toUpdate: Book[];
    }>(
      ({ toRemove, toUpdate }, book) => {
        book[BOOK_AUTHORS_RELATION].length == 1
          ? toRemove.push(book)
          : toUpdate.push(book);
        return { toRemove: toRemove, toUpdate };
      },
      { toRemove: [], toUpdate: [] },
    );

    const withoutCurrentAuthor = toUpdate.map((book) => ({
      ...book,
      [BOOK_AUTHORS_RELATION]: book[BOOK_AUTHORS_RELATION].filter(
        (author) => author.id != id,
      ),
    }));

    const removedBooks = await this.bookRepository.remove(toRemove);
    const updatedBooks = await this.bookRepository.save(withoutCurrentAuthor);
    const removedAuthor = (await this.authorRepository.delete(id)).affected;

    return removedAuthor + removedBooks.length + updatedBooks.length;
  }

  @Query(() => Author, { nullable: true })
  async getAuthor(@Args('id', { type: () => ID }) id: number) {
    return this.authorRepository.findOne({
      where: { id },
      // to prevent round trip to db we can load relations eagerly
      relations: [AUTHOR_BOOKS_RELATION],
    });
  }

  // I think this method is too bulky for a resoler. Maybe this complex
  // query should be hidden in some data provider class.
  @Query(() => [Author])
  async getAuthors(
    @Args('minNumberOfBooks', { type: () => Int }) min: number,
    @Args('maxNumberOfBooks', { type: () => Int }) max: number,
  ) {
    const alias = 'author';
    return this.authorRepository
      .createQueryBuilder(alias)
      .leftJoinAndSelect(
        `${alias}.${AUTHOR_BOOKS_RELATION}`,
        AUTHOR_BOOKS_RELATION,
      )
      .groupBy(`${alias}.id, ${AUTHOR_BOOKS_RELATION}.id`)
      .having(`COUNT(${AUTHOR_BOOKS_RELATION}.id) >= :min`, { min })
      .andHaving(`COUNT(${AUTHOR_BOOKS_RELATION}.id) <= :max`, { max })
      .getMany();
  }
}
