import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import * as pdf from 'pdf-parse';
import { diskStorage } from 'multer';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const originalExtension = file.originalname.split('.').pop();
          cb(null, `${file.fieldname}-${uniqueSuffix}.${originalExtension}`);
        },
      }),
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CreateUserDto,
  ) {
    // Do something with the uploaded file
    const regex = /your-regex-pattern-here/g;
    const filePath = path.join('./uploads', file.filename);
    console.log(
      '🚀 ~ file: users.controller.ts:68 ~ UsersController ~ uploadFile ~ filePath:',
      filePath,
    );

    const dataBuffer = fs.readFileSync(filePath);
    const users = [];
    console.log(
      '🚀 ~ file: users.controller.ts:118 ~ UsersController ~ users=lines.map ~ body.jo:',
      body.jo,
    );

    const data = await pdf(dataBuffer);
    // number of pages
    // console.log(data.numpages);
    // // number of rendered pages
    // console.log(data.numrender);
    // // PDF info
    // console.log(data.info);
    // // PDF metadata
    // console.log(data.metadata);
    // // PDF.js version
    // // check https://mozilla.github.io/pdf.js/getting_started/
    // console.log(data.version);
    // PDF text
    // console.log(data.text);
    // split text by lines
    const lines = data.text.split('\n');
    // search for each line these format HAIRIDINE (Rahnna), née le 19/11/2021 à Saran (45770), EFF, 2022X 030684, dép. 045,
    // date:  19/11/2021
    const regexDate = /(\d{2}\/\d{2}\/\d{4})/g;

    // ref: 2022X 030684
    const regexRef = /(\d{4}[X]\s\d{6})/g;
    // pref:  dep. 045, , dép.075, dép. 092, dép. 093, dép. 094, dép. 095, dép. 971, dép. 972, dép. 973, dép. 974, dép. 976
    const regexPref = /(dép.\s\d{3})/g;
    for (const line of lines) {
      try {
        const dates = line.match(regexDate);
        const refs = line.match(regexRef);
        const prefs = line.match(regexPref);

        if (dates && refs && prefs) {
          const bearthday = dates[0];
          const ref = refs[0];
          const prefecture = prefs[0];
          const user = {
            ref,
            jo: body.jo,
            prefecture,
            bearthday,
          } as CreateUserDto;
          users.push(user);
          await this.usersService.create(user);
        }
      } catch (error) {
        console.log(
          '🚀 ~ file: users.controller.ts:126 ~ UsersController ~ lines.map ~ error:',
          error,
        );
      }
    }
    //delete file
    fs.unlinkSync(filePath);
    return { name: 'JO upload', status: 'success' };

    // const created = await this.usersService.createAll(users);
  }
}
