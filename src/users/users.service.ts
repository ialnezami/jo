import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './entities/user.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private UserModel: Model<UserDocument>,
  ) {}
  async create(createUserDto: CreateUserDto) {
    // search for existing user

    const user = await this.UserModel.findOne({ ref: createUserDto.ref });
    if (user) {
      if (createUserDto.email) {
        user.email = createUserDto.email;
        // if (user.jo === null) user.jo = 'Pas encore naturalisé';
        await user.save();
        if (user.jo !== null) {
          // user.jo = createUserDto.jo;
          // await user.save();
          //TODO: send email
        }
      }

      return user;
    }

    const createdUser = new this.UserModel(createUserDto);
    return await createdUser.save();
  }
  async createAll(createUserDto: CreateUserDto[]) {
    // search for existing user
    const createdUser = await this.UserModel.insertMany(createUserDto);
    return createdUser;
  }

  async findAll() {
    return this.UserModel.find().exec();
  }

  async findOne(id: string) {
    return await this.UserModel.find({ ref: id });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    return this.UserModel.updateOne({ ref: id }, updateUserDto);
  }

  async remove(ref: string) {
    // return await this.UserModel.deleteOne({ ref: ref });
    //delete all
    // return await this.UserModel.deleteMany({});
    return;
  }
}
