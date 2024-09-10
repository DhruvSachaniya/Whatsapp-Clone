import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Group } from './entities/group.entity';
import { Repository } from 'typeorm';
import { GroupMeassageDto } from './dto/group-meassage.dto';
import { GroupMessage } from './entities/group-chat.entity';
import { GroupMeassageChatDto } from './dto/group-chat.dto';

@Injectable({})
export class GroupService {
    constructor(
        @InjectRepository(Group)
        private readonly grouprepository: Repository<Group>,
        @InjectRepository(GroupMessage)
        private readonly groupmeassagerepo: Repository<GroupMessage>,
    ) {}

    //TODO:- Invite and Join Group

    async create_group(user: any, group_name: string) {
        // will require who is creating group, and group name
        try {
            const date = new Date();

            const group = new Group({
                owner: user.id,
                group_name: group_name,
                meassages: [],
                members: [],
                Created_At: date,
            });

            if (!group) {
                throw new HttpException('', HttpStatus.FORBIDDEN);
            }

            await this.grouprepository.save(group);

            return group;
        } catch (error) {
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async join_group(user: any, group_id: number) {
        // will require group id, who wann join group
        try {
            const update_group = await this.grouprepository.findOneBy({
                id: group_id,
            });

            update_group.members.push(user.id);

            await this.grouprepository.save(update_group);

            return update_group;
        } catch (error) {
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async leave_group(user: any, group_id: number) {
        try {
            const delete_from_group = await this.grouprepository.findOneBy({
                id: group_id,
            });

            if (!delete_from_group) {
                throw new HttpException(
                    `didn't find group!`,
                    HttpStatus.NOT_FOUND,
                );
            }

            const index = delete_from_group.members.indexOf(user.id);

            delete_from_group.members.splice(index, 1);

            await this.grouprepository.save(delete_from_group);

            return delete_from_group;
        } catch (error) {
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async meassaging_group(user: any, dto: GroupMeassageDto) {
        try {
            const find_group = await this.grouprepository.findOneBy({
                id: dto.Group_id,
            });

            if (!find_group) {
                throw new HttpException(
                    `Didn't find group`,
                    HttpStatus.NOT_FOUND,
                );
            }
            if (!find_group.owner === user.id) {
                if (!find_group.members.includes(user.id)) {
                    throw new HttpException(
                        `you have no right to meassage in this group`,
                        HttpStatus.NOT_ACCEPTABLE,
                    );
                }
            }
            const date = new Date();
            console.log(dto.Group_id, user.id);

            const Create_New_Meassage = new GroupMessage({
                owner: user.id,
                message: dto.meassage,
                group: Number(dto.Group_id) as null,
                createdAt: date,
            });
            await this.groupmeassagerepo.save(Create_New_Meassage);

            find_group.meassages.push(Create_New_Meassage.id);

            await this.grouprepository.save(find_group);
        } catch (error) {
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async get_group() {
        return;
    }

    async get_group_meassage(user: any, group_id: number) {
        try {
            // will user has to part of the group, or either it has to be owner,
            const find_group = await this.groupmeassagerepo.find({
                where: {
                    group: { id: Number(group_id) },
                },
                relations: {
                    owner: true,
                    group: true,
                },
                cache: true,
            });

            if (!find_group) {
                throw new HttpException(
                    `Didn't find group`,
                    HttpStatus.NOT_FOUND,
                );
            }

            const group = find_group[0];

            if (!group.owner === user.id) {
                if (!group.group.members.includes(user.id)) {
                    throw new HttpException(
                        `You ain't in this group!`,
                        HttpStatus.BAD_REQUEST,
                    );
                }
            }

            return find_group;
        } catch (error) {
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async delete_meassage_group(user: any, dto: GroupMeassageChatDto) {
        // will require who want to delete, by which group, and which meassage
        try {
            const find_group = await this.grouprepository.findOneBy({
                id: dto.group_id,
            });

            if (find_group.owner.id !== user.id) {
                if (!find_group.members.includes(user.id)) {
                    throw new HttpException(
                        `no Right to this group`,
                        HttpStatus.FORBIDDEN,
                    );
                }
            }

            //user can't delete everyone meassages in group, meassage can be delete by one side
            //TODO-Implement: create visible or notvisible boolean for meassage
        } catch (error) {
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async delete_group(user: any, group_id: number) {
        try {
            const find_group = await this.grouprepository.find({
                where: {
                    id: group_id,
                },
                relations: {
                    owner: true,
                },
                cache: true,
            });

            const group = find_group[0];

            if (group.owner.id !== user.id) {
                throw new HttpException(
                    `group can be delete by owner only!`,
                    HttpStatus.NOT_ACCEPTABLE,
                );
            }

            await this.grouprepository.remove(find_group);
        } catch (error) {
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
