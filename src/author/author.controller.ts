import { Controller, Get } from '@nestjs/common';
import { Author } from './author.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Book } from 'src/book/book.entity';

@Controller('authors')
export class AuthorController {
  constructor(
    @InjectRepository(Author)
    private authorRepository: Repository<Author>,
  ) {}

  @Get()
  findAll(): Promise<Author[]> {
    return this.authorRepository.find();
  }

  // to test entity creation right in the browser without additional hassle
  // we can use GET request. By REST conventions POST request should be used
  // for constructing new entites.
  @Get('create')
  async create(): Promise<Author> {
    const author = new Author();
    author.firstName = 'test';
    author.lastName = 'testing';
    const book = new Book();
    book.title = 'yet another book';
    author.books = [book];
    return this.authorRepository.save(author);
  }
}
